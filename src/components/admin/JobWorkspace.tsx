'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, ChevronRight, FileText, Image, Link2, Lock, Plus, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { JOB_STAGES, JOB_STATUS_LABELS, WorkspaceJob, stageFor, readableService } from '@/lib/job-workflow'
import { formatCurrency, formatDate } from '@/lib/utils'

type Props = {
  job: WorkspaceJob
  customers: { id: string; user: { name: string; email: string } }[]
  onChange: (job: WorkspaceJob) => void
  onBack: () => void
  onRecords?: (tab: 'invoices' | 'expenses' | 'albums') => void
  onDirtyChange?: (dirty: boolean) => void
}
type Options = { invoices: { id: string; invoiceNumber: string; total: number }[]; expenses: { id: string; description: string; amount: number }[]; albums: { id: string; title: string; type: string }[] }
const SERVICE_TYPES = ['PHOTO_VIDEO', 'DRONE', 'PRODUCT_IMAGERY', 'PRINT', 'WEBSITE', 'SOFTWARE']
const dateInput = (value: string | null) => value?.slice(0, 10) || ''

function detailsOf(job: WorkspaceJob) {
  return { title: job.title, customerId: job.customerId || '', priority: job.priority, clientGoal: job.clientGoal || '', internalNotes: job.internalNotes || '', location: job.location || '', startDate: dateInput(job.startDate), dueDate: dateInput(job.dueDate), quotedAmount: job.quotedAmount, services: job.services.map(service => ({ serviceType: service.serviceType, scope: service.scope || '', status: service.status })) }
}

