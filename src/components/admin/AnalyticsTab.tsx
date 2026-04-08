'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Receipt,
  CreditCard,
  Calendar,
  Download,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AnalyticsTab() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      let url = '/api/analytics'
      const params = new URLSearchParams()
      
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)
      
      if (params.toString()) url += `?${params.toString()}`

      const response = await fetch(url)
      const data = await response.json()
      setAnalytics(data.analytics)
    } catch (error) {
      toast.error('Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleDateFilterChange = () => {
    fetchAnalytics()
  }

  const clearDateFilter = () => {
    setDateRange({ startDate: '', endDate: '' })
    setTimeout(fetchAnalytics, 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-dark-500">Loading analytics...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-dark-500">No analytics data available</div>
      </div>
    )
  }

  const { summary, tax, invoices, expenses, billsOfSale, monthly } = analytics

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-900">Analytics & Tax Dashboard</h2>
          <p className="text-sm text-dark-600 mt-1">
            Track your financial performance and tax position
          </p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-dark-900 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-dark-900 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleDateFilterChange}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition"
            >
              <Calendar size={18} />
              Apply
            </button>
            {(dateRange.startDate || dateRange.endDate) && (
              <button
                onClick={clearDateFilter}
                className="flex-1 sm:flex-none bg-dark-200 hover:bg-dark-300 text-dark-900 px-4 py-2 rounded-lg transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-dark-600">Total Revenue</div>
            <DollarSign className="text-green-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-dark-900">{formatCurrency(summary.totalRevenue)}</div>
          <div className="text-xs text-dark-500 mt-1">From paid invoices & equipment sold</div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-dark-600">Total Expenses</div>
            <CreditCard className="text-red-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-dark-900">{formatCurrency(summary.totalExpenses)}</div>
          <div className="text-xs text-dark-500 mt-1">Operating expenses</div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-dark-600">Profit/Loss</div>
            {summary.profitLoss >= 0 ? (
              <TrendingUp className="text-green-500" size={20} />
            ) : (
              <TrendingDown className="text-red-500" size={20} />
            )}
          </div>
          <div
            className={`text-2xl font-bold ${summary.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {formatCurrency(summary.profitLoss)}
          </div>
          <div className="text-xs text-dark-500 mt-1">
            Margin: {summary.profitMargin.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-dark-600">GST Position</div>
            <Receipt className={tax.gstPosition >= 0 ? 'text-orange-500' : 'text-green-500'} size={20} />
          </div>
          <div
            className={`text-2xl font-bold ${tax.gstPosition >= 0 ? 'text-orange-600' : 'text-green-600'}`}
          >
            {formatCurrency(Math.abs(tax.gstPosition))}
          </div>
          <div className="text-xs text-dark-500 mt-1">
            {tax.gstPosition >= 0 ? 'Owed to ATO' : 'Refund from ATO'}
          </div>
        </div>
      </div>

      {/* GST Breakdown */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-dark-900 mb-4">GST Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-dark-600 mb-1">GST Collected</div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(tax.gstCollected)}</div>
            <div className="text-xs text-dark-500 mt-1">From invoices & equipment sales</div>
          </div>
          <div>
            <div className="text-sm text-dark-600 mb-1">GST Paid</div>
            <div className="text-xl font-bold text-blue-600">{formatCurrency(tax.gstPaid)}</div>
            <div className="text-xs text-dark-500 mt-1">On expenses & equipment purchases</div>
          </div>
          <div className="border-l pl-6">
            <div className="text-sm text-dark-600 mb-1">Net GST Position</div>
            <div className={`text-xl font-bold ${tax.gstPosition >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {formatCurrency(Math.abs(tax.gstPosition))}
            </div>
            <div className="text-xs text-dark-500 mt-1">
              {tax.gstPosition >= 0 ? 'To pay' : 'To claim'}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue & Expenses Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoices */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-primary-500" size={20} />
            <h3 className="text-lg font-semibold text-dark-900">Invoices</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-600">Total Invoiced</span>
              <span className="font-semibold text-dark-900">{formatCurrency(invoices.totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-600">Paid</span>
              <span className="font-semibold text-green-600">{formatCurrency(invoices.paidRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-600">Unpaid</span>
              <span className="font-semibold text-orange-600">{formatCurrency(invoices.unpaidRevenue)}</span>
            </div>
            <div className="pt-3 border-t">
              {Object.entries(invoices.byStatus).map(([status, data]: [string, any]) => (
                <div key={status} className="flex justify-between items-center text-sm py-1">
                  <span className="text-dark-500">{status}</span>
                  <span className="text-dark-700">{data.count} ({formatCurrency(data.total)})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="text-red-500" size={20} />
            <h3 className="text-lg font-semibold text-dark-900">Expenses</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-600">Total Expenses</span>
              <span className="font-semibold text-dark-900">{formatCurrency(expenses.totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-600">Count</span>
              <span className="font-semibold text-dark-900">{expenses.total}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="text-sm font-medium text-dark-700 mb-2">By Category</div>
              {Object.entries(expenses.byCategory)
                .sort((a: any, b: any) => b[1].total - a[1].total)
                .slice(0, 5)
                .map(([category, data]: [string, any]) => (
                  <div key={category} className="flex justify-between items-center text-sm py-1">
                    <span className="text-dark-500">{category}</span>
                    <span className="text-dark-700">{formatCurrency(data.total)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bills of Sale */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="text-blue-500" size={20} />
          <h3 className="text-lg font-semibold text-dark-900">Equipment Transactions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-dark-600 mb-1">Equipment Bought</div>
            <div className="text-xl font-bold text-red-600">{formatCurrency(billsOfSale.equipmentBought)}</div>
            <div className="text-xs text-dark-500 mt-1">{billsOfSale.bought} transactions</div>
          </div>
          <div>
            <div className="text-sm text-dark-600 mb-1">Equipment Sold</div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(billsOfSale.equipmentSold)}</div>
            <div className="text-xs text-dark-500 mt-1">{billsOfSale.sold} transactions</div>
          </div>
          <div>
            <div className="text-sm text-dark-600 mb-1">Net Position</div>
            <div
              className={`text-xl font-bold ${billsOfSale.netEquipment >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {formatCurrency(Math.abs(billsOfSale.netEquipment))}
            </div>
            <div className="text-xs text-dark-500 mt-1">
              {billsOfSale.netEquipment >= 0 ? 'Net Gain' : 'Net Loss'}
            </div>
          </div>
          <div>
            <div className="text-sm text-dark-600 mb-1">Total Transactions</div>
            <div className="text-xl font-bold text-dark-900">{billsOfSale.total}</div>
            <div className="text-xs text-dark-500 mt-1">Bills of sale</div>
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-dark-900 mb-4">Monthly Trend (Last 12 Months)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-sm font-medium text-dark-600">Month</th>
                <th className="text-right py-2 text-sm font-medium text-dark-600">Revenue</th>
                <th className="text-right py-2 text-sm font-medium text-dark-600">Expenses</th>
                <th className="text-right py-2 text-sm font-medium text-dark-600">Profit</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((month: any, idx: number) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-2 text-sm text-dark-700">{month.month}</td>
                  <td className="py-2 text-sm text-right text-green-600">{formatCurrency(month.revenue)}</td>
                  <td className="py-2 text-sm text-right text-red-600">{formatCurrency(month.expenses)}</td>
                  <td
                    className={`py-2 text-sm text-right font-semibold ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {formatCurrency(Math.abs(month.profit))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Summary */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-orange-900 mb-3">Tax Summary</h3>
        <div className="space-y-2 text-sm">
          <p className="text-orange-800">
            <strong>GST Position:</strong> You {tax.gstPosition >= 0 ? 'owe' : 'are owed'}{' '}
            <strong>{formatCurrency(Math.abs(tax.gstPosition))}</strong> in GST
            {tax.gstPosition >= 0 ? ' to the ATO' : ' refund from the ATO'}.
          </p>
          <p className="text-orange-800">
            <strong>Profit for Tax:</strong> Your taxable income is approximately{' '}
            <strong>{formatCurrency(summary.profitLoss)}</strong>.
          </p>
          <p className="text-xs text-orange-600 mt-3">
            * This is an estimate only. Please consult with a qualified tax accountant for accurate tax
            calculations and lodgement.
          </p>
        </div>
      </div>
    </div>
  )
}
