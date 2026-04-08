import axios from 'axios'

const REVOLUT_API_KEY = process.env.REVOLUT_API_KEY || ''
const REVOLUT_API_URL = process.env.REVOLUT_API_URL || 'https://sandbox-b2b.revolut.com/api/1.0'

const revolutClient = axios.create({
  baseURL: REVOLUT_API_URL,
  headers: {
    'Authorization': `Bearer ${REVOLUT_API_KEY}`,
    'Content-Type': 'application/json',
  },
})

export interface CreatePaymentLinkParams {
  amount: number
  currency: string
  description: string
  reference_id: string
  customer_email?: string
}

export interface PaymentLink {
  id: string
  url: string
  amount: number
  currency: string
  status: string
}

export async function createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLink> {
  try {
    const response = await revolutClient.post('/payment-links', {
      amount: Math.round(params.amount * 100), // Convert to cents
      currency: params.currency,
      description: params.description,
      reference_id: params.reference_id,
      customer_email: params.customer_email,
    })
    
    return response.data
  } catch (error: any) {
    console.error('Revolut API Error:', error.response?.data || error.message)
    throw new Error('Failed to create payment link')
  }
}

export async function getPaymentStatus(paymentId: string): Promise<any> {
  try {
    const response = await revolutClient.get(`/payment-links/${paymentId}`)
    return response.data
  } catch (error: any) {
    console.error('Revolut API Error:', error.response?.data || error.message)
    throw new Error('Failed to fetch payment status')
  }
}

export async function checkPaymentCompleted(paymentId: string): Promise<boolean> {
  try {
    const payment = await getPaymentStatus(paymentId)
    return payment.status === 'completed'
  } catch (error) {
    return false
  }
}
