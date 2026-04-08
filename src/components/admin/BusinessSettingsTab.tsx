'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'

export default function BusinessSettingsTab() {
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    abn: '',
    acn: '',
    address: '',
    suburb: '',
    state: '',
    postcode: '',
    country: 'Australia',
    email: '',
    phone: '',
    website: '',
    taxRate: '10.0',
    paymentTerms: 'Net 30',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchBusinessInfo()
  }, [])

  const fetchBusinessInfo = async () => {
    try {
      const response = await fetch('/api/business-info')
      const data = await response.json()
      if (data.businessInfo) {
        setBusinessInfo({
          businessName: data.businessInfo.businessName || '',
          abn: data.businessInfo.abn || '',
          acn: data.businessInfo.acn || '',
          address: data.businessInfo.address || '',
          suburb: data.businessInfo.suburb || '',
          state: data.businessInfo.state || '',
          postcode: data.businessInfo.postcode || '',
          country: data.businessInfo.country || 'Australia',
          email: data.businessInfo.email || '',
          phone: data.businessInfo.phone || '',
          website: data.businessInfo.website || '',
          taxRate: data.businessInfo.taxRate?.toString() || '10.0',
          paymentTerms: data.businessInfo.paymentTerms || 'Net 30',
        })
      }
    } catch (error) {
      toast.error('Failed to fetch business information')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/business-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businessInfo),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Business information updated successfully')
      } else {
        toast.error(data.error || 'Failed to update business information')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-dark-500">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-900">Business Settings</h2>
          <p className="text-sm text-dark-600 mt-1">
            This information will appear on invoices and bills of sale
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-lg border p-6 space-y-6">
        {/* Business Details */}
        <div>
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Business Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={businessInfo.businessName}
                onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900 placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                ABN (Australian Business Number)
              </label>
              <input
                type="text"
                value={businessInfo.abn}
                onChange={(e) => setBusinessInfo({ ...businessInfo, abn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900 placeholder-gray-400"
                placeholder="12 345 678 901"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                ACN (Australian Company Number)
              </label>
              <input
                type="text"
                value={businessInfo.acn}
                onChange={(e) => setBusinessInfo({ ...businessInfo, acn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900 placeholder-gray-400"
                placeholder="123 456 789"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={businessInfo.address}
                onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900 placeholder-gray-400"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Suburb
              </label>
              <input
                type="text"
                value={businessInfo.suburb}
                onChange={(e) => setBusinessInfo({ ...businessInfo, suburb: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                State
              </label>
              <select
                value={businessInfo.state}
                onChange={(e) => setBusinessInfo({ ...businessInfo, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900"
              >
                <option value="">Select State</option>
                <option value="NSW">New South Wales</option>
                <option value="VIC">Victoria</option>
                <option value="QLD">Queensland</option>
                <option value="WA">Western Australia</option>
                <option value="SA">South Australia</option>
                <option value="TAS">Tasmania</option>
                <option value="ACT">Australian Capital Territory</option>
                <option value="NT">Northern Territory</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Postcode
              </label>
              <input
                type="text"
                value={businessInfo.postcode}
                onChange={(e) => setBusinessInfo({ ...businessInfo, postcode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900 placeholder-gray-400"
                placeholder="2000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Country
              </label>
              <input
                type="text"
                value={businessInfo.country}
                onChange={(e) => setBusinessInfo({ ...businessInfo, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Email
              </label>
              <input
                type="email"
                value={businessInfo.email}
                onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900 placeholder-gray-400"
                placeholder="info@whiteholesolutions.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={businessInfo.phone}
                onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900 placeholder-gray-400"
                placeholder="+61 2 1234 5678"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Website
              </label>
              <input
                type="url"
                value={businessInfo.website}
                onChange={(e) => setBusinessInfo({ ...businessInfo, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900 placeholder-gray-400"
                placeholder="https://whiteholesolutions.com"
              />
            </div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div>
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Invoice Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={businessInfo.taxRate}
                onChange={(e) => setBusinessInfo({ ...businessInfo, taxRate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900 placeholder-gray-400"
                placeholder="10.0"
              />
              <p className="text-xs text-dark-500 mt-1">GST rate (usually 10% in Australia)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-900 mb-2">
                Payment Terms
              </label>
              <input
                type="text"
                value={businessInfo.paymentTerms}
                onChange={(e) => setBusinessInfo({ ...businessInfo, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-900 placeholder-gray-400"
                placeholder="Net 30"
              />
              <p className="text-xs text-dark-500 mt-1">e.g., "Net 30", "Due on receipt", etc.</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
