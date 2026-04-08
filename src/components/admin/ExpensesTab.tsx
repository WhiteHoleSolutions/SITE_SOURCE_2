'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, Upload, File, ExternalLink } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

const EXPENSE_CATEGORIES = [
  'Equipment',
  'Software & Subscriptions',
  'Travel & Transport',
  'Accommodation',
  'Meals & Entertainment',
  'Office Supplies',
  'Marketing & Advertising',
  'Professional Services',
  'Utilities',
  'Insurance',
  'Repairs & Maintenance',
  'Other',
]

const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'PayPal',
  'Other',
]

export default function ExpensesTab() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const [newExpense, setNewExpense] = useState({
    description: '',
    category: 'Other',
    amount: '',
    includeGst: true,
    vendor: '',
    paymentMethod: 'Credit Card',
    expenseDate: new Date().toISOString().slice(0, 10),
    receiptUrl: '',
    notes: '',
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses')
      const data = await response.json()
      setExpenses(data.expenses || [])
    } catch (error) {
      toast.error('Failed to fetch expenses')
    }
  }

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type (images and PDFs only)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      toast.error('Only images (JPG, PNG, WEBP) and PDFs are allowed')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setUploadingReceipt(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.url) {
        setNewExpense({ ...newExpense, receiptUrl: data.url })
        toast.success('Receipt uploaded successfully')
      } else {
        toast.error(data.error || 'Failed to upload receipt')
      }
    } catch (error) {
      toast.error('An error occurred during upload')
    } finally {
      setUploadingReceipt(false)
    }
  }

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Expense created successfully')
        setShowModal(false)
        setNewExpense({
          description: '',
          category: 'Other',
          amount: '',
          includeGst: true,
          vendor: '',
          paymentMethod: 'Credit Card',
          expenseDate: new Date().toISOString().slice(0, 10),
          receiptUrl: '',
          notes: '',
        })
        fetchExpenses()
      } else {
        toast.error(data.error || 'Failed to create expense')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Expense deleted')
        fetchExpenses()
      } else {
        toast.error('Failed to delete expense')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalGst = expenses.reduce((sum, exp) => sum + (exp.gstAmount || 0), 0)

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-900">Expenses</h2>
          <p className="text-sm text-dark-600 mt-1">
            Track business expenses and receipts for tax purposes
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-dark-600 mb-1">Total Expenses</div>
          <div className="text-2xl font-bold text-dark-900">{formatCurrency(totalExpenses)}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-dark-600 mb-1">Total GST Claimed</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalGst)}</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-dark-600 mb-1">Number of Expenses</div>
          <div className="text-2xl font-bold text-dark-900">{expenses.length}</div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg border overflow-x-auto">
        <table className="min-w-full divide-y divide-dark-200">
          <thead className="bg-dark-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                Expense #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                Vendor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                Receipt
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-dark-200">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-dark-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-dark-900">{expense.expenseNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-dark-600">{formatDate(expense.expenseDate)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-dark-900">{expense.description}</div>
                  {expense.paymentMethod && (
                    <div className="text-xs text-dark-500">{expense.paymentMethod}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-dark-600">{expense.vendor || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-dark-900">
                    {formatCurrency(expense.amount)}
                  </div>
                  {expense.gstAmount && (
                    <div className="text-xs text-green-600">
                      GST: {formatCurrency(expense.gstAmount)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {expense.receiptUrl ? (
                    <a
                      href={expense.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary-500 hover:text-primary-600"
                    >
                      <File size={16} />
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-xs text-dark-400">No receipt</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {expenses.map((expense) => (
          <div key={expense.id} className="bg-white rounded-lg border p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-dark-900">{expense.expenseNumber}</div>
                <div className="text-xs text-dark-700 mt-1">{formatDate(expense.expenseDate)}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {expense.category}
                </span>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div>
              <div className="text-sm text-dark-900">{expense.description}</div>
              {expense.vendor && (
                <div className="text-xs text-dark-600">Vendor: {expense.vendor}</div>
              )}
              {expense.paymentMethod && (
                <div className="text-xs text-dark-600">Payment: {expense.paymentMethod}</div>
              )}
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <div>
                <div className="text-lg font-semibold text-dark-900">
                  {formatCurrency(expense.amount)}
                </div>
                {expense.gstAmount && (
                  <div className="text-xs text-green-600">
                    GST: {formatCurrency(expense.gstAmount)}
                  </div>
                )}
              </div>
              {expense.receiptUrl && (
                <a
                  href={expense.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary-500 hover:text-primary-600 text-sm"
                >
                  <File size={16} />
                  View Receipt
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Add New Expense</h3>
            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-dark-900">Description *</label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                    placeholder="e.g., Adobe Creative Cloud Subscription"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-dark-900">Category *</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                    required
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-dark-900">Amount (AUD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                    required
                  />
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      checked={newExpense.includeGst}
                      onChange={(e) => setNewExpense({ ...newExpense, includeGst: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm">GST Included (10%)</span>
                  </label>
                  {newExpense.includeGst && newExpense.amount && (
                    <p className="text-xs text-green-600 mt-1">
                      GST to claim: {formatCurrency(parseFloat(newExpense.amount) * (10 / 110))}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-dark-900">Vendor</label>
                  <input
                    type="text"
                    value={newExpense.vendor}
                    onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                    placeholder="Who was it paid to?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-dark-900">Payment Method</label>
                  <select
                    value={newExpense.paymentMethod}
                    onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-dark-900">Expense Date *</label>
                  <input
                    type="date"
                    value={newExpense.expenseDate}
                    onChange={(e) => setNewExpense({ ...newExpense, expenseDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-dark-900">Receipt</label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg hover:bg-dark-50 transition">
                        <Upload size={18} />
                        <span className="text-sm">
                          {uploadingReceipt ? 'Uploading...' : newExpense.receiptUrl ? 'Change Receipt' : 'Upload Receipt'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleReceiptUpload}
                        className="hidden"
                        disabled={uploadingReceipt}
                      />
                    </label>
                    {newExpense.receiptUrl && (
                      <a
                        href={newExpense.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary-500 hover:text-primary-600 text-sm"
                      >
                        <File size={16} />
                        View
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-dark-500 mt-1">
                    Images (JPG, PNG, WEBP) or PDF, max 5MB
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-dark-900">Notes</label>
                  <textarea
                    value={newExpense.notes}
                    onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                    rows={2}
                    placeholder="Any additional notes"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg"
                >
                  Add Expense
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-dark-200 hover:bg-dark-300 text-dark-900 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
