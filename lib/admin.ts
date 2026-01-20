import { NextResponse } from 'next/server'
import { auth } from './auth'
import { prisma } from './db'
import { unstable_cache } from 'next/cache'

// Helper to check if user is admin
export async function requireAdmin() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, email: true, name: true },
  })

  if (!user || user.role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) }
  }

  return { user }
}

// Log admin action
export async function logAdminAction(
  adminId: string,
  action: string,
  entity: string,
  entityId?: string,
  changes?: Record<string, unknown>,
  ipAddress?: string
) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId,
        action,
        entity,
        entityId,
        changes: changes ? JSON.stringify(changes) : null,
        ipAddress,
      },
    })
  } catch (error) {
    console.error('Failed to log admin action:', error)
  }
}

// Get or create default settings
const getSettingsCached = unstable_cache(
  async () => {
    const legacyAddress = '123 Digital Way, Tech City, TC 10001'
    const defaultAddress = '20-22 WenlockRoad , London . N1 7GU , UK'

    if (!process.env.DATABASE_URL) {
      return {
        id: 'default',
        markupPercent: 30,
        regionalMarkup: null,
        minOrderValue: 100,
        freeDataThreshold: 5000,
        freeDataBonus: 500,
        referralBonus: 500,
        refereeBonus: 200,
        businessName: 'VIP eSim',
        businessAddress: defaultAddress,
        businessEmail: 'support@e-sim.vip',
        businessPhone: '+1 (555) 123-4567',
        businessVAT: null,
        updatedAt: new Date(),
        updatedBy: null,
      }
    }

    const settings = await prisma.settings.findUnique({
      where: { id: 'default' },
    })

    if (!settings) {
      return {
        id: 'default',
        markupPercent: 30,
        regionalMarkup: null,
        minOrderValue: 100,
        freeDataThreshold: 5000,
        freeDataBonus: 500,
        referralBonus: 500,
        refereeBonus: 200,
        businessName: 'VIP eSim',
        businessAddress: defaultAddress,
        businessEmail: 'support@e-sim.vip',
        businessPhone: '+1 (555) 123-4567',
        businessVAT: null,
        updatedAt: new Date(),
        updatedBy: null,
      }
    }

    if (settings.businessAddress === legacyAddress) {
      return { ...settings, businessAddress: defaultAddress }
    }

    return settings
  },
  ['settings'],
  { revalidate: 300, tags: ['settings'] }
)

export async function getSettings() {
  return getSettingsCached()
}

// Apply markup to a base price
export async function applyMarkup(basePriceCents: number, countryCode?: string): Promise<number> {
  const settings = await getSettings()

  let markupPercent = settings.markupPercent

  // Check for regional markup override
  if (countryCode && settings.regionalMarkup) {
    try {
      const regionalMarkup = JSON.parse(settings.regionalMarkup)
      if (regionalMarkup[countryCode] !== undefined) {
        markupPercent = regionalMarkup[countryCode]
      }
    } catch {
      // Invalid JSON, use default
    }
  }

  const markup = Math.round(basePriceCents * (markupPercent / 100))
  return basePriceCents + markup
}
