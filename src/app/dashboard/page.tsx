'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { LogOut, Download, FileDown } from 'lucide-react'
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

export default function DashboardPage() {
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [albums, setAlbums] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null)
  const [businessName, setBusinessName] = useState('White Hole Solutions')

  useEffect(() => {
    fetchCustomerData()
    fetchAlbums()
    
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
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
          <h1 className="text-lg sm:text-2xl font-bold text-primary-600">{businessName}</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline text-dark-600 text-sm sm:text-base">Welcome, {customer.user.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 text-dark-600 hover:text-dark-900 px-2 py-1 sm:px-3 sm:py-2 rounded-lg hover:bg-dark-100 transition"
            >
              <LogOut size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-dark-600 text-xs sm:text-sm font-medium">Total Spent</h3>
            <p className="text-xl sm:text-3xl font-bold text-dark-900 mt-2">
              {formatCurrency(customer.totalSpent)}
            </p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-dark-600 text-xs sm:text-sm font-medium">Jobs Completed</h3>
            <p className="text-xl sm:text-3xl font-bold text-dark-900 mt-2">
              {customer.jobsCompleted}
            </p>
          </div>
        </div>

        {/* Albums */}
        {albums.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-dark-900 mb-3 sm:mb-4">Albums</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {albums.map((album: any) => (
                <div
                  key={album.id}
                  className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition active:scale-95"
                  onClick={() => setSelectedAlbum(album)}
                >
                  <div className="relative h-48">
                    {album.media && album.media[0] ? (
                      album.media[0].type === 'IMAGE' ? (
                        <Image
                          src={album.media[0].url}
                          alt={album.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <video
                            src={album.media[0].url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
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
          <h2 className="text-xl sm:text-2xl font-bold text-dark-900 mb-3 sm:mb-4">Your Invoices</h2>
          
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
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
