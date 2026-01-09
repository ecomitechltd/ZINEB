import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

// GET /api/admin/orders - List all orders with filters
export async function GET(request: NextRequest) {
  const adminResult = await requireAdmin()
  if ('error' in adminResult) return adminResult.error

  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status') || ''
  const country = searchParams.get('country') || ''
  const search = searchParams.get('search') || ''
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  const where = {
    ...(status && { status: status as 'PENDING' | 'PAID' | 'COMPLETED' | 'FAILED' | 'REFUNDED' }),
    ...(country && { country }),
    ...(search && {
      OR: [
        { id: { contains: search, mode: 'insensitive' as const } },
        { user: { email: { contains: search, mode: 'insensitive' as const } } },
        { user: { name: { contains: search, mode: 'insensitive' as const } } },
      ],
    }),
    ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
    ...(dateTo && { createdAt: { lte: new Date(dateTo) } }),
  }

  const [orders, total, revenueStats] = await Promise.all([
    prisma.order.findMany({
      where,
      select: {
        id: true,
        status: true,
        total: true,
        discount: true,
        promoCode: true,
        country: true,
        countryName: true,
        planName: true,
        dataAmount: true,
        validity: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        esim: {
          select: {
            id: true,
            iccid: true,
            status: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
    prisma.order.aggregate({
      _sum: { total: true, discount: true },
      _count: true,
      where: {
        ...where,
        status: { in: ['PAID', 'COMPLETED'] },
      },
    }),
  ])

  return NextResponse.json({
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    summary: {
      totalRevenue: revenueStats._sum.total || 0,
      totalDiscount: revenueStats._sum.discount || 0,
      paidOrders: revenueStats._count,
    },
  })
}
