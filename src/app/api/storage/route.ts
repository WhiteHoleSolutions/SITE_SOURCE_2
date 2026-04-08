import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getDirectorySize(dirPath: string): Promise<number> {
  let totalSize = 0

  try {
    const files = await readdir(dirPath, { withFileTypes: true })

    for (const file of files) {
      const filePath = join(dirPath, file.name)

      if (file.isDirectory()) {
        totalSize += await getDirectorySize(filePath)
      } else {
        const stats = await stat(filePath)
        totalSize += stats.size
      }
    }
  } catch (error) {
    console.error('Error reading directory:', error)
  }

  return totalSize
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isProduction = process.env.NODE_ENV === 'production'
    const uploadDir = isProduction ? '/app/disk/uploads' : join(process.cwd(), 'public', 'uploads')
    const dbPath = isProduction ? '/app/disk' : process.cwd()

    // Get uploads directory size
    let uploadsSize = 0
    try {
      uploadsSize = await getDirectorySize(uploadDir)
    } catch (error) {
      console.error('Error getting uploads size:', error)
    }

    // Get database size
    let dbSize = 0
    try {
      const dbFile = isProduction 
        ? join(dbPath, 'production.db')
        : join(dbPath, 'dev.db')
      const dbStats = await stat(dbFile)
      dbSize = dbStats.size
    } catch (error) {
      console.error('Error getting database size:', error)
    }

    const totalUsedBytes = uploadsSize + dbSize

    // Get configured disk size from business info
    const businessInfo = await prisma.businessInfo.findFirst()
    const diskSizeGB = businessInfo?.diskSizeGB || 1.0

    const totalDiskBytes = diskSizeGB * 1024 * 1024 * 1024

    return NextResponse.json({
      used: {
        bytes: totalUsedBytes,
        mb: (totalUsedBytes / (1024 * 1024)).toFixed(2),
        gb: (totalUsedBytes / (1024 * 1024 * 1024)).toFixed(3),
      },
      total: {
        bytes: totalDiskBytes,
        mb: (totalDiskBytes / (1024 * 1024)).toFixed(2),
        gb: diskSizeGB.toFixed(2),
      },
      breakdown: {
        uploads: {
          bytes: uploadsSize,
          mb: (uploadsSize / (1024 * 1024)).toFixed(2),
        },
        database: {
          bytes: dbSize,
          mb: (dbSize / (1024 * 1024)).toFixed(2),
        },
      },
      percentage: ((totalUsedBytes / totalDiskBytes) * 100).toFixed(1),
    })
  } catch (error: any) {
    console.error('Storage API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get storage info' },
      { status: 500 }
    )
  }
}
