import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(
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
    const { customerIds, accessList } = body

    // Support both old format (customerIds array) and new format (accessList array)
    let entries: { customerId: string; permission: string }[] = []
    
    if (accessList && Array.isArray(accessList)) {
      // New format with permissions
      entries = accessList.map((item: any) => ({
        customerId: item.customerId,
        permission: item.permission || 'VIEW'
      }))
    } else if (customerIds && Array.isArray(customerIds)) {
      // Old format - backward compatibility
      entries = customerIds.map((customerId: string) => ({
        customerId,
        permission: 'VIEW'
      }))
    } else {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
    }

    // Delete existing access
    await prisma.albumAccess.deleteMany({
      where: { albumId: id },
    })

    // Create new access entries
    const accessEntries = entries.map(entry => ({
      albumId: id,
      customerId: entry.customerId,
      permission: entry.permission,
    }))

    await prisma.albumAccess.createMany({
      data: accessEntries,
    })

    return NextResponse.json({ message: 'Access updated successfully' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update album access' },
      { status: 400 }
    )
  }
}
