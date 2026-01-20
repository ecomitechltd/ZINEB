import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { notifyWalletTopup } from '@/lib/telegram'
import { stripe } from '@/lib/stripe'

const BASE_URL = process.env.NEXTAUTH_URL || 'https://e-sim.vip'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const transactionId = searchParams.get('transactionId')
    const isDummy = searchParams.get('dummy') === 'true'
    const stripeSessionId = searchParams.get('session_id')

    if (!transactionId) {
      return NextResponse.redirect(`${BASE_URL}/dashboard?tab=wallet&error=missing_transaction`)
    }

    // Fetch the transaction
    const transaction = await prisma.walletTransaction.findUnique({
      where: { id: transactionId },
      include: { user: true },
    })

    if (!transaction) {
      return NextResponse.redirect(`${BASE_URL}/dashboard?tab=wallet&error=transaction_not_found`)
    }

    // Check if already processed
    if (transaction.status === 'COMPLETED') {
      return NextResponse.redirect(`${BASE_URL}/dashboard?tab=wallet&success=true`)
    }

    if (transaction.status !== 'PENDING') {
      return NextResponse.redirect(`${BASE_URL}/dashboard?tab=wallet&error=invalid_status`)
    }

    if (isDummy) {
      console.log('[DEV] Processing dummy wallet top-up callback')
    } else if (stripeSessionId && stripe) {
      const session = await stripe.checkout.sessions.retrieve(stripeSessionId)

      if (session.payment_status !== 'paid') {
        await prisma.walletTransaction.update({
          where: { id: transactionId },
          data: { status: 'FAILED' },
        })

        return NextResponse.redirect(`${BASE_URL}/dashboard?tab=wallet&error=payment_declined`)
      }
    } else {
      return NextResponse.redirect(`${BASE_URL}/dashboard?tab=wallet&success=pending`)
    }

    // Update user credits and transaction in a transaction
    const newBalance = transaction.user.credits + transaction.amount

    await prisma.$transaction([
      // Update user credits
      prisma.user.update({
        where: { id: transaction.userId },
        data: { credits: newBalance },
      }),
      // Update transaction status and balance
      prisma.walletTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'COMPLETED',
          balance: newBalance,
        },
      }),
    ])

    console.log(`Wallet top-up completed: User ${transaction.userId} added $${(transaction.amount / 100).toFixed(2)}, new balance: $${(newBalance / 100).toFixed(2)}`)

    // Send Telegram notification (don't block redirect)
    notifyWalletTopup({
      email: transaction.user.email,
      amount: transaction.amount,
      newBalance,
      method: 'Stripe',
      status: 'Completed',
    }).catch((err) => console.error('Failed to send Telegram topup notification:', err))

    return NextResponse.redirect(`${BASE_URL}/dashboard?tab=wallet&success=topup&amount=${(transaction.amount / 100).toFixed(2)}`)

  } catch (error) {
    console.error('Wallet callback error:', error)
    return NextResponse.redirect(`${BASE_URL}/dashboard?tab=wallet&error=callback_failed`)
  }
}
