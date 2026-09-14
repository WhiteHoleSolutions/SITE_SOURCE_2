import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { brandSchema } from '@/lib/validators'

async function requireAdmin() {
  const session = await getSession()
  return session?.role === 'ADMIN'
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const data = brandSchema.partial().parse(await request.json())
    const brand = await prisma.brand.update({
      where: { id },
      data: { ...data, websiteUrl: data.websiteUrl === '' ? null : data.websiteUrl },
    })
    return NextResponse.json({ brand })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update brand' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    await prisma.brand.delete({ where: { id } })
    return NextResponse.json({ message: 'Brand deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete brand' }, { status: 400 })
  }
}
