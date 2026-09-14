import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      select: { id: true, name: true, logoUrl: true, websiteUrl: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    })
    return NextResponse.json({ brands })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch brands' }, { status: 500 })
  }
}
