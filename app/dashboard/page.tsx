import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Fetch user's eSIMs from database
  const esims = await prisma.eSim.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  // Fetch user's orders from database
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  // Calculate stats
  const activeEsims = esims.filter(e => e.status === 'ACTIVE').length
  const countriesVisited = new Set(esims.map(e => e.countryName)).size
  // Total saved: estimate 30% savings vs roaming (total is in cents, convert to dollars)
  const totalSaved = orders.reduce((acc, order) => acc + ((order.total / 100) * 0.3), 0)

  // Map eSIM status from Prisma enum to UI status
  const mapStatus = (status: string): 'active' | 'pending' | 'expired' => {
    switch (status) {
      case 'ACTIVE': return 'active'
      case 'INACTIVE': return 'pending'
      case 'EXPIRED':
      case 'DEPLETED': return 'expired'
      default: return 'pending'
    }
  }

  return (
    <DashboardClient
      user={{
        name: session.user.name || 'Traveler',
        email: session.user.email || '',
      }}
      esims={esims.map(e => {
        // Convert bytes to GB
        const dataUsedGB = Number(e.dataUsed) / (1024 * 1024 * 1024)
        const dataTotalGB = Number(e.dataLimit) / (1024 * 1024 * 1024)

        return {
          id: e.id,
          country: e.countryName,
          flag: getCountryFlag(e.countryName),
          plan: e.planName,
          status: mapStatus(e.status),
          dataUsed: Math.round(dataUsedGB * 100) / 100,
          dataTotal: Math.round(dataTotalGB * 100) / 100,
          daysLeft: calculateDaysLeft(e.expiresAt),
          activatedAt: e.activatedAt?.toISOString() || null,
          qrCode: e.qrCode,
        }
      })}
      orders={orders.map(o => ({
        id: o.id,
        date: o.createdAt.toISOString().split('T')[0],
        country: o.countryName,
        flag: getCountryFlag(o.countryName),
        plan: o.planName,
        amount: o.total / 100, // Convert cents to dollars
        status: o.status.toLowerCase(),
      }))}
      stats={{
        activeEsims,
        countriesVisited,
        totalSaved: Math.round(totalSaved * 100) / 100,
      }}
    />
  )
}

function getCountryFlag(countryName: string): string {
  const flags: Record<string, string> = {
    'Japan': '🇯🇵',
    'United States': '🇺🇸',
    'Thailand': '🇹🇭',
    'United Kingdom': '🇬🇧',
    'France': '🇫🇷',
    'Germany': '🇩🇪',
    'South Korea': '🇰🇷',
    'Singapore': '🇸🇬',
    'Australia': '🇦🇺',
    'Canada': '🇨🇦',
    'Italy': '🇮🇹',
    'Spain': '🇪🇸',
  }
  return flags[countryName] || '🌍'
}

function calculateDaysLeft(expiresAt: Date): number {
  const now = new Date()
  const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, daysLeft)
}
