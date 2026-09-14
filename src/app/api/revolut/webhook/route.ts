import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/db'
import { getMerchantOrder } from '@/lib/revolut'

type RevolutWebhook = { event?: string; order_id?: string }

function isValidSignature(rawPayload: string, timestamp: string | null, signature: string | null) {
  const signingSecret = process.env.REVOLUT_MERCHANT_WEBHOOK_SECRET
  if (!signingSecret || !timestamp || !signature || !/^\d+$/.test(timestamp)) return false
  if (Math.abs(Date.now() - Number(timestamp)) > 5 * 60 * 1000) return false

  const expected = `v1=${createHmac('sha256', signingSecret).update(`v1.${timestamp}.${rawPayload}`).digest('hex')}`
  return signature.split(',').some(candidate => {
    const received = Buffer.from(candidate.trim())
    const expectedBuffer = Buffer.from(expected)
    return received.length === expectedBuffer.length && timingSafeEqual(received, expectedBuffer)
  })
}

// Confirm state with Revolut's Merchant API instead of trusting the body. This
// makes duplicate and out-of-order webhook deliveries safe.
export async function POST(request: NextRequest) {
  try {
    const rawPayload = await request.text()
    if (!isValidSignature(rawPayload, request.headers.get('revolut-request-timestamp'), request.headers.get('revolut-signature'))) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawPayload) as RevolutWebhook
    if (!payload.order_id) return NextResponse.json({ error: 'Missing order ID' }, { status: 400 })

    const invoice = await prisma.invoice.findUnique({ where: { revolutOrderId: payload.order_id } })
    if (!invoice) return NextResponse.json({ received: true })

    const order = await getMerchantOrder(payload.order_id)
    const data: { revolutOrderState: string; status?: string; paidAt?: Date } = {
      revolutOrderState: order.state,
    }

    if (order.state === 'completed' && invoice.status !== 'PAID') {
      data.status = 'PAID'
      data.paidAt = new Date()
    }

    await prisma.invoice.update({ where: { id: invoice.id }, data })
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Revolut Merchant webhook error:', error)
    return NextResponse.json({ error: 'Unable to process webhook' }, { status: 500 })
  }
}
