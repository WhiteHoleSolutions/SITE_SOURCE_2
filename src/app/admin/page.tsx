'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { LogOut, Image, Users, MessageSquare, FileText, Settings, Receipt, DollarSign, BarChart3, Briefcase, LayoutDashboard, FolderOpen, Globe } from 'lucide-react'
import AlbumsTab from '@/components/admin/AlbumsTab'
import CustomersTab from '@/components/admin/CustomersTab'
import InquiriesTab from '@/components/admin/InquiriesTab'
import InvoicesTab from '@/components/admin/InvoicesTab'
import BusinessSettingsTab from '@/components/admin/BusinessSettingsTab'
import BillsOfSaleTab from '@/components/admin/BillsOfSaleTab'
import ExpensesTab from '@/components/admin/ExpensesTab'
import AnalyticsTab from '@/components/admin/AnalyticsTab'
import JobsTab from '@/components/admin/JobsTab'
import BrandsTab from '@/components/admin/BrandsTab'
import RevolutStatus from '@/components/admin/RevolutStatus'

type Tab = 'today' | 'jobs' | 'brands' | 'albums' | 'customers' | 'inquiries' | 'invoices' | 'bills' | 'expenses' | 'analytics' | 'settings'

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('today')
  const [jobDirty, setJobDirty] = useState(false)
  const navigate = (tab: Tab) => {
    if (tab !== activeTab && (!jobDirty || confirm('Leave without saving your job changes?'))) setActiveTab(tab)
  }
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
    if (jobDirty && !confirm('Log out without saving your job changes?')) return
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

  const recordTabs = [
    { id: 'albums' as Tab, label: 'Albums', icon: Image },
    { id: 'customers' as Tab, label: 'Customers', icon: Users },
    { id: 'invoices' as Tab, label: 'Invoices', icon: FileText },
    { id: 'bills' as Tab, label: 'Bills of Sale', icon: Receipt },
    { id: 'expenses' as Tab, label: 'Expenses', icon: DollarSign },
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 },
  ]
  const inRecords = recordTabs.some(tab => tab.id === activeTab)
  const tabs = [
    { id: 'today' as Tab, label: 'Today', icon: LayoutDashboard, selected: activeTab === 'today' },
    { id: 'jobs' as Tab, label: 'Pipeline', icon: Briefcase, selected: activeTab === 'jobs' },
    { id: 'inquiries' as Tab, label: 'Inquiries', icon: MessageSquare, selected: activeTab === 'inquiries' },
    { id: 'customers' as Tab, label: 'Records', icon: FolderOpen, selected: inRecords },
    { id: 'brands' as Tab, label: 'Website', icon: Globe, selected: activeTab === 'brands' },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings, selected: activeTab === 'settings' },
  ]

  return (
    <div className="admin-workspace">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111211]/95 text-white backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-4 sm:py-5 flex flex-wrap justify-between items-center gap-3">
          <div><p className="editorial-kicker text-[#65a7ff]">White Hole Solutions</p><h1 className="mt-1 text-lg sm:text-xl font-semibold tracking-[-.03em]">Operations studio</h1></div>
          <div className="flex items-center gap-2 sm:gap-4">
            <RevolutStatus />
            <span className="hidden sm:inline text-white/65">Welcome, {user?.name}</span>
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

      <div className="max-w-7xl mx-auto px-3 sm:px-8 lg:px-10 py-6 sm:py-10">
        {/* Tabs - Horizontal scroll on mobile */}
        <div className="bg-white rounded-2xl shadow-[0_12px_40px_rgba(20,24,16,.07)] mb-6 overflow-hidden">
          <nav aria-label="Admin sections" className="flex border-b border-slate-200 overflow-x-auto bg-slate-50">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.id)}
                  aria-current={tab.selected ? 'page' : undefined}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium border-b-2 transition whitespace-nowrap text-sm sm:text-base min-w-fit ${
                    tab.selected
                      ? 'border-[#2563eb] text-[#216ac4] bg-white'
                      : 'border-transparent text-dark-600 hover:text-dark-900 hover:bg-white/70'
                  }`}
                >
                  <Icon size={18} className="sm:w-5 sm:h-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
          {inRecords && <nav aria-label="Business records" className="flex flex-wrap gap-1 border-b border-slate-100 bg-white px-4 py-3 sm:px-7">{recordTabs.map(tab => <button key={tab.id} onClick={() => navigate(tab.id)} aria-current={activeTab === tab.id ? 'page' : undefined} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><tab.icon size={14} />{tab.label}</button>)}</nav>}
          {activeTab === 'brands' && <p className="border-b border-slate-100 px-7 py-3 text-xs text-slate-500">Website / Featured brands <span className="mx-2">·</span> Manage portfolio albums in Records → Albums.</p>}

          <div className="p-4 sm:p-7">
            {(activeTab === 'today' || activeTab === 'jobs') && <JobsTab key={activeTab} initialView={activeTab === 'today' ? 'today' : 'pipeline'} onRecords={setActiveTab} onDirtyChange={setJobDirty} />}
            {activeTab === 'brands' && <BrandsTab />}
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
