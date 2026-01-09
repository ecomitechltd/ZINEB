import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, logAdminAction, getSettings } from '@/lib/admin'

// GET /api/admin/settings - Get current settings
export async function GET() {
  const adminResult = await requireAdmin()
  if ('error' in adminResult) return adminResult.error

  const settings = await getSettings()

  // Parse regional markup JSON if present
  let regionalMarkup = {}
  if (settings.regionalMarkup) {
    try {
      regionalMarkup = JSON.parse(settings.regionalMarkup)
    } catch {
      // Invalid JSON
    }
  }

  return NextResponse.json({
    settings: {
      ...settings,
      regionalMarkup,
    },
  })
}

// PATCH /api/admin/settings - Update settings
export async function PATCH(request: NextRequest) {
  const adminResult = await requireAdmin()
  if ('error' in adminResult) return adminResult.error

  try {
    const body = await request.json()
    const {
      markupPercent,
      regionalMarkup,
      minOrderValue,
      freeDataThreshold,
      freeDataBonus,
      referralBonus,
      refereeBonus,
      businessName,
      businessAddress,
      businessEmail,
      businessPhone,
      businessVAT,
    } = body

    // Build update data
    const updateData: Record<string, unknown> = {
      updatedBy: adminResult.user.id,
    }

    if (markupPercent !== undefined) {
      if (markupPercent < 0 || markupPercent > 200) {
        return NextResponse.json(
          { error: 'Markup must be between 0% and 200%' },
          { status: 400 }
        )
      }
      updateData.markupPercent = markupPercent
    }

    if (regionalMarkup !== undefined) {
      // Validate regional markup is an object
      if (typeof regionalMarkup !== 'object') {
        return NextResponse.json(
          { error: 'Regional markup must be an object' },
          { status: 400 }
        )
      }
      updateData.regionalMarkup = JSON.stringify(regionalMarkup)
    }

    if (minOrderValue !== undefined) updateData.minOrderValue = minOrderValue
    if (freeDataThreshold !== undefined) updateData.freeDataThreshold = freeDataThreshold
    if (freeDataBonus !== undefined) updateData.freeDataBonus = freeDataBonus
    if (referralBonus !== undefined) updateData.referralBonus = referralBonus
    if (refereeBonus !== undefined) updateData.refereeBonus = refereeBonus

    // Business info fields
    if (businessName !== undefined) updateData.businessName = businessName
    if (businessAddress !== undefined) updateData.businessAddress = businessAddress
    if (businessEmail !== undefined) updateData.businessEmail = businessEmail
    if (businessPhone !== undefined) updateData.businessPhone = businessPhone
    if (businessVAT !== undefined) updateData.businessVAT = businessVAT

    const settings = await prisma.settings.upsert({
      where: { id: 'default' },
      update: updateData,
      create: { id: 'default', ...updateData },
    })

    await logAdminAction(
      adminResult.user.id,
      'UPDATE',
      'Settings',
      'default',
      updateData
    )

    // Parse regional markup for response
    let parsedRegionalMarkup = {}
    if (settings.regionalMarkup) {
      try {
        parsedRegionalMarkup = JSON.parse(settings.regionalMarkup)
      } catch {
        // Invalid JSON
      }
    }

    return NextResponse.json({
      settings: {
        ...settings,
        regionalMarkup: parsedRegionalMarkup,
      },
    })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
