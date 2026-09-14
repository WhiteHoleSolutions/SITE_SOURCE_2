export const JOB_STAGES = [
  { key: 'LEAD', label: 'Plan', statuses: ['LEAD', 'SCOPED', 'QUOTE_SENT'], hint: 'Clarify the brief and agree on the scope.' },
  { key: 'SCHEDULED', label: 'Schedule', statuses: ['CONFIRMED', 'SCHEDULED'], hint: 'Confirm dates, location and everything you need.' },
  { key: 'IN_PRODUCTION', label: 'Create', statuses: ['IN_PRODUCTION'], hint: 'Produce the work and prepare the first delivery.' },
  { key: 'CLIENT_REVIEW', label: 'Review', statuses: ['CLIENT_REVIEW', 'READY_TO_DELIVER'], hint: 'Collect feedback and approve the final work.' },
  { key: 'COMPLETE', label: 'Deliver', statuses: ['COMPLETE', 'ARCHIVED'], hint: 'Deliver files, reconcile payment and close the job.' },
] as const

export const JOB_STATUS_LABELS: Record<string, string> = {
  LEAD: 'Lead', SCOPED: 'Scoped', QUOTE_SENT: 'Quote sent', CONFIRMED: 'Confirmed',
  SCHEDULED: 'Scheduled', IN_PRODUCTION: 'In production', CLIENT_REVIEW: 'Client review',
  READY_TO_DELIVER: 'Ready to deliver', COMPLETE: 'Complete', ARCHIVED: 'Archived',
}

export const DEFAULT_JOB_TASKS = [
  { stage: 'LEAD', title: 'Confirm client brief and deliverables' },
  { stage: 'LEAD', title: 'Agree on scope and price' },
  { stage: 'SCHEDULED', title: 'Confirm production date and location' },
  { stage: 'SCHEDULED', title: 'Prepare equipment, assets and access' },
  { stage: 'IN_PRODUCTION', title: 'Produce and back up the work' },
  { stage: 'IN_PRODUCTION', title: 'Complete quality check' },
  { stage: 'CLIENT_REVIEW', title: 'Share work for client review' },
  { stage: 'CLIENT_REVIEW', title: 'Resolve feedback and confirm approval' },
  { stage: 'COMPLETE', title: 'Deliver final files or finished product' },
  { stage: 'COMPLETE', title: 'Check payment and close out the job' },
]

export function stageFor(status: string) {
  return JOB_STAGES.find(stage => (stage.statuses as readonly string[]).includes(status)) || JOB_STAGES[0]
}

export function readableService(value: string) {
  const labels: Record<string, string> = { PHOTO_VIDEO: 'Photo & video', DRONE: 'Drone', PRODUCT_IMAGERY: 'Product imagery', PRINT: 'Print & promotion', WEBSITE: 'Website', SOFTWARE: 'Software' }
  return labels[value] || value.toLowerCase().replaceAll('_', ' ').replace(/^\w/, char => char.toUpperCase())
}

export type WorkspaceTask = { id: string; title: string; stage: string; completed: boolean }
export type WorkspaceJob = {
  id: string; jobNumber: string; title: string; status: string; priority: string
  customerId: string | null; clientGoal: string | null; internalNotes: string | null
  nextAction: string | null; nextActionDue: string | null; startDate: string | null
  dueDate: string | null; location: string | null; quotedAmount: number
  customer: { user: { name: string; email: string } } | null
  inquiry: { name: string; email: string; message?: string } | null
  services: { id: string; serviceType: string; scope: string | null; status: string }[]
  tasks: WorkspaceTask[]
  invoices: { id: string; invoiceNumber: string; status: string; total: number; tax: number; currency: string }[]
  expenses: { id: string; expenseNumber: string; description: string; amount: number; gstAmount: number | null; vendor: string | null }[]
  albums: { albumId: string; album: { id: string; title: string; type: string; _count: { media: number } } }[]
}
