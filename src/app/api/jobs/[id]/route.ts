import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { jobUpdateSchema } from '@/lib/validators'

const jobInclude = {
  customer: { include: { user: { select: { name: true, email: true } } } },
  inquiry: { select: { id: true, name: true, email: true, status: true } },
  services: { orderBy: { createdAt: 'asc' as const } },
  invoices: { select: { id: true, invoiceNumber: true, status: true, total: true } },
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const job = await prisma.job.findUnique({ where: { id }, include: jobInclude })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    return NextResponse.json({ job })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch job' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const data = jobUpdateSchema.parse(await request.json())
    const { services, startDate, dueDate, ...fields } = data
    const job = await prisma.job.update({
      where: { id },
      data: {
        ...fields,
        startDate: startDate === undefined ? undefined : startDate ? new Date(startDate) : null,
        dueDate: dueDate === undefined ? undefined : dueDate ? new Date(dueDate) : null,
        services: services === undefined ? undefined : { deleteMany: {}, create: services },
      },
      include: jobInclude,
    })
    return NextResponse.json({ job })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update job' }, { status: 400 })
  }
}
