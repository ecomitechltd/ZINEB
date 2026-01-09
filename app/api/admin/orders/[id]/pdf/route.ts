import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin, getSettings } from '@/lib/admin'
import { generateInvoicePDF } from '@/lib/invoice'

// GET /api/admin/orders/[id]/pdf - Generate PDF invoice for an order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminResult = await requireAdmin()
  if ('error' in adminResult) return adminResult.error

  const { id } = await params

  try {
    // Fetch order with user info
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Get business settings
    const settings = await getSettings()

    // Generate PDF using shared function
    const pdfBuffer = generateInvoicePDF(
      {
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
        status: order.status,
      },
      {
        businessName: settings.businessName,
        businessAddress: settings.businessAddress,
        businessEmail: settings.businessEmail,
        businessPhone: settings.businessPhone,
        businessVAT: settings.businessVAT,
      }
    )

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.id.slice(-8)}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
