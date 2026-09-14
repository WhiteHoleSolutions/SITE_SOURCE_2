import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { DEFAULT_JOB_TASKS } from '@/lib/job-workflow'
import { jobWorkspaceInclude } from '@/lib/job-query'

const commandSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('addTask'), title: z.string().trim().min(1).max(200), stage: z.enum(['LEAD', 'SCHEDULED', 'IN_PRODUCTION', 'CLIENT_REVIEW', 'COMPLETE']) }),
  z.object({ action: z.literal('toggleTask'), taskId: z.string(), completed: z.boolean() }),
  z.object({ action: z.literal('deleteTask'), taskId: z.string() }),
  z.object({ action: z.literal('template') }),
  z.object({ action: z.literal('link'), kind: z.enum(['invoice', 'expense', 'album']), recordId: z.string(), linked: z.boolean() }),
])

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const job = await prisma.job.findUnique({ where: { id } })
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  const [invoices, expenses, albums] = await Promise.all([
    job.customerId ? prisma.invoice.findMany({ where: { customerId: job.customerId, jobId: null }, select: { id: true, invoiceNumber: true, total: true } }) : [],
    prisma.expense.findMany({ where: { jobId: null }, select: { id: true, expenseNumber: true, description: true, amount: true } }),
    prisma.album.findMany({ where: { jobs: { none: { jobId: id } } }, select: { id: true, title: true, type: true } }),
  ])
  return NextResponse.json({ invoices, expenses, albums })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (session?.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    const command = commandSchema.parse(await request.json())
    const result = await prisma.$transaction(async tx => {
      const job = await tx.job.findUnique({ where: { id } })
      if (!job) throw new Error('Job not found')
      if (command.action === 'addTask') await tx.jobTask.create({ data: { jobId: id, title: command.title, stage: command.stage } })
      if (command.action === 'toggleTask') await tx.jobTask.updateMany({ where: { id: command.taskId, jobId: id }, data: { completed: command.completed } })
      if (command.action === 'deleteTask') await tx.jobTask.deleteMany({ where: { id: command.taskId, jobId: id } })
      if (command.action === 'template' && await tx.jobTask.count({ where: { jobId: id } }) === 0) {
        for (const task of DEFAULT_JOB_TASKS) await tx.jobTask.create({ data: { jobId: id, ...task } })
      }
      if (command.action === 'link') {
        const { recordId, linked, kind } = command
        if (kind === 'album') {
          if (linked) await tx.jobAlbum.upsert({ where: { jobId_albumId: { jobId: id, albumId: recordId } }, create: { jobId: id, albumId: recordId }, update: {} })
          else await tx.jobAlbum.deleteMany({ where: { jobId: id, albumId: recordId } })
        } else if (kind === 'invoice') {
          const updated = await tx.invoice.updateMany({ where: { id: recordId, jobId: linked ? null : id, ...(linked ? { customerId: job.customerId || '' } : {}) }, data: { jobId: linked ? id : null } })
          if (!updated.count) throw new Error('Invoice must belong to this client and cannot already be linked to another job.')
        } else {
          const updated = await tx.expense.updateMany({ where: { id: recordId, jobId: linked ? null : id }, data: { jobId: linked ? id : null } })
          if (!updated.count) throw new Error('Expense is already linked to another job. Refresh and try again.')
        }
      }
      return tx.job.findUnique({ where: { id }, include: jobWorkspaceInclude })
    })
    return NextResponse.json({ job: result })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update workspace' }, { status: 400 })
  }
}
