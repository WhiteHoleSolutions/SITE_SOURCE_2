'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { LogOut, Image, Users, MessageSquare, FileText, Settings, Receipt, DollarSign, BarChart3 } from 'lucide-react'
import AlbumsTab from '@/components/admin/AlbumsTab'
import CustomersTab from '@/components/admin/CustomersTab'
import InquiriesTab from '@/components/admin/InquiriesTab'
import InvoicesTab from '@/components/admin/InvoicesTab'
import BusinessSettingsTab from '@/components/admin/BusinessSettingsTab'
import BillsOfSaleTab from '@/components/admin/BillsOfSaleTab'
import ExpensesTab from '@/components/admin/ExpensesTab'
import AnalyticsTab from '@/components/admin/AnalyticsTab'

type Tab = 'albums' | 'customers' | 'inquiries' | 'invoices' | 'bills' | 'expenses' | 'analytics' | 'settings'

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('albums')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()

      if (!data.user || data.user.role !== 'ADMIN') {
        router.push('/login')
        return
      }

      setUser(data.user)
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  const tabs = [
    { id: 'albums' as Tab, label: 'Albums', icon: Image },
    { id: 'customers' as Tab, label: 'Customers', icon: Users },
    { id: 'inquiries' as Tab, label: 'Inquiries', icon: MessageSquare },
    { id: 'invoices' as Tab, label: 'Invoices', icon: FileText },
    { id: 'bills' as Tab, label: 'Bills of Sale', icon: Receipt },
    { id: 'expenses' as Tab, label: 'Expenses', icon: DollarSign },
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
          <h1 className="text-lg sm:text-2xl font-bold text-primary-600">Admin Panel</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline text-dark-600">Welcome, {user?.name}</span>
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

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Tabs - Horizontal scroll on mobile */}
        <div className="bg-white rounded-lg shadow mb-6">
          <nav className="flex border-b overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium border-b-2 transition whitespace-nowrap text-sm sm:text-base min-w-fit ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-dark-600 hover:text-dark-900 hover:bg-dark-50'
                  }`}
                >
                  <Icon size={18} className="sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">{tab.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="p-3 sm:p-6">
            {activeTab === 'albums' && <AlbumsTab />}
            {activeTab === 'customers' && <CustomersTab />}
            {activeTab === 'inquiries' && <InquiriesTab />}
            {activeTab === 'invoices' && <InvoicesTab />}
            {activeTab === 'bills' && <BillsOfSaleTab />}
            {activeTab === 'expenses' && <ExpensesTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'settings' && <BusinessSettingsTab />}
          </div>
        </div>
      </div>
    </div>
  )
}
