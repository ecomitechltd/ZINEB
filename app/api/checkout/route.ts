import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getPackages, priceToUSD, bytesToGB, getCountryName, orderProfiles, queryProfiles } from '@/lib/esim-api'
import { sendPurchaseEmail } from '@/lib/email'
import { notifyPurchase } from '@/lib/telegram'
import { getSettings } from '@/lib/admin'

const BASE_URL = process.env.NEXTAUTH_URL || 'https://e-sim.vip'

// Apply markup to price
function applyMarkup(price: number, markupPercent: number): number {
  const markup = price * (markupPercent / 100)
  return Math.round((price + markup) * 100) / 100
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { packageCode, slug, promoCode } = body

    if (!packageCode && !slug) {
      return NextResponse.json({ error: 'Package code or slug required' }, { status: 400 })
    }

    // Fetch package details and settings in parallel
    const [{ packageList }, settings] = await Promise.all([
      getPackages({
        packageCode: packageCode || '',
        slug: slug || '',
      }),
      getSettings(),
    ])

    const pkg = packageList.find(p => p.packageCode === packageCode || p.slug === slug)
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    // Apply markup to price
    const markupPercent = settings.markupPercent || 0
    const basePriceUSD = priceToUSD(pkg.price)
    const priceUSD = applyMarkup(basePriceUSD, markupPercent)
    let discount = 0

    // Check promo code
    if (promoCode) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCode.toUpperCase() },
      })

      if (promo && promo.active) {
        const now = new Date()
        if ((!promo.validUntil || promo.validUntil > now) &&
            (!promo.maxUses || promo.usedCount < promo.maxUses)) {
          discount = promo.discount
        }
      }
    }

    const discountAmount = (priceUSD * discount) / 100
    const totalPrice = priceUSD - discountAmount
    const totalPriceCents = Math.round(totalPrice * 100)

    // Get user's wallet balance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has enough balance
    if (user.credits < totalPriceCents) {
      return NextResponse.json({
        error: 'insufficient_balance',
        required: totalPriceCents,
        current: user.credits,
        shortfall: totalPriceCents - user.credits,
        shortfallFormatted: `$${((totalPriceCents - user.credits) / 100).toFixed(2)}`,
        message: `Insufficient wallet balance. You need $${((totalPriceCents - user.credits) / 100).toFixed(2)} more.`,
      }, { status: 402 })
    }

    // Get country info from location
    const locationCode = pkg.location.split(',')[0].trim()
    const countryName = getCountryName(locationCode)
    const dataGB = bytesToGB(pkg.volume)

    // Generate unique reference ID
    const referenceId = `VIP eSim-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Deduct from wallet and create order in a transaction
    const newBalance = user.credits - totalPriceCents

    const [order] = await prisma.$transaction([
      // Create order
      prisma.order.create({
        data: {
          userId: session.user.id,
          status: 'PAID', // Paid immediately from wallet
          total: totalPriceCents,
          currency: 'USD',
          promoCode: promoCode || null,
          discount: Math.round(discountAmount * 100),
          country: locationCode,
          countryName,
          planName: `${dataGB >= 1 ? `${dataGB}GB` : `${Math.round(dataGB * 1024)}MB`} / ${pkg.duration} days`,
          dataAmount: dataGB >= 1 ? `${dataGB}GB` : `${Math.round(dataGB * 1024)}MB`,
          validity: pkg.duration,
          stripePaymentId: referenceId,
        },
      }),
      // Deduct from wallet
      prisma.user.update({
        where: { id: session.user.id },
        data: { credits: newBalance },
      }),
      // Create wallet transaction
      prisma.walletTransaction.create({
        data: {
          userId: session.user.id,
          type: 'PURCHASE',
          amount: -totalPriceCents, // Negative for debit
          balance: newBalance,
          description: `eSIM Purchase: ${countryName} - ${dataGB >= 1 ? `${dataGB}GB` : `${Math.round(dataGB * 1024)}MB`}`,
          referenceId,
          status: 'COMPLETED',
        },
      }),
    ])

    // Increment promo code usage if applied
    if (promoCode && discount > 0) {
      await prisma.promoCode.updateMany({
        where: { code: promoCode.toUpperCase() },
        data: { usedCount: { increment: 1 } },
      })
    }

    // Now provision the eSIM
    try {
      const transactionId = `VIP eSim-${order.userId}-${Date.now()}`

      // Order from eSIM Access API
      const orderResult = await orderProfiles({
        transactionId,
        amount: pkg.price,
        packageInfoList: [{
          packageCode: pkg.packageCode,
          count: 1,
          price: pkg.price,
        }],
      })

      // Poll for eSIM profile
      let esimProfile = null
      let attempts = 0
      const maxAttempts = 10

      while (!esimProfile && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000))
        attempts++

        try {
          const queryResult = await queryProfiles({
            orderNo: orderResult.orderNo,
            pager: { pageNum: 1, pageSize: 10 },
          })

          if (queryResult.esimList && queryResult.esimList.length > 0) {
            esimProfile = queryResult.esimList[0]
          }
        } catch {
          // Profile not ready yet, continue polling
        }
      }

      if (esimProfile) {
        // Create eSIM record
        await prisma.eSim.create({
          data: {
            userId: order.userId,
            orderId: order.id,
            iccid: esimProfile.iccid,
            qrCode: esimProfile.qrCodeUrl,
            activationCode: esimProfile.ac,
            status: 'INACTIVE',
            dataUsed: BigInt(0),
            dataLimit: BigInt(esimProfile.totalVolume),
            expiresAt: new Date(esimProfile.expiredTime),
            country: locationCode,
            countryName,
            planName: `${dataGB >= 1 ? `${dataGB}GB` : `${Math.round(dataGB * 1024)}MB`} / ${pkg.duration} days`,
          },
        })

        // Update order status to completed
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'COMPLETED' },
        })

        // Send purchase confirmation email (don't block response on email failure)
        sendPurchaseEmail({
          email: session.user.email!,
          name: session.user.name || session.user.email!.split('@')[0],
          orderId: order.id,
          country: countryName,
          planName: `${dataGB >= 1 ? `${dataGB}GB` : `${Math.round(dataGB * 1024)}MB`} / ${pkg.duration} days`,
          dataAmount: dataGB >= 1 ? `${dataGB}GB` : `${Math.round(dataGB * 1024)}MB`,
          validity: pkg.duration,
          total: totalPriceCents,
          qrCodeUrl: esimProfile.qrCodeUrl,
          activationCode: esimProfile.ac || undefined,
        }).catch((err) => console.error('Failed to send purchase email:', err))

        // Send Telegram notification (don't block response)
        notifyPurchase({
          orderId: order.id,
          email: session.user.email!,
          country: countryName,
          planName: `${dataGB >= 1 ? `${dataGB}GB` : `${Math.round(dataGB * 1024)}MB`} / ${pkg.duration} days`,
          dataAmount: dataGB >= 1 ? `${dataGB}GB` : `${Math.round(dataGB * 1024)}MB`,
          validity: pkg.duration,
          total: totalPriceCents,
          status: 'COMPLETED',
        }).catch((err) => console.error('Failed to send Telegram purchase notification:', err))

        return NextResponse.json({
          success: true,
          orderId: order.id,
          message: 'Purchase successful! Your eSIM is ready.',
          newBalance,
          newBalanceFormatted: `$${(newBalance / 100).toFixed(2)}`,
        })
      } else {
        // eSIM not ready yet - order is paid but pending provisioning
        return NextResponse.json({
          success: true,
          orderId: order.id,
          message: 'Payment successful! Your eSIM is being provisioned and will be ready shortly.',
          newBalance,
          newBalanceFormatted: `$${(newBalance / 100).toFixed(2)}`,
          pending: true,
        })
      }
    } catch (apiError) {
      console.error('eSIM API error:', apiError)
      // Payment was taken but eSIM provisioning failed
      // Keep the order as PAID - support can manually provision
      return NextResponse.json({
        success: true,
        orderId: order.id,
        message: 'Payment successful! Your eSIM is being processed. Please check your orders page.',
        newBalance,
        newBalanceFormatted: `$${(newBalance / 100).toFixed(2)}`,
        pending: true,
      })
    }

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout failed' },
      { status: 500 }
    )
  }
}
