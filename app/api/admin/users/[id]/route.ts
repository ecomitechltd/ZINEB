import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, logAdminAction } from '@/lib/admin'
import bcrypt from 'bcryptjs'

// GET /api/admin/users/[id] - Get user details with eSIMs and orders
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminResult = await requireAdmin()
  if ('error' in adminResult) return adminResult.error

  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      credits: true,
      isActive: true,
      referralCode: true,
      referredBy: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      esims: {
        select: {
          id: true,
          iccid: true,
          status: true,
          countryName: true,
          planName: true,
          dataUsed: true,
          dataLimit: true,
          expiresAt: true,
          isGifted: true,
          giftedToEmail: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      orders: {
        select: {
          id: true,
          status: true,
          total: true,
          countryName: true,
          planName: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      walletTransactions: {
        select: {
          id: true,
          type: true,
          amount: true,
          balance: true,
          description: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ user })
}

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminResult = await requireAdmin()
  if ('error' in adminResult) return adminResult.error

  const { id } = await params

  try {
    const body = await request.json()
    const { name, email, role, credits, isActive, password } = body

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (role !== undefined) updateData.role = role
    if (credits !== undefined) updateData.credits = credits
    if (isActive !== undefined) updateData.isActive = isActive
    if (password) updateData.password = await bcrypt.hash(password, 12)

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        credits: true,
        isActive: true,
        updatedAt: true,
      },
    })

    await logAdminAction(
      adminResult.user.id,
      'UPDATE',
      'User',
      id,
      { ...updateData, password: password ? '[REDACTED]' : undefined }
    )

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminResult = await requireAdmin()
  if ('error' in adminResult) return adminResult.error

  const { id } = await params

  // Prevent self-deletion
  if (id === adminResult.user.id) {
    return NextResponse.json(
      { error: 'Cannot delete your own account' },
      { status: 400 }
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await prisma.user.delete({ where: { id } })

    await logAdminAction(
      adminResult.user.id,
      'DELETE',
      'User',
      id,
      { email: user.email }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
