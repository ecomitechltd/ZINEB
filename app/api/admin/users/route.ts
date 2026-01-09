import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, logAdminAction } from '@/lib/admin'
import bcrypt from 'bcryptjs'

// GET /api/admin/users - List all users with pagination and search
export async function GET(request: NextRequest) {
  const adminResult = await requireAdmin()
  if ('error' in adminResult) return adminResult.error

  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const role = searchParams.get('role') || ''
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  const where = {
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(role && { role: role as 'USER' | 'ADMIN' }),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        credits: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            esims: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

// POST /api/admin/users - Create a new user
export async function POST(request: NextRequest) {
  const adminResult = await requireAdmin()
  if ('error' in adminResult) return adminResult.error

  try {
    const body = await request.json()
    const { email, name, password, role = 'USER', credits = 0 } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        credits,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        credits: true,
        createdAt: true,
      },
    })

    await logAdminAction(
      adminResult.user.id,
      'CREATE',
      'User',
      user.id,
      { email, name, role, credits }
    )

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
