import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

// GET /api/admin/esims - List all eSIMs with filters
export async function GET(request: NextRequest) {
  const adminResult = await requireAdmin()
  if ('error' in adminResult) return adminResult.error

  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status') || ''
  const country = searchParams.get('country') || ''
  const search = searchParams.get('search') || ''
  const isGifted = searchParams.get('isGifted')
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  const where = {
    ...(status && { status: status as 'INACTIVE' | 'ACTIVE' | 'EXPIRED' | 'DEPLETED' }),
    ...(country && { country }),
    ...(isGifted !== null && isGifted !== undefined && { isGifted: isGifted === 'true' }),
    ...(search && {
      OR: [
        { iccid: { contains: search, mode: 'insensitive' as const } },
        { user: { email: { contains: search, mode: 'insensitive' as const } } },
        { giftedToEmail: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [esims, total, statusCounts] = await Promise.all([
    prisma.eSim.findMany({
      where,
      select: {
        id: true,
        iccid: true,
        status: true,
        country: true,
        countryName: true,
        planName: true,
        dataUsed: true,
        dataLimit: true,
        expiresAt: true,
        activatedAt: true,
        isGifted: true,
        giftedToEmail: true,
        giftedToName: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        order: {
          select: {
            id: true,
            total: true,
            status: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.eSim.count({ where }),
    prisma.eSim.groupBy({
      by: ['status'],
      _count: true,
    }),
  ])

  // Convert BigInt to number for JSON serialization
  const serializedEsims = esims.map(esim => ({
    ...esim,
    dataUsed: Number(esim.dataUsed),
    dataLimit: Number(esim.dataLimit),
    dataUsedGB: Number(esim.dataUsed) / (1024 * 1024 * 1024),
    dataLimitGB: Number(esim.dataLimit) / (1024 * 1024 * 1024),
    usagePercent: Number(esim.dataLimit) > 0
      ? Math.round((Number(esim.dataUsed) / Number(esim.dataLimit)) * 100)
      : 0,
  }))

  return NextResponse.json({
    esims: serializedEsims,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    statusCounts: statusCounts.reduce((acc, item) => {
      acc[item.status] = item._count
      return acc
    }, {} as Record<string, number>),
  })
}
