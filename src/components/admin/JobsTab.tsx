'use client'

import { useEffect, useMemo, useState } from 'react'
import { Briefcase, CalendarDays, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'

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
  return value.replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase())
}

export default function JobsTab() {
  const [jobs, setJobs] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', customerId: '', dueDate: '', quotedAmount: '', priority: 'NORMAL', clientGoal: '', services: [] as string[] })

  const load = async () => {
    setLoading(true)
    try {
      const [jobsResponse, customersResponse] = await Promise.all([fetch('/api/jobs'), fetch('/api/customers')])
      const [jobsData, customersData] = await Promise.all([jobsResponse.json(), customersResponse.json()])
      if (!jobsResponse.ok) throw new Error(jobsData.error)
      setJobs(jobsData.jobs || [])
      setCustomers(customersData.customers || [])
    } catch (error: any) {
      toast.error(error.message || 'Unable to load jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const grouped = useMemo(() => Object.fromEntries(STAGES.map(stage => [
    stage.key,
    jobs.filter(job => stage.statuses.includes(job.status)),
  ])), [jobs])

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

  const createJob = async (event: React.FormEvent) => {
    event.preventDefault()
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
      setForm({ title: '', customerId: '', dueDate: '', quotedAmount: '', priority: 'NORMAL', clientGoal: '', services: [] })
      setShowCreate(false)
      toast.success('Job created')
    } catch (error: any) {
      toast.error(error.message || 'Unable to create job')
    }
  }

  const toggleService = (service: string) => setForm(current => ({
    ...current,
    services: current.services.includes(service) ? current.services.filter(item => item !== service) : [...current.services, service],
  }))

  if (loading) return <div className="py-12 text-center text-dark-500">Loading operations board…</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">Operations</p>
          <h2 className="mt-1 text-2xl font-bold text-dark-900">Jobs board</h2>
          <p className="mt-1 text-sm text-dark-600">Turn every brief into a visible production journey.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 font-semibold text-white transition hover:bg-primary-600">
          <Plus size={18} /> New job
        </button>
      </div>

      {jobs.length === 0 && (
        <div className="rounded-xl border border-dashed border-dark-300 bg-dark-50 px-6 py-12 text-center">
          <Briefcase className="mx-auto text-primary-500" size={36} />
          <h3 className="mt-4 text-lg font-semibold text-dark-900">Your production pipeline starts here</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-dark-600">Create a job for a client brief, then move it from lead to delivery as the work progresses.</p>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-5">
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
                  <h4 className="mt-1 font-semibold leading-5 text-dark-900">{job.title}</h4>
                  <p className="mt-1 truncate text-sm text-dark-600">{job.customer?.user?.name || 'Unassigned client'}</p>
                  {job.services.length > 0 && <p className="mt-3 text-xs leading-5 text-dark-500">{job.services.map((service: any) => readable(service.serviceType)).join(' · ')}</p>}
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs text-dark-500">
                    {job.dueDate ? <span className="inline-flex items-center gap-1"><CalendarDays size={13} /> {formatDate(job.dueDate)}</span> : <span>No due date</span>}
                    {job.quotedAmount > 0 && <span className="font-semibold text-dark-700">{formatCurrency(job.quotedAmount)}</span>}
                  </div>
                  <select value={job.status} onChange={event => updateStatus(job.id, event.target.value)} className="mt-4 w-full rounded-md border border-dark-200 bg-white px-2 py-1.5 text-xs text-dark-700">
                    {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

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
            <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={() => setShowCreate(false)} className="rounded-lg px-4 py-2.5 font-semibold text-dark-600 hover:bg-dark-100">Cancel</button><button className="rounded-lg bg-primary-500 px-4 py-2.5 font-semibold text-white hover:bg-primary-600">Create job</button></div>
          </form>
        </div>
      )}
    </div>
  )
}
