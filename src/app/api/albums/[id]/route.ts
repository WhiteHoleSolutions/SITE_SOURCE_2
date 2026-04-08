import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { albumSchema } from '@/lib/validators'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const album = await prisma.album.findUnique({
      where: { id },
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
    })

    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 })
    }

    return NextResponse.json({ album })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch album' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Allow partial updates
    const updateData: any = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.type !== undefined) updateData.type = body.type
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage
    if (body.order !== undefined) updateData.order = body.order

    const album = await prisma.album.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ album })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update album' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await prisma.album.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Album deleted successfully' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete album' },
      { status: 400 }
    )
  }
}
