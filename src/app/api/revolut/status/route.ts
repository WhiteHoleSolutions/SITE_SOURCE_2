import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getMerchantConnectionStatus } from '@/lib/revolut'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const status = await getMerchantConnectionStatus()
  return NextResponse.json(status)
}
