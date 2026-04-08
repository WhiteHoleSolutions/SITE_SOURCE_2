import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { generateInvoicePDF } from '@/lib/pdf'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch invoice with all details
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        customer: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // If customer, verify they own this invoice
    if (session.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({
        where: { userId: session.userId },
      })

      if (!customer || invoice.customerId !== customer.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Fetch business info
    let businessInfo = await prisma.businessInfo.findFirst()

    // If no business info exists, create default
    if (!businessInfo) {
      businessInfo = await prisma.businessInfo.create({
        data: {
          businessName: 'White Hole Solutions',
          country: 'Australia',
          taxRate: 10.0,
          paymentTerms: 'Net 30',
        },
      })
    }

    // Generate PDF
    const invoiceForPDF = {
      ...invoice,
      issuedAt: invoice.issuedAt ? invoice.issuedAt.toISOString() : null,
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
      paidAt: invoice.paidAt ? invoice.paidAt.toISOString() : null,
    }
    const pdf = generateInvoicePDF({ invoice: invoiceForPDF, businessInfo })
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('Error generating invoice PDF:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
