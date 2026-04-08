import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Always return only PUBLIC albums for the public portfolio
    const albums = await prisma.album.findMany({
      where: { type: 'PUBLIC' },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ albums })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch albums' },
      { status: 500 }
    )
  }
}
