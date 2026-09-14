import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { stat } from 'fs/promises'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename
    
    // Security: prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    const isProduction = process.env.NODE_ENV === 'production'
    const uploadDir = isProduction 
      ? '/app/disk/uploads'
      : join(process.cwd(), 'public', 'uploads')
    
    const filepath = join(uploadDir, filename)

    const url = `/api/files/${filename}`
    const media = await prisma.media.findFirst({
      where: { url },
      include: { album: true },
    })
    const brand = await prisma.brand.findFirst({ where: { logoUrl: url }, select: { id: true } })

    // Public portfolio media remains public. Everything else on the uploads
    // disk is restricted, including private client-gallery media and receipts.
    if (!brand && (!media || media.album.type !== 'PUBLIC')) {
      const session = await getSession()
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      if (session.role !== 'ADMIN') {
        if (!media || session.role !== 'CUSTOMER') {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const customer = await prisma.customer.findUnique({
          where: { userId: session.userId },
          select: { id: true },
        })
        const access = customer && await prisma.albumAccess.findUnique({
          where: { albumId_customerId: { albumId: media.albumId, customerId: customer.id } },
          select: { id: true },
        })

        if (!access) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
      }
    }

    // Check if file exists
    try {
      await stat(filepath)
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Read file
    const fileBuffer = await readFile(filepath)

    // Determine content type based on file extension
    const ext = filename.split('.').pop()?.toLowerCase()
    const contentTypeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      webm: 'video/webm',
      pdf: 'application/pdf',
    }

    const contentType = contentTypeMap[ext || ''] || 'application/octet-stream'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': brand || media?.album.type === 'PUBLIC'
          ? 'public, max-age=31536000, immutable'
          : 'private, no-store',
      },
    })
  } catch (error: any) {
    console.error('File serving error:', error)
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    )
  }
}
