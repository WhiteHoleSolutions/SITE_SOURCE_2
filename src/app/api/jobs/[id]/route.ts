import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { jobUpdateSchema } from '@/lib/validators'
import { jobWorkspaceInclude } from '@/lib/job-query'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const job = await prisma.job.findUnique({ where: { id }, include: jobWorkspaceInclude })
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
    const { services, startDate, dueDate, nextActionDue, ...fields } = data
    for (const value of [startDate, dueDate, nextActionDue]) {
      if (value && !Number.isFinite(new Date(value).getTime())) return NextResponse.json({ error: 'Enter a valid date' }, { status: 400 })
    }
    if (fields.customerId !== undefined) {
      const mismatch = await prisma.invoice.count({ where: { jobId: id, customerId: { not: fields.customerId || '' } } })
      if (mismatch) return NextResponse.json({ error: 'Unlink invoices before changing the job client.' }, { status: 409 })
    }
    const job = await prisma.job.update({
      where: { id },
      data: {
        ...fields,
        startDate: startDate === undefined ? undefined : startDate ? new Date(startDate) : null,
        dueDate: dueDate === undefined ? undefined : dueDate ? new Date(dueDate) : null,
        nextActionDue: nextActionDue === undefined ? undefined : nextActionDue ? new Date(nextActionDue) : null,
        services: services === undefined ? undefined : { deleteMany: {}, create: services },
      },
      include: jobWorkspaceInclude,
    })
    return NextResponse.json({ job })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update job' }, { status: 400 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const job = await prisma.job.findUnique({
      where: { id },
      select: { id: true, title: true, jobNumber: true, _count: { select: { invoices: true, expenses: true } } },
    })
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

    // Job services are removed with the job. Existing invoices and expenses are
    // retained as financial records and their optional job reference is cleared.
    await prisma.job.delete({ where: { id } })
    return NextResponse.json({
      deleted: true,
      message: `${job.jobNumber} deleted`,
      unlinkedRecords: job._count.invoices + job._count.expenses,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete job' }, { status: 500 })
  }
}
