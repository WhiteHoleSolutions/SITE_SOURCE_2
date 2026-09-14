import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { jobSchema } from '@/lib/validators'
import { generateJobNumber } from '@/lib/utils'
import { jobWorkspaceInclude } from '@/lib/job-query'
import { DEFAULT_JOB_TASKS } from '@/lib/job-workflow'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const jobs = await prisma.job.findMany({
      include: jobWorkspaceInclude,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ jobs })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = jobSchema.parse(await request.json())
    const job = await prisma.job.create({
      data: {
        jobNumber: generateJobNumber(),
        title: data.title,
        customerId: data.customerId || null,
        inquiryId: data.inquiryId || null,
        priority: data.priority,
        clientGoal: data.clientGoal || null,
        internalNotes: data.internalNotes || null,
        location: data.location || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        quotedAmount: data.quotedAmount,
        services: { create: data.services },
        tasks: { create: DEFAULT_JOB_TASKS },
      },
      include: jobWorkspaceInclude,
    })

    if (data.inquiryId) {
      await prisma.inquiry.update({ where: { id: data.inquiryId }, data: { status: 'CONVERTED' } })
    }

    return NextResponse.json({ job }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create job' }, { status: 400 })
  }
}
