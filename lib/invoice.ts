import { jsPDF } from 'jspdf'

interface InvoiceData {
  orderId: string
  orderDate: Date
  customerName: string
  customerEmail: string
  country: string
  planName: string
  dataAmount: string
  validity: number
  subtotal: number
  discount: number
  total: number
  promoCode?: string
}

export function generateInvoicePDF(data: InvoiceData): Buffer {
  const doc = new jsPDF()

  const primaryColor = [79, 70, 229] as [number, number, number] // Indigo
  const textColor = [26, 26, 26] as [number, number, number]
  const grayColor = [102, 102, 102] as [number, number, number]
  const lightGray = [200, 200, 200] as [number, number, number]

  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 45, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('eSIMFly', 20, 28)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('INVOICE', 170, 20)
  doc.text(`#${data.orderId.slice(-8).toUpperCase()}`, 170, 27)
  doc.text(formatDate(data.orderDate), 170, 34)

  // Company Info
  doc.setTextColor(...grayColor)
  doc.setFontSize(9)
  let y = 60
  doc.text('eSIMFly Limited', 20, y)
  doc.text('123 Digital Street', 20, y + 5)
  doc.text('London, UK EC1A 1BB', 20, y + 10)
  doc.text('support@esimfly.me', 20, y + 15)

  // Bill To
  doc.setTextColor(...textColor)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('BILL TO', 120, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...grayColor)
  doc.text(data.customerName, 120, y + 7)
  doc.text(data.customerEmail, 120, y + 14)

  // Divider
  y = 100
  doc.setDrawColor(...lightGray)
  doc.setLineWidth(0.5)
  doc.line(20, y, 190, y)

  // Table Header
  y = 115
  doc.setFillColor(248, 249, 250)
  doc.rect(20, y - 6, 170, 12, 'F')

  doc.setTextColor(...textColor)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('DESCRIPTION', 25, y)
  doc.text('QTY', 120, y)
  doc.text('PRICE', 145, y)
  doc.text('AMOUNT', 170, y)

  // Table Content
  y = 135
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...textColor)
  doc.setFontSize(10)
  doc.text(`${data.country} eSIM`, 25, y)
  doc.setFontSize(8)
  doc.setTextColor(...grayColor)
  doc.text(`${data.planName}`, 25, y + 5)
  doc.text(`${data.dataAmount} - ${data.validity} days`, 25, y + 10)

  doc.setTextColor(...textColor)
  doc.setFontSize(10)
  doc.text('1', 125, y)
  doc.text(`$${(data.subtotal / 100).toFixed(2)}`, 145, y)
  doc.text(`$${(data.subtotal / 100).toFixed(2)}`, 170, y)

  // Subtotals
  y = 170
  doc.setDrawColor(...lightGray)
  doc.line(120, y, 190, y)

  y = 182
  doc.setFontSize(9)
  doc.setTextColor(...grayColor)
  doc.text('Subtotal', 120, y)
  doc.setTextColor(...textColor)
  doc.text(`$${(data.subtotal / 100).toFixed(2)}`, 170, y)

  if (data.discount > 0) {
    y += 10
    doc.setTextColor(34, 197, 94) // Green
    doc.text(`Discount${data.promoCode ? ` (${data.promoCode})` : ''}`, 120, y)
    doc.text(`-$${(data.discount / 100).toFixed(2)}`, 170, y)
  }

  // Total
  y += 15
  doc.setDrawColor(...lightGray)
  doc.line(120, y - 5, 190, y - 5)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...textColor)
  doc.text('Total', 120, y + 3)
  doc.setTextColor(...primaryColor)
  doc.text(`$${(data.total / 100).toFixed(2)}`, 165, y + 3)

  // Payment Status
  y += 25
  doc.setFillColor(220, 252, 231) // Light green
  doc.roundedRect(120, y - 5, 70, 15, 3, 3, 'F')
  doc.setTextColor(22, 163, 74) // Green
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('PAID', 150, y + 3, { align: 'center' })

  // Footer
  y = 260
  doc.setDrawColor(...lightGray)
  doc.line(20, y, 190, y)

  doc.setTextColor(...grayColor)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Thank you for choosing eSIMFly!', 105, y + 8, { align: 'center' })
  doc.text('For support, visit esimfly.me/help or email support@esimfly.me', 105, y + 14, { align: 'center' })

  // Return as buffer
  const arrayBuffer = doc.output('arraybuffer')
  return Buffer.from(arrayBuffer)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
