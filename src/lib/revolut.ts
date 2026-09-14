const MERCHANT_API_URL = (process.env.REVOLUT_MERCHANT_API_URL || 'https://merchant.revolut.com/api').replace(/\/$/, '')
const MERCHANT_SECRET_KEY = process.env.REVOLUT_MERCHANT_SECRET_KEY || ''
const MERCHANT_API_VERSION = process.env.REVOLUT_MERCHANT_API_VERSION || '2026-08-17'
const MERCHANT_WEBHOOK_SECRET = process.env.REVOLUT_MERCHANT_WEBHOOK_SECRET || ''

export interface CreateMerchantOrderParams {
  amount: number
  currency: string
  description: string
  customerEmail?: string
  reference: string
  redirectUrl?: string
}

export interface MerchantOrder {
  id: string
  checkout_url: string
  state: string
  amount: number
  currency: string
  payments?: Array<{ id: string; state: string }>
}

export function getMerchantSetupStatus() {
  const missing: string[] = []
  if (!MERCHANT_SECRET_KEY) missing.push('Merchant secret key')
  if (!MERCHANT_WEBHOOK_SECRET) missing.push('Webhook signing secret')
  return { ready: missing.length === 0, missing }
}

function requireMerchantConfiguration() {
  const setup = getMerchantSetupStatus()
  if (!setup.ready) {
    throw new Error(`Revolut Merchant is not connected yet. Add ${setup.missing.join(' and ')} in Render after your Merchant account is approved.`)
  }
}

async function merchantRequest<T>(path: string, init?: RequestInit): Promise<T> {
  requireMerchantConfiguration()

  const response = await fetch(`${MERCHANT_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${MERCHANT_SECRET_KEY}`,
      'Content-Type': 'application/json',
      'Revolut-Api-Version': MERCHANT_API_VERSION,
      ...init?.headers,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const body = await response.text()
    console.error('Revolut Merchant API error:', response.status, body)
    throw new Error('Revolut could not create the payment request. Please try again or check the Merchant configuration.')
  }

  return response.json() as Promise<T>
}

export async function createMerchantOrder(params: CreateMerchantOrderParams): Promise<MerchantOrder> {
  return merchantRequest<MerchantOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      amount: Math.round(params.amount * 100), // Convert to cents
      currency: params.currency,
      description: params.description,
      customer: params.customerEmail ? { email: params.customerEmail } : undefined,
      merchant_order_data: { reference: params.reference },
      redirect_url: params.redirectUrl,
    }),
  })
}

export async function getMerchantOrder(orderId: string): Promise<MerchantOrder> {
  return merchantRequest<MerchantOrder>(`/orders/${encodeURIComponent(orderId)}`)
}

export async function getMerchantConnectionStatus() {
  const setup = getMerchantSetupStatus()
  if (!setup.ready) return { connected: false, configured: false, message: `Missing ${setup.missing.join(' and ')}` }

  try {
    const response = await fetch(`${MERCHANT_API_URL}/orders?limit=1`, {
      headers: {
        Authorization: `Bearer ${MERCHANT_SECRET_KEY}`,
        'Revolut-Api-Version': MERCHANT_API_VERSION,
      },
      cache: 'no-store',
    })
    if (!response.ok) return { connected: false, configured: true, message: 'Merchant credentials could not be verified' }
    return { connected: true, configured: true, message: 'Merchant checkout and payment updates are ready' }
  } catch {
    return { connected: false, configured: true, message: 'Unable to reach Revolut Merchant' }
  }
}
