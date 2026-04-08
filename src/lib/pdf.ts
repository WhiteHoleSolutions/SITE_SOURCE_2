import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface InvoiceData {
  invoice: {
    invoiceNumber: string
    issuedAt: string | null
    dueDate: string | null
    status: string
    subtotal: number
    tax: number
    total: number
    paidAt: string | null
    notes: string | null
    items: Array<{
      description: string
      quantity: number
      unitPrice: number
      total: number
    }>
    customer: {
      user: {
        name: string
        email: string
        phone: string | null
      }
    }
  }
  businessInfo: {
    businessName: string
    abn: string | null
    acn: string | null
    address: string | null
    suburb: string | null
    state: string | null
    postcode: string | null
    country: string
    email: string | null
    phone: string | null
    website: string | null
    taxRate: number
    paymentTerms: string
  }
}

export function generateInvoicePDF(data: InvoiceData): jsPDF {
  const doc = new jsPDF()
  const { invoice, businessInfo } = data

  // Colors
  const primaryColor: [number, number, number] = [0, 113, 227] // #0071e3
  const darkColor: [number, number, number] = [29, 29, 31] // #1d1d1f
  const grayColor: [number, number, number] = [110, 110, 115] // #6e6e73

  // Page dimensions
  const pageWidth = doc.internal.pageSize.width
  const margin = 20

  // Header - Business Info
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text(businessInfo.businessName, margin, 20)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  let yPos = 28
  if (businessInfo.address) {
    const addressLine = [
      businessInfo.address,
      businessInfo.suburb,
      businessInfo.state,
      businessInfo.postcode,
    ]
      .filter(Boolean)
      .join(', ')
    doc.text(addressLine, margin, yPos)
    yPos += 4
  }
  if (businessInfo.phone || businessInfo.email) {
    const contactLine = [businessInfo.phone, businessInfo.email].filter(Boolean).join(' | ')
    doc.text(contactLine, margin, yPos)
  }

  // Invoice Title & Number
  yPos = 55
  doc.setTextColor(...darkColor)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', margin, yPos)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - margin, yPos, { align: 'right' })

  // Status Badge
  yPos += 2
  const statusColors: Record<string, [number, number, number]> = {
    PAID: [34, 197, 94], // green
    SENT: [59, 130, 246], // blue
    OVERDUE: [239, 68, 68], // red
    DRAFT: [156, 163, 175], // gray
    CANCELLED: [107, 114, 128], // dark gray
  }
  const statusColor = statusColors[invoice.status] || grayColor
  doc.setFillColor(...statusColor)
  doc.roundedRect(pageWidth - margin - 30, yPos, 30, 8, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(invoice.status, pageWidth - margin - 15, yPos + 5.5, { align: 'center' })

  // Bill To & Invoice Details
  yPos += 20
  doc.setTextColor(...darkColor)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('BILL TO:', margin, yPos)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  yPos += 6
  doc.text(invoice.customer.user.name, margin, yPos)
  yPos += 5
  doc.text(invoice.customer.user.email, margin, yPos)
  if (invoice.customer.user.phone) {
    yPos += 5
    doc.text(invoice.customer.user.phone, margin, yPos)
  }

  // Invoice Details (right side)
  yPos = 75
  doc.setFont('helvetica', 'bold')
  doc.text('Invoice Date:', pageWidth - margin - 60, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(
    invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString() : 'N/A',
    pageWidth - margin,
    yPos,
    { align: 'right' }
  )

  yPos += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Due Date:', pageWidth - margin - 60, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(
    invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A',
    pageWidth - margin,
    yPos,
    { align: 'right' }
  )

  yPos += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Payment Terms:', pageWidth - margin - 60, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(businessInfo.paymentTerms, pageWidth - margin, yPos, { align: 'right' })

  if (invoice.paidAt) {
    yPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('Paid Date:', pageWidth - margin - 60, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(
      new Date(invoice.paidAt).toLocaleDateString(),
      pageWidth - margin,
      yPos,
      { align: 'right' }
    )
  }

  // Items Table
  yPos += 15
  autoTable(doc, {
    startY: yPos,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: invoice.items.map((item) => [
      item.description,
      item.quantity.toString(),
      `$${item.unitPrice.toFixed(2)}`,
      `$${item.total.toFixed(2)}`,
    ]),
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      textColor: darkColor,
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  })

  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10
  const totalsX = pageWidth - margin - 60

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal:', totalsX, finalY)
  doc.text(`$${invoice.subtotal.toFixed(2)}`, pageWidth - margin, finalY, { align: 'right' })

  doc.text(`Tax (${businessInfo.taxRate}%):`, totalsX, finalY + 6)
  doc.text(`$${invoice.tax.toFixed(2)}`, pageWidth - margin, finalY + 6, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Total:', totalsX, finalY + 14)
  doc.text(`$${invoice.total.toFixed(2)}`, pageWidth - margin, finalY + 14, { align: 'right' })

  // Notes
  if (invoice.notes) {
    let notesY = finalY + 25
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...darkColor)
    doc.text('Notes:', margin, notesY)
    
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...grayColor)
    notesY += 5
    const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - 2 * margin)
    doc.text(splitNotes, margin, notesY)
  }

  // Footer
  const footerY = doc.internal.pageSize.height - 20
  doc.setFontSize(8)
  doc.setTextColor(...grayColor)
  doc.setFont('helvetica', 'normal')
  
  let footerText = businessInfo.businessName
  if (businessInfo.abn) footerText += ` | ABN: ${businessInfo.abn}`
  if (businessInfo.website) footerText += ` | ${businessInfo.website}`
  
  doc.text(footerText, pageWidth / 2, footerY, { align: 'center' })

  return doc
}
