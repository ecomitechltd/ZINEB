import { NextResponse } from 'next/server'
import { auth } from './auth'
import { prisma } from './db'

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
export async function getSettings() {
  let settings = await prisma.settings.findUnique({
    where: { id: 'default' },
  })

  if (!settings) {
    settings = await prisma.settings.create({
      data: { id: 'default' },
    })
  }

  return settings
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
