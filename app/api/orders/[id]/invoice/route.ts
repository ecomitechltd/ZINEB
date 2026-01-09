import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateInvoicePDF } from '@/lib/invoice'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Fetch order with user info
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: session.user.id,
        status: { in: ['PAID', 'COMPLETED'] },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Generate PDF
    const pdfBuffer = generateInvoicePDF({
      orderId: order.id,
      orderDate: order.createdAt,
      customerName: order.user.name || 'Customer',
      customerEmail: order.user.email,
      country: order.countryName,
      planName: order.planName,
      dataAmount: order.dataAmount,
      validity: order.validity,
      subtotal: order.total + order.discount,
      discount: order.discount,
      total: order.total,
      promoCode: order.promoCode || undefined,
    })

    // Return PDF as download
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="eSIMFly-Invoice-${order.id.slice(-8).toUpperCase()}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Invoice generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}
