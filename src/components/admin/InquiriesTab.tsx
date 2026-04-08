'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Search, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const INQUIRY_STATUSES = ['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED']

export default function InquiriesTab() {
  const [inquiries, setInquiries] = useState<any[]>([])
  const [filteredInquiries, setFilteredInquiries] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name'>('date-desc')

  useEffect(() => {
    fetchInquiries()
  }, [])

  useEffect(() => {
    filterAndSortInquiries()
  }, [inquiries, searchTerm, statusFilter, sortBy])

  const fetchInquiries = async () => {
    try {
      const response = await fetch('/api/inquiries')
      const data = await response.json()
      setInquiries(data.inquiries || [])
    } catch (error) {
      toast.error('Failed to fetch inquiries')
    }
  }

  const filterAndSortInquiries = () => {
    let filtered = [...inquiries]

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (inq) =>
          inq.name.toLowerCase().includes(search) ||
          inq.email.toLowerCase().includes(search) ||
          inq.phone.includes(search) ||
          inq.message.toLowerCase().includes(search)
      )
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((inq) => inq.status === statusFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    setFilteredInquiries(filtered)
  }

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success('Status updated')
        fetchInquiries()
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleDelete = async (inquiryId: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return

    try {
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Inquiry deleted')
        fetchInquiries()
      } else {
        toast.error('Failed to delete inquiry')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800'
      case 'CONTACTED':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONVERTED':
        return 'bg-green-100 text-green-800'
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-dark-900">Inquiries</h2>
        <div className="text-xs sm:text-sm text-dark-600">
          Showing {filteredInquiries.length} of {inquiries.length}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border rounded-lg p-4 mb-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="sm:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, phone, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900"
            >
              <option value="ALL">All Statuses</option>
              {INQUIRY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-dark-700 font-medium">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-dark-900"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {filteredInquiries.map((inquiry) => (
          <div key={inquiry.id} className="bg-white border rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3 sm:mb-4">
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-dark-900">{inquiry.name}</h3>
                <div className="flex flex-col sm:flex-row sm:gap-4 mt-1 text-sm text-dark-600">
                  <span className="break-all">{inquiry.email}</span>
                  <span>{inquiry.phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs sm:text-sm text-dark-700 whitespace-nowrap">
                  {formatDate(inquiry.createdAt)}
                </div>
                <button
                  onClick={() => handleDelete(inquiry.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  title="Delete inquiry"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-3">
              <p className="text-sm sm:text-base text-dark-700 whitespace-pre-wrap">{inquiry.message}</p>
            </div>

            {/* Status and Customer Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t">
              <div className="flex items-center gap-2">
                <label className="text-sm text-dark-700 font-medium">Status:</label>
                <select
                  value={inquiry.status}
                  onChange={(e) => handleStatusChange(inquiry.id, e.target.value)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(inquiry.status)}`}
                >
                  {INQUIRY_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              
              {inquiry.customer && (
                <span className="text-xs sm:text-sm text-green-600 font-medium">
                  ✓ Customer profile created
                </span>
              )}
            </div>
          </div>
        ))}
        
        {filteredInquiries.length === 0 && (
          <div className="text-center py-12 text-dark-700 text-sm sm:text-base">
            {searchTerm || statusFilter !== 'ALL' ? 'No inquiries match your filters' : 'No inquiries yet'}
          </div>
        )}
      </div>
    </div>
  )
}
