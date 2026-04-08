import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the customer record for this user
    const customer = await prisma.customer.findUnique({
      where: { userId: session.userId },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get ONLY private albums the customer has been granted access to
    const privateAlbumsData = await prisma.album.findMany({
      where: {
        type: 'PRIVATE',
        access: {
          some: {
            customerId: customer.id,
          },
        },
      },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
        access: {
          where: {
            customerId: customer.id,
          },
        },
      },
      orderBy: { order: 'asc' },
    })

    // Transform to include permission at top level
    const albums = privateAlbumsData.map((album: any) => ({
      id: album.id,
      title: album.title,
      description: album.description,
      type: album.type,
      coverImage: album.coverImage,
      order: album.order,
      createdAt: album.createdAt,
      updatedAt: album.updatedAt,
      media: album.media,
      permission: album.access[0]?.permission || 'VIEW',
    }))

    return NextResponse.json({ albums })
  } catch (error: any) {
    console.error('Customer albums error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch albums' },
      { status: 500 }
    )
  }
}
