import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'

const G2PAY_SIGNING_KEY = process.env.G2PAY_SIGNING_KEY || 'fLWeMSP1UjG9'

// Verify HMAC-SHA256 signature from G2Pay
function verifySignature(payload: string, signature: string | null): boolean {
  if (!signature) {
    console.warn('No signature provided in webhook request')
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', G2PAY_SIGNING_KEY)
    .update(payload)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature.toLowerCase()),
      Buffer.from(expectedSignature.toLowerCase())
    )
  } catch {
    return false
  }
}

// G2Pay webhook handler for async payment notifications
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('Signature')

    // Verify signature if signing key is configured
    if (G2PAY_SIGNING_KEY && G2PAY_SIGNING_KEY !== 'YOUR_SIGNING_KEY') {
      if (!verifySignature(rawBody, signature)) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
      console.log('Webhook signature verified successfully')
    }

    const body = JSON.parse(rawBody)

    // Log webhook payload for debugging
    console.log('G2Pay webhook received:', JSON.stringify(body, null, 2))

    const { referenceId, status, transactionId } = body

    if (!referenceId) {
      return NextResponse.json({ error: 'Missing reference ID' }, { status: 400 })
    }

    // Find order by G2Pay reference (stored in stripePaymentId field)
    const order = await prisma.order.findFirst({
      where: { stripePaymentId: referenceId },
    })

    if (!order) {
      console.error('Order not found for reference:', referenceId)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Handle different payment statuses
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
      case 'SUCCESS':
      case 'APPROVED':
        if (order.status === 'PENDING') {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'PAID' },
          })
        }
        break

      case 'DECLINED':
      case 'FAILED':
      case 'REJECTED':
        if (order.status === 'PENDING') {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'FAILED' },
          })
        }
        break

      case 'REFUNDED':
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'REFUNDED' },
        })
        break

      default:
        console.log('Unhandled G2Pay status:', status)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
