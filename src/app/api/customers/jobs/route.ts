import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    })
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Intentionally select only client-facing project information. Internal
    // notes, costs, and business-only financial data remain admin-only.
    const jobs = await prisma.job.findMany({
      where: { customerId: customer.id, status: { not: 'ARCHIVED' } },
      select: {
        id: true,
        jobNumber: true,
        title: true,
        status: true,
        clientGoal: true,
        startDate: true,
        dueDate: true,
        createdAt: true,
        services: {
          select: { id: true, serviceType: true, status: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ jobs })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch jobs' }, { status: 500 })
  }
}
