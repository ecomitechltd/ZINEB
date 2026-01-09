import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'

// GET /api/admin/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  const adminResult = await requireAdmin()
  if ('error' in adminResult) return adminResult.error

  const searchParams = request.nextUrl.searchParams
  const period = searchParams.get('period') || '30' // days

  const periodDays = parseInt(period)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - periodDays)

  // Run all queries in parallel
  const [
    totalUsers,
    newUsers,
    totalOrders,
    recentOrders,
    totalRevenue,
    recentRevenue,
    totalEsims,
    activeEsims,
    ordersByStatus,
    topCountries,
    recentActivity,
  ] = await Promise.all([
    // Total users
    prisma.user.count(),

    // New users in period
    prisma.user.count({
      where: { createdAt: { gte: startDate } },
    }),

    // Total orders
    prisma.order.count(),

    // Recent orders in period
    prisma.order.count({
      where: { createdAt: { gte: startDate } },
    }),

    // Total revenue (from completed/paid orders)
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ['PAID', 'COMPLETED'] } },
    }),

    // Recent revenue in period
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ['PAID', 'COMPLETED'] },
        createdAt: { gte: startDate },
      },
    }),

    // Total eSIMs
    prisma.eSim.count(),

    // Active eSIMs
    prisma.eSim.count({
      where: { status: 'ACTIVE' },
    }),

    // Orders by status
    prisma.order.groupBy({
      by: ['status'],
      _count: true,
    }),

    // Top countries by order count
    prisma.order.groupBy({
      by: ['countryName'],
      _count: true,
      _sum: { total: true },
      where: { status: { in: ['PAID', 'COMPLETED'] } },
      orderBy: { _count: { countryName: 'desc' } },
      take: 10,
    }),

    // Recent activity (orders and users)
    prisma.order.findMany({
      select: {
        id: true,
        status: true,
        total: true,
        countryName: true,
        createdAt: true,
        user: {
          select: { email: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  // Calculate daily stats for chart
  const dailyStats = await prisma.$queryRaw`
    SELECT
      DATE(created_at) as date,
      COUNT(*) as orders,
      SUM(total) as revenue
    FROM "Order"
    WHERE created_at >= ${startDate}
      AND status IN ('PAID', 'COMPLETED')
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  ` as Array<{ date: Date; orders: bigint; revenue: bigint }>

  return NextResponse.json({
    overview: {
      totalUsers,
      newUsers,
      totalOrders,
      recentOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      recentRevenue: recentRevenue._sum.total || 0,
      totalEsims,
      activeEsims,
    },
    ordersByStatus: ordersByStatus.reduce((acc, item) => {
      acc[item.status] = item._count
      return acc
    }, {} as Record<string, number>),
    topCountries: topCountries.map(c => ({
      country: c.countryName,
      orders: c._count,
      revenue: c._sum.total || 0,
    })),
    recentActivity,
    dailyStats: dailyStats.map(d => ({
      date: d.date,
      orders: Number(d.orders),
      revenue: Number(d.revenue),
    })),
  })
}