export default function JobWorkspace({ job, customers, onChange, onBack, onRecords, onDirtyChange }: Props) {
  const [tab, setTab] = useState<'overview' | 'checklist' | 'delivery' | 'money'>('overview')
  const [details, setDetails] = useState(() => detailsOf(job))
  const [nextAction, setNextAction] = useState(job.nextAction || '')
  const [nextDue, setNextDue] = useState(dateInput(job.nextActionDue))
  const [busy, setBusy] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskStage, setTaskStage] = useState<string>(stageFor(job.status).key)
  const [options, setOptions] = useState<Options>({ invoices: [], expenses: [], albums: [] })
  const [optionError, setOptionError] = useState(false)
  const [selection, setSelection] = useState({ invoice: '', expense: '', album: '' })
  const activeStage = stageFor(job.status)
  const done = job.tasks.filter(task => task.completed).length
  const percent = job.tasks.length ? Math.round(done / job.tasks.length * 100) : 0
  const dirty = JSON.stringify(details) !== JSON.stringify(detailsOf(job)) || nextAction !== (job.nextAction || '') || nextDue !== dateInput(job.nextActionDue)
  useEffect(() => { onDirtyChange?.(dirty); return () => onDirtyChange?.(false) }, [dirty, onDirtyChange])

  const loadOptions = async () => {
    try {
      const response = await fetch(`/api/jobs/${job.id}/workspace`)
      if (!response.ok) throw new Error()
      setOptions(await response.json()); setOptionError(false)
    } catch { setOptionError(true) }
  }
  useEffect(() => { loadOptions() }, [job.id, job.customerId])
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault() }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [dirty])

  const mutate = async (payload: object, workspace = false) => {
    setBusy(true)
    try {
      const response = await fetch(`/api/jobs/${job.id}${workspace ? '/workspace' : ''}`, { method: workspace ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      onChange(data.job)
      return data.job as WorkspaceJob
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to save changes') }
    finally { setBusy(false) }
  }

  const saveDetails = async () => {
    const saved = await mutate({ ...details, customerId: details.customerId || null, startDate: details.startDate || null, dueDate: details.dueDate || null, nextAction: nextAction || null, nextActionDue: nextDue || null })
    if (saved) { setDetails(detailsOf(saved)); setNextAction(saved.nextAction || ''); setNextDue(dateInput(saved.nextActionDue)); toast.success('Job details saved') }
  }
  const leave = (action: () => void) => { if (!dirty || confirm('Leave without saving your changes?')) action() }
  const linkRecord = async (kind: 'invoice' | 'expense' | 'album', recordId: string, linked: boolean) => {
    if (!recordId) return
    const saved = await mutate({ action: 'link', kind, recordId, linked }, true)
    if (saved) { setSelection(current => ({ ...current, [kind]: '' })); loadOptions(); toast.success(linked ? 'Record linked to job' : 'Record unlinked; original retained') }
  }
  const financials = job.invoices.filter(invoice => ['SENT', 'OVERDUE', 'PAID'].includes(invoice.status) && invoice.currency === 'AUD')
  const billed = financials.reduce((sum, invoice) => sum + invoice.total, 0)
  const received = financials.filter(invoice => invoice.status === 'PAID').reduce((sum, invoice) => sum + invoice.total, 0)
  const costs = job.expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const margin = financials.reduce((sum, invoice) => sum + invoice.total - invoice.tax, 0) - job.expenses.reduce((sum, expense) => sum + expense.amount - (expense.gstAmount || 0), 0)

  const recordSelect = (kind: 'invoice' | 'expense' | 'album', entries: { id: string; label: string }[]) => <div className="flex flex-wrap gap-2"><select aria-label={`Choose ${kind} to link`} className="job-input min-w-0 flex-1" value={selection[kind]} onChange={event => setSelection({ ...selection, [kind]: event.target.value })}><option value="">{entries.length ? `Choose existing ${kind}…` : `No available ${kind}s`}</option>{entries.map(entry => <option key={entry.id} value={entry.id}>{entry.label}</option>)}</select><button className="job-button" disabled={busy || !selection[kind]} onClick={() => linkRecord(kind, selection[kind], true)}><Link2 size={15} /> Link</button></div>

  return <div className="job-workspace space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><button className="inline-flex items-center gap-2 text-sm font-semibold text-dark-500 hover:text-primary-600" onClick={() => leave(onBack)}><ArrowLeft size={16} /> Back to jobs</button>{dirty ? <button className="job-button job-button-primary" disabled={busy} onClick={saveDetails}><Save size={15} /> Save changes</button> : <span className="inline-flex items-center gap-1.5 text-xs text-dark-500"><Lock size={13} /> Internal workspace</span>}</div>
    <section className="relative overflow-hidden rounded-2xl bg-[#111b2d] p-6 text-white sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="relative flex flex-col justify-between gap-6 sm:flex-row"><div><p className="editorial-kicker text-blue-300">{job.jobNumber} / {JOB_STATUS_LABELS[job.status]}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{job.title}</h2><p className="mt-3 text-sm text-slate-300">{job.customer?.user.name || 'Client not assigned'} <span className="mx-2 text-slate-500">/</span> {job.dueDate ? `Due ${formatDate(job.dueDate)}` : 'Delivery date to be confirmed'}</p></div><div className="min-w-[160px]"><p className="text-xs text-slate-400">Checklist progress</p><p className="mt-1 text-3xl font-light">{percent}<span className="text-lg text-slate-400">%</span></p><div className="mt-3 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: `${percent}%` }} /></div><p className="mt-2 text-xs text-slate-400">{done} of {job.tasks.length} tasks complete</p></div></div>
      <div className="relative mt-7 grid grid-cols-5 gap-1 border-t border-white/10 pt-5">{JOB_STAGES.map((stage, index) => <div key={stage.key} className={`flex flex-col gap-1 text-[10px] sm:flex-row sm:items-center sm:gap-2 sm:text-xs ${stage.key === activeStage.key ? 'text-blue-300' : 'text-slate-400'}`}><span className={`flex h-6 w-6 items-center justify-center rounded-full border ${stage.key === activeStage.key ? 'border-blue-400 bg-blue-400/10' : 'border-slate-600'}`}>{index + 1}</span>{stage.label}</div>)}</div>
    </section>

    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="min-w-0 space-y-5">
        <nav aria-label="Job sections" className="flex overflow-x-auto border-b border-dark-200">{(['overview', 'checklist', 'delivery', 'money'] as const).map(section => <button key={section} onClick={() => setTab(section)} aria-current={tab === section ? 'page' : undefined} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold capitalize ${tab === section ? 'border-blue-600 text-blue-700' : 'border-transparent text-dark-500 hover:text-dark-900'}`}>{section === 'overview' ? 'Brief & details' : section === 'checklist' ? `Checklist · ${done}/${job.tasks.length}` : section === 'delivery' ? `Delivery · ${job.albums.length}` : 'Money'}</button>)}</nav>
        {tab === 'overview' && <div className="space-y-5">
          <section className="job-panel"><div className="job-section-heading"><div><h3>The brief</h3><p>Define what success looks like for this client.</p></div><FileText size={20} className="text-blue-500" /></div><div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="job-label sm:col-span-2">Job title<input className="job-input" value={details.title} maxLength={120} onChange={event => setDetails({ ...details, title: event.target.value })} /></label>
            <label className="job-label">Client<select className="job-input" value={details.customerId} onChange={event => setDetails({ ...details, customerId: event.target.value })}><option value="">Assign later</option>{customers.map(customer => <option key={customer.id} value={customer.id}>{customer.user.name}</option>)}</select></label>
            <label className="job-label">Priority<select className="job-input" value={details.priority} onChange={event => setDetails({ ...details, priority: event.target.value })}>{['LOW', 'NORMAL', 'HIGH', 'URGENT'].map(priority => <option key={priority}>{priority}</option>)}</select></label>
            <label className="job-label sm:col-span-2">Client goal <span className="job-field-note">Visible in the client portal</span><textarea className="job-input" rows={4} value={details.clientGoal} maxLength={2000} onChange={event => setDetails({ ...details, clientGoal: event.target.value })} placeholder="Audience, deliverables and the result the client needs…" /></label>
          </div>{job.inquiry && <details className="mt-5 rounded-lg bg-slate-50 p-4 text-sm"><summary className="cursor-pointer font-semibold text-dark-700">Original inquiry · {job.inquiry.name}</summary><p className="mt-3 whitespace-pre-wrap text-dark-600">{job.inquiry.message || job.inquiry.email}</p></details>}</section>
          <section className="job-panel"><div className="job-section-heading"><div><h3>Schedule & scope</h3><p>The dates, services and value agreed with your client.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="job-label">Production / shoot date<input type="date" className="job-input" value={details.startDate} onChange={event => setDetails({ ...details, startDate: event.target.value })} /></label><label className="job-label">Target delivery<input type="date" className="job-input" value={details.dueDate} onChange={event => setDetails({ ...details, dueDate: event.target.value })} /></label><label className="job-label">Location<input className="job-input" value={details.location} onChange={event => setDetails({ ...details, location: event.target.value })} placeholder="Studio, venue or remote" /></label><label className="job-label">Quoted value (AUD)<input type="number" min="0" step="0.01" className="job-input" value={details.quotedAmount} onChange={event => setDetails({ ...details, quotedAmount: Number(event.target.value) })} /></label></div>
            <div className="mt-5 flex flex-wrap gap-2">{SERVICE_TYPES.map(type => <button key={type} type="button" aria-pressed={details.services.some(service => service.serviceType === type)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${details.services.some(service => service.serviceType === type) ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-dark-200 text-dark-500'}`} onClick={() => setDetails({ ...details, services: details.services.some(service => service.serviceType === type) ? details.services.filter(service => service.serviceType !== type) : [...details.services, { serviceType: type, scope: '', status: 'PLANNED' }] })}>{readableService(type)}</button>)}</div>
            {details.services.map((service, index) => <div key={service.serviceType} className="mt-4 grid gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-[1fr_140px]"><label className="job-label">{readableService(service.serviceType)}<input className="job-input" value={service.scope} placeholder="Deliverables, quantities, format…" onChange={event => setDetails({ ...details, services: details.services.map((item, i) => i === index ? { ...item, scope: event.target.value } : item) })} /></label><label className="job-label">Service progress<select className="job-input" value={service.status} onChange={event => setDetails({ ...details, services: details.services.map((item, i) => i === index ? { ...item, status: event.target.value } : item) })}><option value="PLANNED">Planned</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETE">Complete</option></select></label></div>)}
          </section>
          <section className="job-panel"><label className="job-label">Internal notes <span className="job-field-note">Only visible to admins</span><textarea className="job-input" rows={5} value={details.internalNotes} maxLength={4000} onChange={event => setDetails({ ...details, internalNotes: event.target.value })} placeholder="Decisions, production notes, feedback to resolve…" /></label></section>
        </div>}

        {tab === 'checklist' && <section className="job-panel"><div className="job-section-heading"><div><h3>From brief to delivery</h3><p>Work through each stage. Tasks never advance the client status automatically.</p></div></div>{!job.tasks.length && <div className="my-5 rounded-xl bg-blue-50 p-5"><p className="mb-3 text-sm text-dark-600">Start with the studio checklist, or add your own tasks below.</p><button disabled={busy} className="job-button" onClick={() => mutate({ action: 'template' }, true)}><Plus size={15} /> Add studio checklist</button></div>}
          {JOB_STAGES.map(stage => <div key={stage.key} className="mt-6"><div className="mb-2 flex items-center gap-2"><h4 className="text-xs font-bold uppercase tracking-wider text-dark-500">{stage.label}</h4>{stage.key === activeStage.key && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">CURRENT</span>}</div>{job.tasks.filter(task => task.stage === stage.key).map(task => <div key={task.id} className="flex items-center gap-3 border-b border-dark-100 py-3"><label className={`flex flex-1 cursor-pointer items-start gap-3 text-sm ${task.completed ? 'text-dark-400 line-through' : 'text-dark-800'}`}><input type="checkbox" className="mt-0.5 h-4 w-4 accent-blue-600" disabled={busy} checked={task.completed} onChange={event => mutate({ action: 'toggleTask', taskId: task.id, completed: event.target.checked }, true)} />{task.title}</label><button aria-label={`Remove task: ${task.title}`} disabled={busy} className="rounded p-1 text-dark-400 hover:bg-red-50 hover:text-red-600" onClick={() => { if (confirm(`Remove task “${task.title}”?`)) mutate({ action: 'deleteTask', taskId: task.id }, true) }}><X size={15} /></button></div>)}</div>)}
          <form className="mt-6 grid gap-2 sm:grid-cols-[1fr_120px_auto]" onSubmit={async event => { event.preventDefault(); if (await mutate({ action: 'addTask', title: taskTitle, stage: taskStage }, true)) setTaskTitle('') }}><input aria-label="New task" required maxLength={200} className="job-input" value={taskTitle} onChange={event => setTaskTitle(event.target.value)} placeholder="Add a specific next step…" /><select aria-label="Task stage" className="job-input" value={taskStage} onChange={event => setTaskStage(event.target.value)}>{JOB_STAGES.map(stage => <option key={stage.key} value={stage.key}>{stage.label}</option>)}</select><button className="job-button" disabled={busy || !taskTitle.trim()}><Plus size={15} /> Add</button></form>
        </section>}

        {tab === 'delivery' && <section className="job-panel"><div className="job-section-heading"><div><h3>Job albums</h3><p>Keep source material and final deliverables together.</p></div><Image size={20} className="text-blue-500" /></div><p className="my-4 rounded-lg bg-blue-50 p-3 text-xs leading-5 text-blue-800">Linking an album organises this workspace. Public visibility and private client permissions are still managed in Albums.</p>{optionError && <p className="text-sm text-red-600">Could not load available records. <button onClick={loadOptions} className="underline">Retry</button></p>}{recordSelect('album', options.albums.map(album => ({ id: album.id, label: `${album.title} · ${album.type}` })))}<div className="mt-5 space-y-3">{job.albums.map(({ album }) => <div key={album.id} className="flex items-center gap-4 rounded-xl border border-dark-100 p-4"><div className="rounded-lg bg-slate-100 p-3 text-blue-600"><Image size={20} /></div><div className="min-w-0 flex-1"><h4 className="font-semibold text-dark-800">{album.title}</h4><p className="mt-1 text-xs text-dark-500">{album.type} · {album._count.media} media items</p></div><button disabled={busy} aria-label={`Unlink ${album.title}`} onClick={() => linkRecord('album', album.id, false)} className="p-2 text-dark-400 hover:text-red-600"><X size={16} /></button></div>)}{!job.albums.length && <p className="py-8 text-center text-sm text-dark-500">No albums linked yet. Choose an existing album above.</p>}</div>{onRecords && <button className="job-button mt-5" onClick={() => leave(() => onRecords('albums'))}>Open album manager <ArrowUpRight size={15} /></button>}</section>}

        {tab === 'money' && <div className="space-y-5"><div className="grid grid-cols-2 gap-3">{[{ label: 'Invoiced', value: billed }, { label: 'Received', value: received }, { label: 'Outstanding', value: billed - received }, { label: 'Linked costs', value: costs }].map(item => <div key={item.label} className="job-panel !p-4"><p className="text-xs text-dark-500">{item.label} · AUD</p><p className="mt-2 text-2xl font-semibold tracking-tight text-dark-900">{formatCurrency(item.value)}</p></div>)}</div><div className="rounded-xl bg-[#111b2d] p-5 text-white"><div className="flex flex-wrap justify-between gap-3"><p className="text-sm text-slate-300">Recorded margin, excluding GST</p><strong className="text-xl">{formatCurrency(margin)}</strong></div><p className="mt-2 text-xs leading-5 text-slate-400">AUD invoices less linked expenses, excluding recorded tax. Includes unpaid invoices; labour and unrecorded costs are not included.</p></div>
          {optionError && <p className="text-sm text-red-600">Could not load records. <button onClick={loadOptions} className="underline">Retry</button></p>}
          <section className="job-panel"><div className="job-section-heading"><div><h3>Payment requests</h3><p>Link invoices belonging to this job’s client.</p></div></div><div className="mt-4">{recordSelect('invoice', options.invoices.map(invoice => ({ id: invoice.id, label: `${invoice.invoiceNumber} · ${formatCurrency(invoice.total)}` })))}</div>{!job.customerId && <p className="mt-2 text-xs text-amber-700">Assign and save a client first to link invoices.</p>}{job.invoices.map(invoice => <div key={invoice.id} className="mt-3 flex items-center justify-between gap-3 border-t border-dark-100 pt-3"><div><a className="text-sm font-semibold text-blue-700 hover:underline" href={`/api/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer">{invoice.invoiceNumber}</a><p className="text-xs text-dark-500">{invoice.status} · {invoice.currency}</p></div><span className="ml-auto text-sm font-semibold">{formatCurrency(invoice.total)}</span><button disabled={busy} aria-label={`Unlink ${invoice.invoiceNumber}`} onClick={() => linkRecord('invoice', invoice.id, false)} className="p-2 text-dark-400 hover:text-red-600"><X size={15} /></button></div>)}{onRecords && <button className="job-button mt-5" onClick={() => leave(() => onRecords('invoices'))}>Manage payment requests <ArrowUpRight size={15} /></button>}</section>
          <section className="job-panel"><div className="job-section-heading"><div><h3>Production expenses</h3><p>Attach costs recorded for this job.</p></div></div><div className="mt-4">{recordSelect('expense', options.expenses.map(expense => ({ id: expense.id, label: `${expense.description} · ${formatCurrency(expense.amount)}` })))}</div>{job.expenses.map(expense => <div key={expense.id} className="mt-3 flex items-center gap-3 border-t border-dark-100 pt-3"><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{expense.description}</p><p className="text-xs text-dark-500">{expense.expenseNumber} {expense.vendor && `· ${expense.vendor}`}</p></div><span className="text-sm font-semibold">{formatCurrency(expense.amount)}</span><button disabled={busy} aria-label={`Unlink ${expense.expenseNumber}`} onClick={() => linkRecord('expense', expense.id, false)} className="p-2 text-dark-400 hover:text-red-600"><X size={15} /></button></div>)}{onRecords && <button className="job-button mt-5" onClick={() => leave(() => onRecords('expenses'))}>Manage expenses <ArrowUpRight size={15} /></button>}</section>
        </div>}
      </div>

      <aside className="space-y-5"><section className="job-panel !border-blue-200 !bg-blue-50/60"><p className="editorial-kicker text-blue-700">Keep it moving</p><h3 className="mt-2 text-lg font-semibold">Next action</h3><label className="job-label mt-4">What needs to happen?<textarea rows={3} maxLength={500} className="job-input" value={nextAction} onChange={event => setNextAction(event.target.value)} placeholder="e.g. Send the first edit for approval" /></label><label className="job-label mt-3">Follow up on<input type="date" className="job-input" value={nextDue} onChange={event => setNextDue(event.target.value)} /></label><button className="job-button job-button-primary mt-4 w-full" disabled={busy || !dirty} onClick={saveDetails}><Save size={15} />{busy ? 'Saving…' : 'Save job details'}</button><p aria-live="polite" className="mt-2 text-xs text-dark-500">{dirty ? 'You have unsaved changes.' : 'All details saved.'}</p></section>
        <section className="job-panel"><label className="job-label">Client-visible stage<select className="job-input" disabled={busy} value={job.status} onChange={event => mutate({ status: event.target.value })}>{Object.entries(JOB_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><p className="mt-3 text-xs leading-5 text-dark-500">{activeStage.hint}</p><button disabled={busy} onClick={() => mutate({ status: job.status === 'ARCHIVED' ? 'LEAD' : 'ARCHIVED' })} className="mt-4 text-xs font-semibold text-blue-700 hover:underline">{job.status === 'ARCHIVED' ? 'Reopen job as lead' : 'Archive this job'} <ChevronRight className="inline" size={12} /></button></section>
        <section className="job-panel"><p className="editorial-kicker text-dark-400">Client</p><h3 className="mt-3 font-semibold">{job.customer?.user.name || 'Unassigned'}</h3>{job.customer && <a className="mt-1 block break-all text-sm text-blue-700 hover:underline" href={`mailto:${job.customer.user.email}`}>{job.customer.user.email}</a>}<p className="mt-4 border-t border-dark-100 pt-4 text-xs leading-5 text-dark-500">Only the project stage, dates, goal and service progress are shown to the client. Your checklist, next action, notes and costs stay internal.</p></section>
      </aside>
    </div>
  </div>
}
