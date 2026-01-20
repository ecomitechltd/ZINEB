import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { orderProfiles, queryProfiles, getPackages, bytesToGB, getCountryName } from '@/lib/esim-api'

const BASE_URL = process.env.NEXTAUTH_URL || 'https://e-sim.vip'
const IS_DEV = process.env.NODE_ENV === 'development'
const G2PAY_API_KEY = process.env.G2PAY_API_KEY || ''

// Check if we're in dummy payment mode
const isDummyMode = () => IS_DEV || !G2PAY_API_KEY

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')
    const packageCode = searchParams.get('packageCode')
    const isDummy = searchParams.get('dummy') === 'true'

    // Log dummy mode for debugging
    if (isDummy || isDummyMode()) {
      console.log('[DEV] Processing dummy payment callback')
    }

    if (!orderId) {
      return NextResponse.redirect(`${BASE_URL}/checkout?error=missing_order_id`)
    }

    // Fetch the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    })

    if (!order) {
      return NextResponse.redirect(`${BASE_URL}/checkout?error=order_not_found`)
    }

    // Check if order is already processed
    if (order.status === 'COMPLETED') {
      return NextResponse.redirect(`${BASE_URL}/account/orders?success=true`)
    }

    if (order.status !== 'PENDING') {
      return NextResponse.redirect(`${BASE_URL}/account/orders?error=invalid_order_status`)
    }

    // Mark as paid
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'PAID' },
    })

    // Fetch package details for eSIM ordering
    if (!packageCode) {
      return NextResponse.redirect(`${BASE_URL}/account/orders?warning=esim_pending`)
    }

    try {
      const { packageList } = await getPackages({
        packageCode: packageCode,
        slug: packageCode,
      })

      const pkg = packageList.find(p => p.packageCode === packageCode || p.slug === packageCode)
      if (!pkg) {
        console.error('Package not found for code:', packageCode)
        return NextResponse.redirect(`${BASE_URL}/account/orders?warning=package_not_found`)
      }

      // Generate transaction ID for eSIM Access
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

      const locationCode = pkg.location.split(',')[0].trim()
      const countryName = getCountryName(locationCode)
      const dataGB = bytesToGB(pkg.volume)

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

        return NextResponse.redirect(`${BASE_URL}/account/orders?success=true`)
      } else {
        // eSIM not ready yet - order is paid but pending provisioning
        return NextResponse.redirect(`${BASE_URL}/account/orders?warning=esim_provisioning`)
      }
    } catch (apiError) {
      console.error('eSIM API error:', apiError)
      // Payment successful but eSIM provisioning failed
      // Don't mark as failed - payment was received
      return NextResponse.redirect(`${BASE_URL}/account/orders?warning=esim_error`)
    }

  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(`${BASE_URL}/checkout?error=callback_failed`)
  }
}
