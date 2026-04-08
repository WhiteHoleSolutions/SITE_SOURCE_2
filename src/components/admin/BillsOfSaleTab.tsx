'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, FileText } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function BillsOfSaleTab() {
  const [bills, setBills] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [newBill, setNewBill] = useState({
    type: 'BOUGHT',
    sellerName: '',
    sellerAddress: '',
    sellerPhone: '',
    sellerEmail: '',
    buyerName: '',
    buyerAddress: '',
    buyerPhone: '',
    buyerEmail: '',
    equipmentType: '',
    description: '',
    serialNumber: '',
    condition: 'Used',
    salePrice: '',
    gstIncluded: true,
    saleDate: new Date().toISOString().slice(0, 10),
    notes: '',
  })

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    try {
      const response = await fetch('/api/bills-of-sale')
      const data = await response.json()
      setBills(data.bills || [])
    } catch (error) {
      toast.error('Failed to fetch bills of sale')
    }
  }

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/bills-of-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBill),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Bill of sale created successfully')
        setShowModal(false)
        setNewBill({
          type: 'BOUGHT',
          sellerName: '',
          sellerAddress: '',
          sellerPhone: '',
          sellerEmail: '',
          buyerName: '',
          buyerAddress: '',
          buyerPhone: '',
          buyerEmail: '',
          equipmentType: '',
          description: '',
          serialNumber: '',
          condition: 'Used',
          salePrice: '',
          gstIncluded: true,
          saleDate: new Date().toISOString().slice(0, 10),
          notes: '',
        })
        fetchBills()
      } else {
        toast.error(data.error || 'Failed to create bill of sale')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bill of sale?')) return

    try {
      const response = await fetch(`/api/bills-of-sale/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Bill of sale deleted')
        fetchBills()
      } else {
        toast.error('Failed to delete bill of sale')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-900">Bills of Sale</h2>
          <p className="text-sm text-dark-600 mt-1">
            Record equipment purchases and sales for tax purposes
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
          New Bill of Sale
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg border overflow-x-auto">
        <table className="min-w-full divide-y divide-dark-200">
          <thead className="bg-dark-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                Bill #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                Equipment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                Party
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-dark-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-dark-200">
            {bills.map((bill) => (
              <tr key={bill.id} className="hover:bg-dark-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-dark-900">{bill.billNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    bill.type === 'BOUGHT' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {bill.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-dark-900">{bill.equipmentType}</div>
                  <div className="text-xs text-dark-500">{bill.description}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-dark-900">
                    {bill.type === 'BOUGHT' ? bill.sellerName : bill.buyerName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-dark-900">
                    {formatCurrency(bill.salePrice)}
                  </div>
                  {bill.gstIncluded && bill.gstAmount && (
                    <div className="text-xs text-dark-500">
                      GST: {formatCurrency(bill.gstAmount)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-dark-600">{formatDate(bill.saleDate)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(bill.id)}
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
        {bills.map((bill) => (
          <div key={bill.id} className="bg-white rounded-lg border p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-dark-900">{bill.billNumber}</div>
                <div className="text-xs text-dark-700 mt-1">{formatDate(bill.saleDate)}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  bill.type === 'BOUGHT' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {bill.type}
                </span>
                <button
                  onClick={() => handleDelete(bill.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div>
              <div className="text-sm text-dark-900">{bill.equipmentType}</div>
              <div className="text-xs text-dark-600">{bill.description}</div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <div>
                <div className="text-xs text-dark-700">
                  {bill.type === 'BOUGHT' ? 'From' : 'To'}: {bill.type === 'BOUGHT' ? bill.sellerName : bill.buyerName}
                </div>
                {bill.gstIncluded && bill.gstAmount && (
                  <div className="text-xs text-dark-500">GST: {formatCurrency(bill.gstAmount)}</div>
                )}
              </div>
              <div className="text-lg font-semibold text-dark-900">
                {formatCurrency(bill.salePrice)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Bill Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Create Bill of Sale</h3>
            <form onSubmit={handleCreateBill} className="space-y-6">
              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium mb-2 text-dark-900">Transaction Type *</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="BOUGHT"
                      checked={newBill.type === 'BOUGHT'}
                      onChange={(e) => setNewBill({ ...newBill, type: e.target.value })}
                      className="mr-2"
                    />
                    Bought (I purchased equipment)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="SOLD"
                      checked={newBill.type === 'SOLD'}
                      onChange={(e) => setNewBill({ ...newBill, type: e.target.value })}
                      className="mr-2"
                    />
                    Sold (I sold equipment)
                  </label>
                </div>
              </div>

              {/* Seller Information */}
              <div>
                <h4 className="font-semibold mb-3">Seller Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-dark-900">Seller Name *</label>
                    <input
                      type="text"
                      value={newBill.sellerName}
                      onChange={(e) => setNewBill({ ...newBill, sellerName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-dark-900">Seller Address</label>
                    <input
                      type="text"
                      value={newBill.sellerAddress}
                      onChange={(e) => setNewBill({ ...newBill, sellerAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-dark-900">Seller Phone</label>
                    <input
                      type="tel"
                      value={newBill.sellerPhone}
                      onChange={(e) => setNewBill({ ...newBill, sellerPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-dark-900">Seller Email</label>
                    <input
                      type="email"
                      value={newBill.sellerEmail}
                      onChange={(e) => setNewBill({ ...newBill, sellerEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Buyer Information */}
              <div>
                <h4 className="font-semibold mb-3">Buyer Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-dark-900">Buyer Name *</label>
                    <input
                      type="text"
                      value={newBill.buyerName}
                      onChange={(e) => setNewBill({ ...newBill, buyerName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-dark-900">Buyer Address</label>
                    <input
                      type="text"
                      value={newBill.buyerAddress}
                      onChange={(e) => setNewBill({ ...newBill, buyerAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-dark-900">Buyer Phone</label>
                    <input
                      type="tel"
                      value={newBill.buyerPhone}
                      onChange={(e) => setNewBill({ ...newBill, buyerPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-dark-900">Buyer Email</label>
                    <input
                      type="email"
                      value={newBill.buyerEmail}
                      onChange={(e) => setNewBill({ ...newBill, buyerEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Equipment Details */}
              <div>
                <h4 className="font-semibold mb-3">Equipment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-dark-900">Equipment Type *</label>
                    <input
                      type="text"
                      value={newBill.equipmentType}
                      onChange={(e) => setNewBill({ ...newBill, equipmentType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                      placeholder="e.g., Camera, Lens, Drone"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-dark-900">Serial Number</label>
                    <input
                      type="text"
                      value={newBill.serialNumber}
                      onChange={(e) => setNewBill({ ...newBill, serialNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-dark-900">Description *</label>
                    <textarea
                      value={newBill.description}
                      onChange={(e) => setNewBill({ ...newBill, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                      rows={2}
                      placeholder="Detailed description of the equipment"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-dark-900">Condition</label>
                    <select
                      value={newBill.condition}
                      onChange={(e) => setNewBill({ ...newBill, condition: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                    >
                      <option value="New">New</option>
                      <option value="Like New">Like New</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Used">Used</option>
                      <option value="For Parts">For Parts</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div>
                <h4 className="font-semibold mb-3">Financial Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-dark-900">Sale Price (AUD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newBill.salePrice}
                      onChange={(e) => setNewBill({ ...newBill, salePrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-dark-900">Sale Date *</label>
                    <input
                      type="date"
                      value={newBill.saleDate}
                      onChange={(e) => setNewBill({ ...newBill, saleDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newBill.gstIncluded}
                        onChange={(e) => setNewBill({ ...newBill, gstIncluded: e.target.checked })}
                        className="mr-2"
                      />
                      GST Included (10%)
                    </label>
                    {newBill.gstIncluded && newBill.salePrice && (
                      <p className="text-xs text-dark-500 mt-1">
                        GST Amount: {formatCurrency(parseFloat(newBill.salePrice) * (10 / 110))}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2 text-dark-900">Notes</label>
                <textarea
                  value={newBill.notes}
                  onChange={(e) => setNewBill({ ...newBill, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                  rows={3}
                  placeholder="Any additional notes or terms"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg"
                >
                  Create Bill of Sale
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
