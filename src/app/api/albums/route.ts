import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { albumSchema } from '@/lib/validators'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    // Admins see all albums, regular users see only public albums
    const whereClause = session?.role === 'ADMIN' 
      ? {} 
      : { type: 'PUBLIC' }

    const albums = await prisma.album.findMany({
      where: whereClause,
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
        access: {
          include: {
            customer: {
              include: {
                user: true,
              },
            },
          },
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

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = albumSchema.parse(body)

    const album = await prisma.album.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        coverImage: data.coverImage,
      },
    })

    return NextResponse.json({ album })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create album' },
      { status: 400 }
    )
  }
}
