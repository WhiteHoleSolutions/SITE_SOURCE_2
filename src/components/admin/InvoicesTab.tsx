'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Download, Edit2, ExternalLink, FileText, Plus, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

type InvoiceItem = { description: string; quantity: number; unitPrice: number }
type Invoice = {
  id: string; invoiceNumber: string; customerId: string; items: InvoiceItem[]; notes: string | null
  dueDate: string | null; paymentLink: string | null; revolutOrderId: string | null
  status: string; paidAt: string | null; createdAt: string; total: number; tax: number
  customer: { user: { name: string; email: string } }
}
type Customer = { id: string; user: { name: string; email: string } }
type Draft = { customerId: string; items: InvoiceItem[]; notes: string; dueDate: string }

const emptyDraft = (): Draft => ({ customerId: '', items: [{ description: '', quantity: 1, unitPrice: 0 }], notes: '', dueDate: '' })

export default function InvoicesTab() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [taxRate, setTaxRate] = useState(10)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Invoice | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [saving, setSaving] = useState(false)
  const [merchantStatus, setMerchantStatus] = useState<{ connected: boolean; message: string } | null>(null)

  const subtotal = useMemo(() => draft.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [draft.items])
  const tax = useMemo(() => subtotal * taxRate / 100, [subtotal, taxRate])
  const total = subtotal + tax

  const load = async () => {
    try {
      const [invoicesResponse, customersResponse, settingsResponse] = await Promise.all([
        fetch('/api/invoices'), fetch('/api/customers'), fetch('/api/business-info'),
      ])
      if (!invoicesResponse.ok || !customersResponse.ok) throw new Error()
      const [invoiceData, customerData, settingsData] = await Promise.all([
        invoicesResponse.json(), customersResponse.json(), settingsResponse.json(),
      ])
      setInvoices(invoiceData.invoices || [])
      setCustomers(customerData.customers || [])
      if (typeof settingsData.businessInfo?.taxRate === 'number') setTaxRate(settingsData.businessInfo.taxRate)
    } catch {
      toast.error('Failed to load payment requests')
    }
  }

  useEffect(() => {
    load()
    fetch('/api/revolut/status').then(response => response.ok ? response.json() : null).then(setMerchantStatus).catch(() => setMerchantStatus({ connected: false, message: 'Connection status unavailable' }))
  }, [])

  const close = () => {
    setShowModal(false)
    setEditing(null)
    setDraft(emptyDraft())
  }

  const save = async () => {
    if (!draft.customerId || draft.items.some(item => !item.description.trim() || item.quantity < 1)) {
      toast.error('Choose a client and complete each line item')
      return
    }
    setSaving(true)
    try {
      const payload = { ...draft, tax, currency: 'AUD' }
      const response = await fetch(editing ? `/api/invoices/${editing.id}` : '/api/invoices', {
        method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      toast.success(editing ? 'Payment request updated' : 'Payment request created')
      close(); load()
    } catch (error: any) {
      toast.error(error.message || 'Unable to save payment request')
    } finally { setSaving(false) }
  }

  const openCheckout = async (invoice: Invoice) => {
    const popup = window.open('', '_blank')
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pay`, { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      if (popup) popup.location.href = data.paymentUrl
      else window.open(data.paymentUrl, '_blank')
      toast.success(invoice.paymentLink ? 'Opening Revolut checkout' : 'Revolut checkout created')
      load()
    } catch (error: any) {
      popup?.close()
      toast.error(error.message || 'Unable to open Revolut checkout')
    }
  }

  const download = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`)
      if (!response.ok) throw new Error()
      const url = URL.createObjectURL(await response.blob())
      const link = document.createElement('a')
      link.href = url; link.download = `Invoice-${invoice.invoiceNumber}.pdf`; link.click(); URL.revokeObjectURL(url)
    } catch { toast.error('Unable to download PDF') }
  }

  const remove = async (invoice: Invoice) => {
    if (!confirm(`Delete ${invoice.invoiceNumber}?`)) return
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      toast.success('Payment request deleted'); load()
    } catch (error: any) { toast.error(error.message || 'Unable to delete payment request') }
  }

  const edit = (invoice: Invoice) => {
    setEditing(invoice)
    setDraft({ customerId: invoice.customerId, items: invoice.items, notes: invoice.notes || '', dueDate: invoice.dueDate?.slice(0, 10) || '' })
    setShowModal(true)
  }

  const updateItem = (index: number, change: Partial<InvoiceItem>) => {
    setDraft(current => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...change } : item) }))
  }

  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="editorial-kicker text-[#216ac4]">Collections</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-dark-900">Payment requests</h2><p className="mt-1 text-sm text-dark-600">Create a clear request, then send clients to Revolut’s secure checkout.</p></div>
      <button onClick={() => setShowModal(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"><Plus size={17} /> New payment request</button>
    </div>

    <div className="rounded-xl border border-dark-100 bg-[#eef5ff] p-4 text-sm text-dark-700">Issuer details, GST ({taxRate}%), logo, and payment terms are taken from <strong>Business Settings</strong>. All new requests are in AUD.</div>
    {!merchantStatus?.connected && <div className="rounded-xl border border-dark-100 bg-dark-50 p-4 text-sm text-dark-700"><strong>Revolut checkout is unavailable.</strong> {merchantStatus?.message || 'Checking the Merchant connection…'} You can still create, edit, download, and manage payment requests.</div>}

    <div className="grid gap-4 lg:grid-cols-2">
      {invoices.map(invoice => <article key={invoice.id} className="rounded-xl border border-dark-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold tracking-wide text-primary-600">{invoice.invoiceNumber}</p><h3 className="mt-1 font-semibold text-dark-900">{invoice.customer.user.name}</h3><p className="mt-1 text-sm text-dark-500">Created {formatDate(invoice.createdAt)}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${invoice.status === 'PAID' ? 'bg-blue-100 text-blue-800' : invoice.status === 'SENT' ? 'bg-[#dbeafe] text-[#216ac4]' : 'bg-dark-100 text-dark-600'}`}>{invoice.status === 'SENT' ? 'AWAITING PAYMENT' : invoice.status}</span></div>
        <div className="mt-5 flex items-end justify-between border-y border-dark-100 py-4"><div><p className="text-xs text-dark-500">Total due</p><p className="mt-1 text-2xl font-semibold tracking-[-.04em] text-dark-900">{formatCurrency(invoice.total)}</p></div><p className="text-right text-xs text-dark-500">{invoice.dueDate ? `Due ${formatDate(invoice.dueDate)}` : 'No due date'}<br />{invoice.paidAt ? `Paid ${formatDate(invoice.paidAt)}` : 'AUD'}</p></div>
        <div className="mt-4 flex flex-wrap gap-2">
          {invoice.status !== 'PAID' && <button disabled={!merchantStatus?.connected} onClick={() => openCheckout(invoice)} className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-45"><ExternalLink size={15} />{invoice.paymentLink ? 'Open Revolut checkout' : 'Create Revolut checkout'}</button>}
          <button onClick={() => download(invoice)} className="inline-flex items-center gap-2 rounded-lg border border-dark-200 px-3 py-2 text-sm font-medium text-dark-700 hover:bg-dark-50"><Download size={15} /> PDF</button>
          {!invoice.revolutOrderId && invoice.status !== 'PAID' && <><button onClick={() => edit(invoice)} className="inline-flex items-center gap-2 rounded-lg border border-dark-200 px-3 py-2 text-sm font-medium text-dark-700 hover:bg-dark-50"><Edit2 size={15} /> Edit</button><button onClick={() => remove(invoice)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"><Trash2 size={15} /> Delete</button></>}
        </div>
      </article>)}
      {!invoices.length && <div className="col-span-full rounded-xl border border-dashed border-dark-200 bg-white p-12 text-center"><FileText className="mx-auto text-primary-500" size={28} /><h3 className="mt-3 font-semibold text-dark-900">No payment requests yet</h3><p className="mt-1 text-sm text-dark-600">Create one when a job is ready to collect payment.</p></div>}
    </div>

    {showModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="editorial-kicker text-[#216ac4]">{editing ? 'Update draft' : 'New payment request'}</p><h3 className="mt-2 text-xl font-semibold text-dark-900">{editing ? editing.invoiceNumber : 'Prepare a request'}</h3></div><button onClick={close} className="text-sm font-medium text-dark-500 hover:text-dark-900">Cancel</button></div>
      <div className="mt-6 space-y-5"><div><label className="block text-sm font-medium text-dark-800">Client</label><select value={draft.customerId} onChange={event => setDraft({ ...draft, customerId: event.target.value })} className="mt-2 w-full rounded-lg border border-dark-200 px-3 py-2.5"><option value="">Select a client</option>{customers.map(customer => <option key={customer.id} value={customer.id}>{customer.user.name} · {customer.user.email}</option>)}</select></div>
        <div><div className="mb-2 flex items-center justify-between"><label className="text-sm font-medium text-dark-800">What are they paying for?</label><button onClick={() => setDraft({ ...draft, items: [...draft.items, { description: '', quantity: 1, unitPrice: 0 }] })} className="text-sm font-semibold text-primary-600 hover:text-primary-700">+ Add line</button></div><div className="space-y-2">{draft.items.map((item, index) => <div key={index} className="grid grid-cols-12 gap-2"><input value={item.description} onChange={event => updateItem(index, { description: event.target.value })} placeholder="Service or deliverable" className="col-span-12 rounded-lg border border-dark-200 px-3 py-2.5 sm:col-span-6" /><input type="number" min="1" value={item.quantity} onChange={event => updateItem(index, { quantity: Number(event.target.value) || 0 })} className="col-span-3 rounded-lg border border-dark-200 px-3 py-2.5 sm:col-span-2" /><input type="number" min="0" step="0.01" value={item.unitPrice} onChange={event => updateItem(index, { unitPrice: Number(event.target.value) || 0 })} className="col-span-5 rounded-lg border border-dark-200 px-3 py-2.5 sm:col-span-3" />{draft.items.length > 1 && <button onClick={() => setDraft({ ...draft, items: draft.items.filter((_, itemIndex) => itemIndex !== index) })} className="col-span-2 rounded-lg text-red-600 hover:bg-red-50">×</button>}</div>)}</div></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><label className="block text-sm font-medium text-dark-800">Due date <span className="font-normal text-dark-500">(optional)</span></label><input type="date" value={draft.dueDate} onChange={event => setDraft({ ...draft, dueDate: event.target.value })} className="mt-2 w-full rounded-lg border border-dark-200 px-3 py-2.5" /></div><div className="rounded-lg bg-dark-50 p-3 text-sm"><div className="flex justify-between"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div><div className="mt-1 flex justify-between"><span>GST ({taxRate}%)</span><strong>{formatCurrency(tax)}</strong></div><div className="mt-2 flex justify-between border-t border-dark-200 pt-2 text-base"><span>Total due</span><strong>{formatCurrency(total)}</strong></div></div></div>
        <div><label className="block text-sm font-medium text-dark-800">Message for the client <span className="font-normal text-dark-500">(optional)</span></label><textarea value={draft.notes} onChange={event => setDraft({ ...draft, notes: event.target.value })} rows={3} className="mt-2 w-full rounded-lg border border-dark-200 px-3 py-2.5" placeholder="Thank you for choosing White Hole Solutions." /></div>
        <button disabled={saving} onClick={save} className="w-full rounded-lg bg-primary-500 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60">{saving ? 'Saving…' : editing ? 'Save changes' : 'Create payment request'}</button>
      </div></div></div>}
  </div>
}
