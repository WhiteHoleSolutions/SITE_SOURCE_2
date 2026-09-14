import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { brandSchema } from '@/lib/validators'

async function requireAdmin() {
  const session = await getSession()
  return session?.role === 'ADMIN'
}

export async function GET() {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const brands = await prisma.brand.findMany({ orderBy: [{ order: 'asc' }, { name: 'asc' }] })
    return NextResponse.json({ brands })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch brands' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const data = brandSchema.parse(await request.json())
    const latest = await prisma.brand.aggregate({ _max: { order: true } })
    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        logoUrl: data.logoUrl,
        websiteUrl: data.websiteUrl || null,
        order: data.order ?? (latest._max.order ?? -1) + 1,
      },
    })
    return NextResponse.json({ brand }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create brand' }, { status: 400 })
  }
}
