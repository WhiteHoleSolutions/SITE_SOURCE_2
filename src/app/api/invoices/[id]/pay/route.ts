import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { createMerchantOrder, getMerchantSetupStatus } from '@/lib/revolut'

export async function POST(
  _request: NextRequest,
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
      return NextResponse.json({ error: 'Payment request not found' }, { status: 404 })
    }

    // Verify authorization
    if (session.role !== 'ADMIN' && invoice.customer.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json({ error: 'This payment request has already been paid.' }, { status: 409 })
    }

    const merchantSetup = getMerchantSetupStatus()
    if (!merchantSetup.ready) {
      return NextResponse.json({ error: `Revolut payments are unavailable: add ${merchantSetup.missing.join(' and ')} in Render.` }, { status: 503 })
    }

    // Merchant checkout URLs can be reused after unsuccessful attempts.
    if (invoice.revolutOrderId && invoice.paymentLink) {
      return NextResponse.json({ paymentUrl: invoice.paymentLink, orderId: invoice.revolutOrderId })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
    const order = await createMerchantOrder({
      amount: invoice.total,
      currency: invoice.currency,
      description: `${invoice.invoiceNumber} · ${invoice.customer.user.name}`,
      reference: invoice.id,
      customerEmail: invoice.customer.user.email,
      redirectUrl: appUrl ? `${appUrl}/dashboard?payment=${encodeURIComponent(invoice.id)}` : undefined,
    })

    await prisma.invoice.update({
      where: { id },
      data: {
        revolutOrderId: order.id,
        revolutOrderState: order.state,
        paymentLink: order.checkout_url,
        status: 'SENT',
        issuedAt: invoice.issuedAt || new Date(),
      },
    })

    return NextResponse.json({ 
      paymentUrl: order.checkout_url,
      orderId: order.id,
    })
  } catch (error: any) {
    console.error('Revolut Merchant payment request error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment request' },
      { status: 400 }
    )
  }
}
