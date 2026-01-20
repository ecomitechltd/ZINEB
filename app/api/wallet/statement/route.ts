import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getSettings } from '@/lib/admin'
import { generateWalletStatementPDF } from '@/lib/invoice'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user with wallet transactions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        credits: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch wallet transactions
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    // Get business settings
    const settings = await getSettings()

    // Generate PDF
    const pdfBuffer = generateWalletStatementPDF(
      {
        customerName: user.name || 'Customer',
        customerEmail: user.email,
        currentBalance: user.credits,
        transactions: transactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          balance: t.balance,
          description: t.description,
          status: t.status,
          createdAt: t.createdAt,
        })),
        generatedAt: new Date(),
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
        'Content-Disposition': `attachment; filename="VIP eSim-Wallet-Statement-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Wallet statement generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate wallet statement' },
      { status: 500 }
    )
  }
}
