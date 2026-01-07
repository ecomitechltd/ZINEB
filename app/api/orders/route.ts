import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { orderProfiles, queryProfiles, getPackages, priceToUSD, bytesToGB, getCountryName } from '@/lib/esim-api'

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

    // Fetch package details to get price
    const { packageList } = await getPackages({
      packageCode: packageCode || '',
      slug: slug || '',
    })

    const pkg = packageList.find(p => p.packageCode === packageCode || p.slug === slug)
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    const priceUSD = priceToUSD(pkg.price)
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
          // Increment usage count
          await prisma.promoCode.update({
            where: { id: promo.id },
            data: { usedCount: { increment: 1 } },
          })
        }
      }
    }

    const discountAmount = (priceUSD * discount) / 100
    const totalPrice = priceUSD - discountAmount
    const totalPriceCents = Math.round(totalPrice * 100)

    // Generate unique transaction ID
    const transactionId = `esimfly-${session.user.id}-${Date.now()}`

    // Get country info from location
    const locationCode = pkg.location.split(',')[0].trim()
    const countryName = getCountryName(locationCode)
    const dataGB = bytesToGB(pkg.volume)

    // Create order in our database first
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: 'PENDING',
        total: totalPriceCents,
        currency: 'USD',
        promoCode: promoCode || null,
        discount: Math.round(discountAmount * 100),
        country: locationCode,
        countryName,
        planName: `${dataGB >= 1 ? `${dataGB}GB` : `${Math.round(dataGB * 1024)}MB`} / ${pkg.duration} days`,
        dataAmount: dataGB >= 1 ? `${dataGB}GB` : `${Math.round(dataGB * 1024)}MB`,
        validity: pkg.duration,
      },
    })

    try {
      // Order from eSIM Access API
      const orderResult = await orderProfiles({
        transactionId,
        amount: pkg.price, // API uses value * 10,000
        packageInfoList: [{
          packageCode: pkg.packageCode,
          count: 1,
          price: pkg.price,
        }],
      })

      // Update order with eSIM Access order number
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          stripePaymentId: orderResult.orderNo, // Using this field for eSIM Access orderNo
        },
      })

      // Poll for eSIM profile (may take up to 30 seconds)
      let esimProfile = null
      let attempts = 0
      const maxAttempts = 10

      while (!esimProfile && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000)) // Wait 3 seconds
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
        // Create eSIM record in our database
        await prisma.eSim.create({
          data: {
            userId: session.user.id,
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

        return NextResponse.json({
          success: true,
          orderId: order.id,
          esim: {
            iccid: esimProfile.iccid,
            qrCodeUrl: esimProfile.qrCodeUrl,
            activationCode: esimProfile.ac,
            expiresAt: esimProfile.expiredTime,
          },
        })
      } else {
        // eSIM not ready yet, return order info
        return NextResponse.json({
          success: true,
          orderId: order.id,
          message: 'Order placed. eSIM is being provisioned.',
          esimAccessOrderNo: orderResult.orderNo,
        })
      }
    } catch (apiError) {
      // Rollback order status
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'FAILED' },
      })
      throw apiError
    }
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    )
  }
}

// Get order details
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('id')

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId, userId: session.user.id },
        include: { esim: true },
      })

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      return NextResponse.json(order)
    }

    // Return all orders for the user
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: { esim: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
