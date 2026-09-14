'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { LogOut, Download, FileDown, Briefcase, CalendarDays } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Customer {
  id: string
  user: {
    name: string
    email: string
  }
  totalSpent: number
  jobsCompleted: number
  invoices: any[]
  albumAccess: any[]
}

interface ClientJob {
  id: string
  jobNumber: string
  title: string
  status: string
  clientGoal?: string | null
  startDate?: string | null
  dueDate?: string | null
  services: { id: string; serviceType: string; status: string }[]
}

const CLIENT_STAGES = ['Plan', 'Scheduled', 'Creating', 'Review', 'Delivered']

function jobStageIndex(status: string) {
  if (['LEAD', 'SCOPED', 'QUOTE_SENT'].includes(status)) return 0
  if (['CONFIRMED', 'SCHEDULED'].includes(status)) return 1
  if (status === 'IN_PRODUCTION') return 2
  if (['CLIENT_REVIEW', 'READY_TO_DELIVER'].includes(status)) return 3
  return 4
}

function jobStageLabel(status: string) {
  return CLIENT_STAGES[jobStageIndex(status)]
}

function readableService(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase())
}

export default function DashboardPage() {
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [albums, setAlbums] = useState<any[]>([])
  const [jobs, setJobs] = useState<ClientJob[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null)
  const [loadedAlbums, setLoadedAlbums] = useState<Set<string>>(new Set())
  const [businessName, setBusinessName] = useState('White Hole Solutions')

  useEffect(() => {
    fetchCustomerData()
    fetchAlbums()
    fetchJobs()
    
    // Fetch business name
    fetch('/api/business-info/public')
      .then(res => res.json())
      .then(data => {
        if (data.businessInfo?.businessName) {
          setBusinessName(data.businessInfo.businessName)
        }
      })
      .catch(console.error)
  }, [])

  const fetchCustomerData = async () => {
    try {
      const meResponse = await fetch('/api/auth/me')
      const meData = await meResponse.json()

      if (!meData.user || meData.user.role !== 'CUSTOMER') {
        router.push('/login')
        return
      }

      const customerResponse = await fetch('/api/customers/me')
      const customerData = await customerResponse.json()
      
      if (customerData.customer) {
        setCustomer(customerData.customer)
      } else {
        toast.error('Customer profile not found')
      }
    } catch (error) {
      console.error('Error fetching customer data:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchAlbums = async () => {
    try {
      const response = await fetch('/api/customers/albums')
      const data = await response.json()
      
      if (data.albums) {
        setAlbums(data.albums)
      }
    } catch (error) {
      console.error('Error fetching albums:', error)
    }
  }

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/customers/jobs')
      const data = await response.json()
      if (response.ok) setJobs(data.jobs || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  const markAlbumLoaded = (id: string) => {
    setLoadedAlbums(current => current.has(id) ? current : new Set(current).add(id))
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const handlePayInvoice = async (invoice: any) => {
    // If the invoice has a payment link, use that
    if (invoice.paymentLink) {
      window.open(invoice.paymentLink, '_blank')
      toast.success('Opening payment link...')
      return
    }

    // Otherwise, fall back to the old Revolut API integration
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pay`, {
        method: 'POST',
      })
      const data = await response.json()

      if (response.ok && data.paymentUrl) {
        window.open(data.paymentUrl, '_blank')
        toast.success('Redirecting to payment...')
      } else {
        toast.error(data.error || 'Failed to create payment')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${invoiceId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Invoice downloaded')
      } else {
        toast.error('Failed to download invoice')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Customer not found</div>
      </div>
    )
  }

  return (
    <div className="portal-shell">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111211]/95 text-white backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-4 sm:py-5 flex justify-between items-center">
          <div><p className="editorial-kicker text-[#65a7ff]">Client portal</p><h1 className="mt-1 text-lg sm:text-xl font-semibold tracking-[-.03em]">{businessName}</h1></div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline text-white/65 text-sm sm:text-base">Welcome, {customer.user.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 text-white/70 hover:text-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg hover:bg-white/10 transition"
            >
              <LogOut size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-8 sm:py-12">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="portal-card bg-[#111211] p-5 text-white sm:p-7">
            <h3 className="text-white/60 text-xs sm:text-sm font-medium">Total spent</h3>
            <p className="text-2xl sm:text-4xl font-semibold tracking-[-.04em] mt-3">
              {formatCurrency(customer.totalSpent)}
            </p>
          </div>
          <div className="portal-card bg-white p-5 sm:p-7">
            <h3 className="text-[#62665f] text-xs sm:text-sm font-medium">Projects completed</h3>
            <p className="text-2xl sm:text-4xl font-semibold tracking-[-.04em] text-[#111211] mt-3">
              {customer.jobsCompleted}
            </p>
          </div>
        </div>

        {/* Jobs */}
        {jobs.length > 0 && (
          <section className="mb-6 sm:mb-8">
            <div className="flex items-end justify-between gap-4 mb-3 sm:mb-4">
              <div>
                <p className="editorial-kicker text-[#216ac4]">Live workspace</p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-.04em] text-[#111211]">Your projects</h2>
                <p className="mt-1 text-sm text-[#62665f]">Follow your work from planning through to delivery.</p>
              </div>
              <Briefcase className="text-primary-500" size={24} aria-hidden="true" />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {jobs.map(job => {
                const stage = jobStageIndex(job.status)
                return (
                  <article key={job.id} className="portal-card bg-white p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold tracking-wide text-primary-600">{job.jobNumber}</p>
                        <h3 className="mt-1 text-lg font-semibold text-dark-900">{job.title}</h3>
                      </div>
                      <span className="rounded-full bg-[#dbeafe] px-3 py-1 text-xs font-bold text-[#216ac4]">{jobStageLabel(job.status)}</span>
                    </div>
                    {job.clientGoal && <p className="mt-3 text-sm leading-6 text-dark-600">{job.clientGoal}</p>}
                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs font-medium text-dark-500"><span>Project progress</span><span>{CLIENT_STAGES[stage]}</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#e8e4dc]"><div className="h-full rounded-full bg-[#3b82f6] transition-all" style={{ width: `${((stage + 1) / CLIENT_STAGES.length) * 100}%` }} /></div>
                      <div className="mt-2 flex justify-between text-[10px] font-medium text-dark-400">{CLIENT_STAGES.map(item => <span key={item} className={CLIENT_STAGES.indexOf(item) <= stage ? 'text-[#216ac4]' : ''}>{item}</span>)}</div>
                    </div>
                    <div className="mt-5 flex flex-col gap-2 border-t border-dark-100 pt-4 text-sm text-dark-600 sm:flex-row sm:items-center sm:justify-between">
                      <span>{job.services.length ? job.services.map(service => readableService(service.serviceType)).join(' · ') : 'Project details being prepared'}</span>
                      {job.dueDate && <span className="inline-flex shrink-0 items-center gap-1 text-xs"><CalendarDays size={14} /> Target: {formatDate(job.dueDate)}</span>}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="mb-4"><p className="editorial-kicker text-[#216ac4]">Delivered media</p><h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-.04em] text-[#111211]">Albums</h2></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {albums.map((album: any) => (
                <div
                  key={album.id}
                  className="portal-card bg-white overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-lg transition active:scale-95"
                  onClick={() => setSelectedAlbum(album)}
                >
                  <div className="relative h-48">
                    {album.media && album.media[0] ? (
                      album.media[0].type === 'IMAGE' ? (
                        <Image
                          src={album.media[0].url}
                          alt={album.title}
                          fill
                          className={`object-cover transition-opacity duration-700 ${loadedAlbums.has(album.id) ? 'opacity-100' : 'opacity-0'}`}
                          onLoadingComplete={() => markAlbumLoaded(album.id)}
                        />
                      ) : (
                        <div className={`relative h-full w-full transition-opacity duration-700 ${loadedAlbums.has(album.id) ? 'opacity-100' : 'opacity-0'}`}>
                          <video
                            src={album.media[0].url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                            onLoadedData={() => markAlbumLoaded(album.id)}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center" />
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-dark-900 flex-1">{album.title}</h3>
                      {album.permission === 'DOWNLOAD' && (
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          <Download size={12} className="inline" /> Download
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-dark-600 mt-1">
                      {album.media?.length || 0} items
                    </p>
                    {album.description && (
                      <p className="text-xs text-dark-500 mt-2 line-clamp-2">
                        {album.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoices */}
        <div>
          <div className="mb-4"><p className="editorial-kicker text-[#216ac4]">Finance</p><h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-.04em] text-[#111211]">Your invoices</h2></div>
          
          {/* Desktop Table */}
          <div className="portal-card hidden md:block bg-white overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-200">
              <thead className="bg-dark-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                    Issued
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-dark-200">
                {customer.invoices.map((invoice: any) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600">
                      {formatDate(invoice.issuedAt || invoice.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600">
                      {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-600">
                      {invoice.items?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-dark-900">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                        invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="text-dark-600 hover:text-primary-600 transition"
                          title="Download PDF"
                        >
                          <FileDown size={18} />
                        </button>
                        {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handlePayInvoice(invoice)}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {customer.invoices.map((invoice: any) => (
              <div key={invoice.id} className="bg-white rounded-lg shadow p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-dark-900">{invoice.invoiceNumber}</div>
                    <div className="text-xs text-dark-600 mt-1">
                      Issued: {formatDate(invoice.issuedAt || invoice.createdAt)}
                    </div>
                    {invoice.dueDate && (
                      <div className="text-xs text-dark-600">
                        Due: {formatDate(invoice.dueDate)}
                      </div>
                    )}
                    <div className="text-xs text-dark-600">
                      {invoice.items?.length || 0} item{invoice.items?.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'SENT' ? 'bg-blue-100 text-blue-800' :
                    invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="text-lg font-semibold text-dark-900">
                    {formatCurrency(invoice.total)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      className="bg-dark-200 hover:bg-dark-300 text-dark-900 px-3 py-2 rounded-lg text-sm font-medium transition active:scale-95 flex items-center gap-1"
                    >
                      <FileDown size={16} />
                      PDF
                    </button>
                    {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handlePayInvoice(invoice)}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition active:scale-95"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Album Modal */}
      {selectedAlbum && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAlbum(null)}
        >
          <div
            className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-3xl font-bold text-dark-900">{selectedAlbum.title}</h3>
              <button
                onClick={() => setSelectedAlbum(null)}
                className="text-dark-600 hover:text-dark-900 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6">
              {selectedAlbum.media.map((media: any) => (
                <div key={media.id} className="relative">
                  <div className="relative h-64 rounded-lg overflow-hidden">
                    {media.type === 'IMAGE' ? (
                      <Image
                        src={media.url}
                        alt={media.title || 'Media'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <video 
                        src={media.url} 
                        controls 
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover" 
                      />
                    )}
                  </div>
                  {selectedAlbum.permission === 'DOWNLOAD' && (
                    <a
                      href={media.url}
                      download
                      className="mt-2 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition"
                    >
                      <Download size={16} />
                      Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
