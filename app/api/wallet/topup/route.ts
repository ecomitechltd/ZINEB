import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe'

const BASE_URL = process.env.NEXTAUTH_URL || 'https://e-sim.vip'
const IS_DEV = process.env.NODE_ENV === 'development'

// Check if we should use dummy payment mode
const useDummyPayment = () => IS_DEV && !process.env.STRIPE_SECRET_KEY

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount } = body // Amount in dollars

    // Validate amount (min $1, max $2000)
    if (!amount || amount < 1 || amount > 2000) {
      return NextResponse.json(
        { error: 'Amount must be between $1 and $2,000' },
        { status: 400 }
      )
    }

    const amountCents = Math.round(amount * 100)
    const referenceId = `TOPUP-${session.user.id.slice(-6)}-${Date.now()}`

    // Get current balance for the transaction record
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create pending transaction
    const transaction = await prisma.walletTransaction.create({
      data: {
        userId: session.user.id,
        type: 'TOPUP',
        amount: amountCents,
        balance: user.credits, // Will be updated after payment
        description: `Wallet top-up: $${amount.toFixed(2)}`,
        referenceId,
        status: 'PENDING',
      },
    })

    // DUMMY PAYMENT MODE: Skip Stripe and redirect directly to callback
    if (useDummyPayment()) {
      console.log('[DEV] Using dummy payment mode for wallet top-up')
      const dummyRedirectUrl = `${BASE_URL}/api/wallet/topup/callback?transactionId=${transaction.id}&dummy=true`

      return NextResponse.json({
        success: true,
        transactionId: transaction.id,
        redirectUrl: dummyRedirectUrl,
        isDummy: true,
        message: 'You will be redirected to complete payment. After successful payment, funds will be added to your wallet.',
      })
    }

    if (!stripe) {
      await prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      })

      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Wallet top-up' },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        transactionId: transaction.id,
        userId: session.user.id,
        referenceId,
        type: 'WALLET_TOPUP',
      },
      success_url: `${BASE_URL}/api/wallet/topup/callback?transactionId=${transaction.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/dashboard?tab=wallet&canceled=true`,
    })

    if (!checkoutSession.url) {
      await prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      })

      return NextResponse.json({ error: 'Unable to start Stripe checkout' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      redirectUrl: checkoutSession.url,
      message: 'You will be redirected to complete payment. After successful payment, funds will be added to your wallet.',
    })

  } catch (error) {
    console.error('Wallet topup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Top-up failed' },
      { status: 500 }
    )
  }
}
