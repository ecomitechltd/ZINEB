import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

const G2PAY_API_URL = process.env.G2PAY_API_URL || 'https://engine.g2pay.io/api/v1'
const G2PAY_API_KEY = process.env.G2PAY_API_KEY || 'fLWeMSP1UjG9mEPczY292Djm2fSzuvVKLRAQANDWmc2r'
const BASE_URL = process.env.NEXTAUTH_URL || 'https://esimfly.me'
const IS_DEV = process.env.NODE_ENV === 'development'

// Check if we should use dummy payment mode
const useDummyPayment = () => IS_DEV || !G2PAY_API_KEY

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

    // DUMMY PAYMENT MODE: Skip G2Pay and redirect directly to callback
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

    // PRODUCTION: Create G2Pay checkout request
    const checkoutRequestData = {
      referenceId,
      paymentType: 'DEPOSIT',
      currency: 'USD',
      amount: amount.toFixed(2),
      returnUrl: `${BASE_URL}/dashboard?tab=wallet`,
      successReturnUrl: `${BASE_URL}/api/wallet/topup/callback?transactionId=${transaction.id}`,
      declineReturnUrl: `${BASE_URL}/dashboard?tab=wallet&error=payment_declined`,
      webhookUrl: `${BASE_URL}/api/wallet/topup/webhook`,
    }

    // Debug logging
    console.log('=== G2PAY DEBUG ===')
    console.log('G2PAY_API_URL:', G2PAY_API_URL)
    console.log('G2PAY_API_KEY length:', G2PAY_API_KEY?.length)
    console.log('G2PAY_API_KEY first 10 chars:', G2PAY_API_KEY?.substring(0, 10))
    console.log('G2PAY_API_KEY last 5 chars:', G2PAY_API_KEY?.slice(-5))
    console.log('Full URL:', `${G2PAY_API_URL}/payments`)
    console.log('Request body:', JSON.stringify(checkoutRequestData, null, 2))
    console.log('Authorization header:', `Bearer ${G2PAY_API_KEY?.substring(0, 10)}...${G2PAY_API_KEY?.slice(-5)}`)
    console.log('===================')

    const response = await fetch(`${G2PAY_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${G2PAY_API_KEY}`,
      },
      body: JSON.stringify(checkoutRequestData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('G2Pay API error:', errorText)
      console.error('Response status:', response.status)
      console.error('Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())))

      // Mark transaction as failed
      await prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      })

      return NextResponse.json(
        { error: 'Payment gateway error. Please try again.' },
        { status: 500 }
      )
    }

    const checkoutData = await response.json()

    if (!checkoutData.result?.redirectUrl) {
      console.error('G2Pay response missing redirect URL:', checkoutData)

      await prisma.walletTransaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      })

      return NextResponse.json(
        { error: 'Invalid payment gateway response' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      redirectUrl: checkoutData.result.redirectUrl,
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
