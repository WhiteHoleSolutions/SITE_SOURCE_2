'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Briefcase, CalendarDays, Plus, Search, Trash2, X, Clock, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import JobWorkspace from './JobWorkspace'
import { WorkspaceJob, readableService } from '@/lib/job-workflow'

const STAGES = [
  { key: 'LEAD', label: 'Lead', statuses: ['LEAD', 'SCOPED', 'QUOTE_SENT'] },
  { key: 'CONFIRMED', label: 'Confirmed', statuses: ['CONFIRMED', 'SCHEDULED'] },
  { key: 'IN_PRODUCTION', label: 'In production', statuses: ['IN_PRODUCTION'] },
  { key: 'CLIENT_REVIEW', label: 'Client review', statuses: ['CLIENT_REVIEW', 'READY_TO_DELIVER'] },
  { key: 'COMPLETE', label: 'Complete', statuses: ['COMPLETE', 'ARCHIVED'] },
]

const STATUS_LABELS: Record<string, string> = {
  LEAD: 'Lead', SCOPED: 'Scoped', QUOTE_SENT: 'Quote sent', CONFIRMED: 'Confirmed',
  SCHEDULED: 'Scheduled', IN_PRODUCTION: 'In production', CLIENT_REVIEW: 'Client review',
  READY_TO_DELIVER: 'Ready to deliver', COMPLETE: 'Complete', ARCHIVED: 'Archived',
}

const SERVICE_TYPES = ['PHOTO_VIDEO', 'DRONE', 'PRODUCT_IMAGERY', 'PRINT', 'WEBSITE', 'SOFTWARE']

function readable(value: string) {
  return readableService(value)
}

