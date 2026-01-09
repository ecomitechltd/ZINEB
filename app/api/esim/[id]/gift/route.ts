import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendGiftEsimEmail } from '@/lib/email'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { recipientEmail, recipientName, message } = body

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Recipient email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Fetch eSIM with order info
    const esim = await prisma.eSim.findFirst({
      where: {
        id,
        userId: session.user.id,
        status: 'INACTIVE', // Can only gift inactive eSIMs
        isGifted: false, // Can't re-gift
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        order: true,
      },
    })

    if (!esim) {
      return NextResponse.json(
        { error: 'eSIM not found or already gifted/activated' },
        { status: 404 }
      )
    }

    // Send gift email
    const emailResult = await sendGiftEsimEmail({
      recipientEmail,
      senderName: esim.user.name || 'A friend',
      recipientName,
      personalMessage: message,
      country: esim.countryName,
      planName: esim.planName,
      dataAmount: esim.order.dataAmount,
      validity: esim.order.validity,
      qrCodeUrl: esim.qrCode,
      activationCode: esim.activationCode || undefined,
    })

    if (!emailResult.success) {
      console.error('Failed to send gift email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send gift email' },
        { status: 500 }
      )
    }

    // Update eSIM with gift info
    await prisma.eSim.update({
      where: { id },
      data: {
        isGifted: true,
        giftedToEmail: recipientEmail,
        giftedToName: recipientName || null,
        giftMessage: message || null,
        giftedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: `eSIM gift sent to ${recipientEmail}`,
    })
  } catch (error) {
    console.error('Gift eSIM error:', error)
    return NextResponse.json(
      { error: 'Failed to send gift' },
      { status: 500 }
    )
  }
}
