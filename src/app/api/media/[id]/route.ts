import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

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

    // Get the media item to get its file path
    const media = await prisma.media.findUnique({
      where: { id },
    })

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Delete the media record from database
    await prisma.media.delete({
      where: { id },
    })

    // Try to delete the physical file (optional - doesn't fail if file doesn't exist)
    try {
      // Extract filename from URL (e.g., /uploads/filename.jpg)
      const urlPath = media.url.replace('/uploads/', '')
      const filePath = path.join(process.cwd(), 'public', 'uploads', urlPath)
      await fs.unlink(filePath)
    } catch (fileError) {
      // File might not exist or already deleted - that's okay
      console.log('Could not delete file:', fileError)
    }

    return NextResponse.json({ message: 'Media deleted successfully' })
  } catch (error: any) {
    console.error('Delete media error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete media' },
      { status: 400 }
    )
  }
}
