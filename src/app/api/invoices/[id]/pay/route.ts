import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { createPaymentLink } from '@/lib/revolut'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Verify authorization
    if (session.role !== 'ADMIN' && invoice.customer.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })
    }

    // Create Revolut payment link
    const paymentLink = await createPaymentLink({
      amount: invoice.total,
      currency: 'USD',
      description: `Invoice ${invoice.invoiceNumber}`,
      reference_id: invoice.id,
      customer_email: invoice.customer.user.email,
    })

    // Update invoice with payment ID
    await prisma.invoice.update({
      where: { id },
      data: {
        revolutPaymentId: paymentLink.id,
        status: 'SENT',
        issuedAt: new Date(),
      },
    })

    return NextResponse.json({ 
      paymentUrl: paymentLink.url,
      paymentId: paymentLink.id,
    })
  } catch (error: any) {
    console.error('Payment error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 400 }
    )
  }
}