export default function JobsTab({ initialView = 'pipeline', onRecords, onDirtyChange }: { initialView?: 'today' | 'pipeline'; onRecords?: (tab: 'invoices' | 'expenses' | 'albums') => void; onDirtyChange?: (dirty: boolean) => void }) {
  const [jobs, setJobs] = useState<WorkspaceJob[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [form, setForm] = useState({ title: '', customerId: '', dueDate: '', quotedAmount: '', priority: 'NORMAL', clientGoal: '', services: [] as string[] })

  const load = async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const [jobsResponse, customersResponse] = await Promise.all([fetch('/api/jobs'), fetch('/api/customers')])
      const [jobsData, customersData] = await Promise.all([jobsResponse.json(), customersResponse.json()])
      if (!jobsResponse.ok) throw new Error(jobsData.error)
      if (!customersResponse.ok) throw new Error(customersData.error)
      setJobs(jobsData.jobs || [])
      setCustomers(customersData.customers || [])
    } catch (error: any) {
      toast.error(error.message || 'Unable to load jobs')
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const visible = jobs.filter(job => (showArchived || job.status !== 'ARCHIVED') && (!clientFilter || job.customerId === clientFilter) && `${job.title} ${job.jobNumber} ${job.customer?.user.name || ''}`.toLowerCase().includes(query.toLowerCase()))
  const grouped = Object.fromEntries(STAGES.map(stage => [
    stage.key,
    visible.filter(job => stage.statuses.includes(job.status)),
  ]))
  const selectedJob = jobs.find(job => job.id === selectedId)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7)
  const active = jobs.filter(job => !['COMPLETE', 'ARCHIVED'].includes(job.status))
  const isPast = (date: string | null) => !!date && new Date(date) < today
  const needsAttention = active.filter(job => isPast(job.dueDate) || isPast(job.nextActionDue) || (job.nextActionDue && new Date(job.nextActionDue) < new Date(today.getTime() + 86400000)) || !job.nextAction)
  const upcoming = active.filter(job => [job.startDate, job.dueDate].some(date => date && new Date(date) >= today && new Date(date) <= weekEnd))
  const awaitingReview = active.filter(job => job.status === 'CLIENT_REVIEW')
  const outstandingJobs = jobs.filter(job => job.status !== 'ARCHIVED' && job.invoices.some(invoice => ['SENT', 'OVERDUE'].includes(invoice.status)))

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setJobs(current => current.map(job => job.id === id ? data.job : job))
    } catch (error: any) {
      toast.error(error.message || 'Unable to update job')
    }
  }

  const deleteJob = async (job: any) => {
    const warning = `Permanently delete ${job.jobNumber} — ${job.title}? Its services and checklist will be removed. Client, albums, invoices and expenses will be kept. This cannot be undone.`
    if (!confirm(warning)) return

    try {
      const response = await fetch(`/api/jobs/${job.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setJobs(current => current.filter(item => item.id !== job.id))
      toast.success(data.unlinkedRecords ? `Job deleted; ${data.unlinkedRecords} financial record(s) kept` : 'Job deleted')
    } catch (error: any) {
      toast.error(error.message || 'Unable to delete job')
    }
  }

  const createJob = async (event: React.FormEvent) => {
    event.preventDefault()
    if (creating) return
    setCreating(true)
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          customerId: form.customerId || null,
          dueDate: form.dueDate || null,
          quotedAmount: Number(form.quotedAmount) || 0,
          services: form.services.map(serviceType => ({ serviceType })),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setJobs(current => [data.job, ...current])
      setSelectedId(data.job.id)
      setForm({ title: '', customerId: '', dueDate: '', quotedAmount: '', priority: 'NORMAL', clientGoal: '', services: [] })
      setShowCreate(false)
      toast.success('Job created')
    } catch (error: any) {
      toast.error(error.message || 'Unable to create job')
    } finally { setCreating(false) }
  }

  const toggleService = (service: string) => setForm(current => ({
    ...current,
    services: current.services.includes(service) ? current.services.filter(item => item !== service) : [...current.services, service],
  }))

  if (loading) return <div className="py-12 text-center text-dark-500">Loading operations board…</div>

  if (loadError) return <div role="alert" className="job-panel text-center"><h2 className="font-semibold">Unable to load your operations</h2><p className="mt-2 text-sm text-dark-500">Your records haven’t changed. Check your connection and try again.</p><button className="job-button mx-auto mt-4" onClick={load}>Try again</button></div>

  if (selectedJob) return <JobWorkspace key={selectedJob.id} job={selectedJob} customers={customers} onChange={updated => setJobs(current => current.map(job => job.id === updated.id ? updated : job))} onBack={() => setSelectedId(null)} onRecords={onRecords} onDirtyChange={onDirtyChange} />

  const priorityList = (title: string, description: string, list: WorkspaceJob[], empty: string) => <section className="job-panel"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-dark-900">{title}</h3><p className="mt-1 text-xs text-dark-500">{description}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{list.length}</span></div><div className="mt-4">{list.slice(0, 6).map(job => <button key={job.id} onClick={() => setSelectedId(job.id)} className="group flex w-full items-center gap-3 border-t border-dark-100 py-4 text-left"><div className={`h-8 w-1 shrink-0 rounded-full ${isPast(job.dueDate) || isPast(job.nextActionDue) ? 'bg-amber-400' : 'bg-blue-400'}`} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-dark-900 group-hover:text-blue-700">{job.title}</p><p className="mt-1 truncate text-xs text-dark-500">{job.nextAction || 'Set the next action'} · {job.customer?.user.name || 'Assign a client'}</p><p className="mt-1 text-[10px] text-dark-400">{job.nextActionDue ? `Follow-up ${formatDate(job.nextActionDue)} · ` : ''}{job.dueDate ? `Delivery ${formatDate(job.dueDate)}` : STATUS_LABELS[job.status]}</p></div><ArrowRight size={16} className="text-dark-400 group-hover:text-blue-600" /></button>)}{!list.length && <p className="rounded-lg bg-slate-50 p-5 text-sm text-dark-500">{empty}</p>}{list.length > 6 && <p className="text-xs text-dark-500">{list.length - 6} more jobs in Pipeline.</p>}</div></section>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">Operations</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-dark-900">{initialView === 'today' ? 'Your studio, at a glance.' : 'The production pipeline.'}</h2>
          <p className="mt-2 text-sm text-dark-500">{initialView === 'today' ? 'The work that needs your attention, and what happens next.' : 'Open a job to manage its brief, checklist, delivery and money.'}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 font-semibold text-white transition hover:bg-primary-600">
          <Plus size={18} /> New job
        </button>
      </div>

      {initialView === 'today' && <>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[{ label: 'Active jobs', value: active.length, icon: Briefcase }, { label: 'Need attention', value: needsAttention.length, icon: Clock }, { label: 'Dates this week', value: upcoming.length, icon: CalendarDays }, { label: 'Awaiting review', value: awaitingReview.length, icon: CheckCircle2 }].map((item, index) => <div key={item.label} className={`rounded-2xl border p-5 ${index === 0 ? 'border-slate-800 bg-[#111b2d] text-white' : 'border-slate-200 bg-white text-dark-900'}`}><div className="flex items-center justify-between gap-2"><p className={`text-xs ${index === 0 ? 'text-slate-300' : 'text-dark-500'}`}>{item.label}</p><item.icon size={17} className="text-blue-400" /></div><p className="mt-4 text-4xl font-light tracking-tight">{item.value}</p></div>)}</div>
        <div className="grid gap-5 lg:grid-cols-2">{priorityList('Focus next', 'Overdue work, follow-ups due today, and jobs without a next action.', needsAttention, 'You’re up to date. Each active job has a next action.')}{priorityList('Coming up this week', 'Production and delivery dates in the next seven days.', upcoming, 'No upcoming dates. Add a shoot or delivery date to a job.')}{priorityList('With the client', 'Jobs waiting for feedback or approval.', awaitingReview, 'No jobs are currently waiting for client review.')}{priorityList('Payment follow-ups', 'Jobs with linked sent or overdue payment requests.', outstandingJobs, 'No linked payment requests need follow-up.')}</div>
      </>}

      {initialView === 'pipeline' && <div className="flex flex-wrap items-center gap-3"><label className="relative min-w-[200px] flex-1"><span className="sr-only">Search jobs</span><Search size={16} className="absolute left-3 top-3.5 text-dark-400" /><input className="job-input !mt-0 !pl-9" placeholder="Search jobs, numbers or clients…" value={query} onChange={event => setQuery(event.target.value)} /></label><select aria-label="Filter by client" className="job-input !mt-0 !w-auto max-w-full" value={clientFilter} onChange={event => setClientFilter(event.target.value)}><option value="">All clients</option>{customers.map(customer => <option key={customer.id} value={customer.id}>{customer.user.name}</option>)}</select><label className="flex items-center gap-2 text-xs font-medium text-dark-500"><input type="checkbox" checked={showArchived} className="accent-blue-600" onChange={event => setShowArchived(event.target.checked)} /> Show archived</label></div>}
      {initialView === 'pipeline' && visible.length === 0 && (
        <div className="rounded-xl border border-dashed border-dark-300 bg-dark-50 px-6 py-12 text-center">
          <Briefcase className="mx-auto text-primary-500" size={36} />
          <h3 className="mt-4 text-lg font-semibold text-dark-900">{jobs.length ? 'No jobs match these filters' : 'Your production pipeline starts here'}</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-dark-600">Create a job for a client brief, then move it from lead to delivery as the work progresses.</p>
        </div>
      )}

      {initialView === 'pipeline' && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {STAGES.map(stage => (
          <section key={stage.key} className="min-w-0 rounded-xl bg-dark-100 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-dark-700">{stage.label}</h3>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-dark-500">{grouped[stage.key].length}</span>
            </div>
            <div className="space-y-3">
              {grouped[stage.key].map((job: any) => (
                <article key={job.id} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-dark-200">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold tracking-wide text-primary-600">{job.jobNumber}</p>
                    {job.priority !== 'NORMAL' && <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">{job.priority}</span>}
                  </div>
                  <button className="mt-2 block w-full text-left font-semibold leading-5 text-dark-900 hover:text-blue-700 focus-visible:outline-blue-500" onClick={() => setSelectedId(job.id)}>{job.title}</button>
                  <p className="mt-1 truncate text-sm text-dark-600">{job.customer?.user?.name || 'Unassigned client'}</p>
                  {job.services.length > 0 && <p className="mt-3 text-xs leading-5 text-dark-500">{job.services.map((service: any) => readable(service.serviceType)).join(' · ')}</p>}
                  <div className="mt-3 rounded-lg bg-slate-50 p-2.5"><p className="text-[9px] font-bold uppercase tracking-wider text-blue-600">Next action</p><p className="mt-1 text-xs leading-5 text-dark-600">{job.nextAction || 'Open workspace to add a next step'}</p></div>
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs text-dark-500">
                    {job.dueDate ? <span className="inline-flex items-center gap-1"><CalendarDays size={13} /> {formatDate(job.dueDate)}</span> : <span>No due date</span>}
                    {job.quotedAmount > 0 && <span className="font-semibold text-dark-700">{formatCurrency(job.quotedAmount)}</span>}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <select value={job.status} onChange={event => updateStatus(job.id, event.target.value)} className="min-w-0 flex-1 rounded-md border border-dark-200 bg-white px-2 py-1.5 text-xs text-dark-700">
                      {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <button onClick={() => deleteJob(job)} className="rounded-md border border-red-200 px-2 text-red-600 transition hover:bg-red-50" title={`Delete ${job.jobNumber}`} aria-label={`Delete ${job.jobNumber}`}><Trash2 size={15} /></button>
                  </div>
                  <button className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline" onClick={() => setSelectedId(job.id)}>Open workspace <ArrowRight size={13} /></button>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>}

      {showCreate && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" onClick={() => setShowCreate(false)}>
          <form onSubmit={createJob} onClick={event => event.stopPropagation()} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div><h3 className="text-xl font-bold text-dark-900">Create a job</h3><p className="mt-1 text-sm text-dark-600">Start with the brief; details can grow with the project.</p></div>
              <button type="button" onClick={() => setShowCreate(false)} className="rounded p-1 text-dark-500 hover:bg-dark-100"><X size={22} /></button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 text-sm font-medium text-dark-800">Job title<input required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="e.g. Spring product campaign" className="mt-1.5 w-full rounded-lg border border-dark-300 px-3 py-2.5 text-dark-900" /></label>
              <label className="text-sm font-medium text-dark-800">Client<select value={form.customerId} onChange={event => setForm({ ...form, customerId: event.target.value })} className="mt-1.5 w-full rounded-lg border border-dark-300 px-3 py-2.5 text-dark-900"><option value="">Assign later</option>{customers.map(customer => <option key={customer.id} value={customer.id}>{customer.user?.name} — {customer.user?.email}</option>)}</select></label>
              <label className="text-sm font-medium text-dark-800">Priority<select value={form.priority} onChange={event => setForm({ ...form, priority: event.target.value })} className="mt-1.5 w-full rounded-lg border border-dark-300 px-3 py-2.5 text-dark-900"><option>NORMAL</option><option>LOW</option><option>HIGH</option><option>URGENT</option></select></label>
              <label className="text-sm font-medium text-dark-800">Target delivery<input type="date" value={form.dueDate} onChange={event => setForm({ ...form, dueDate: event.target.value })} className="mt-1.5 w-full rounded-lg border border-dark-300 px-3 py-2.5 text-dark-900" /></label>
              <label className="text-sm font-medium text-dark-800">Quoted value<input type="number" min="0" step="0.01" value={form.quotedAmount} onChange={event => setForm({ ...form, quotedAmount: event.target.value })} placeholder="0.00" className="mt-1.5 w-full rounded-lg border border-dark-300 px-3 py-2.5 text-dark-900" /></label>
              <label className="sm:col-span-2 text-sm font-medium text-dark-800">Client goal<textarea value={form.clientGoal} onChange={event => setForm({ ...form, clientGoal: event.target.value })} rows={3} placeholder="What outcome does the client need?" className="mt-1.5 w-full resize-none rounded-lg border border-dark-300 px-3 py-2.5 text-dark-900" /></label>
              <fieldset className="sm:col-span-2"><legend className="text-sm font-medium text-dark-800">Services</legend><div className="mt-2 flex flex-wrap gap-2">{SERVICE_TYPES.map(service => <label key={service} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition ${form.services.includes(service) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-dark-200 text-dark-600'}`}><input className="sr-only" type="checkbox" checked={form.services.includes(service)} onChange={() => toggleService(service)} />{readable(service)}</label>)}</div></fieldset>
            </div>
            <div className="mt-7 flex justify-end gap-3"><button type="button" disabled={creating} onClick={() => setShowCreate(false)} className="rounded-lg px-4 py-2.5 font-semibold text-dark-600 hover:bg-dark-100">Cancel</button><button disabled={creating} className="rounded-lg bg-primary-500 px-4 py-2.5 font-semibold text-white hover:bg-primary-600 disabled:opacity-50">{creating ? 'Creating…' : 'Create job'}</button></div>
          </form>
        </div>
      )}
    </div>
  )
}
