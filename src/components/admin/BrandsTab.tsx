'use client'

import Image from 'next/image'
import { ExternalLink, Plus, Trash2, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface Brand {
  id: string
  name: string
  logoUrl: string
  websiteUrl?: string | null
}

export default function BrandsTab() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [name, setName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setBrands(data.brands || [])
    } catch (error: any) {
      toast.error(error.message || 'Unable to load brands')
    }
  }

  useEffect(() => { loadBrands() }, [])

  const uploadLogo = async (file?: File) => {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setLogoUrl(data.url)
      toast.success('Logo uploaded')
    } catch (error: any) {
      toast.error(error.message || 'Unable to upload logo')
    } finally {
      setUploading(false)
    }
  }

  const addBrand = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!logoUrl) return toast.error('Upload a logo first')
    setSaving(true)
    try {
      const normalisedUrl = websiteUrl && !/^https?:\/\//i.test(websiteUrl) ? `https://${websiteUrl}` : websiteUrl
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, logoUrl, websiteUrl: normalisedUrl }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setBrands(current => [...current, data.brand])
      setName('')
      setWebsiteUrl('')
      setLogoUrl('')
      toast.success('Brand added to your home page')
    } catch (error: any) {
      toast.error(error.message || 'Unable to add brand')
    } finally {
      setSaving(false)
    }
  }

  const deleteBrand = async (brand: Brand) => {
    if (!confirm(`Remove ${brand.name} from the home page?`)) return
    try {
      const response = await fetch(`/api/brands/${brand.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setBrands(current => current.filter(item => item.id !== brand.id))
      toast.success('Brand removed')
    } catch (error: any) {
      toast.error(error.message || 'Unable to remove brand')
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <p className="editorial-kicker text-[#216ac4]">Social proof</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-[-.04em] text-[#111211]">Brands we&apos;ve worked with</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-dark-600">Add a client or partner logo. It will appear in the Selected clients section on your home page, with an optional link to their website.</p>
      </div>

      <form onSubmit={addBrand} className="portal-card bg-[#f8f6f1] p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-dark-900">Brand name<input required value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Example Co" className="mt-1.5 w-full rounded-lg border border-dark-300 bg-white px-3 py-2.5 text-dark-900 focus:border-[#65a7ff] focus:outline-none focus:ring-2 focus:ring-[#65a7ff]/30" /></label>
          <label className="text-sm font-medium text-dark-900">Website link <span className="font-normal text-dark-500">(optional)</span><input value={websiteUrl} onChange={event => setWebsiteUrl(event.target.value)} placeholder="example.com" className="mt-1.5 w-full rounded-lg border border-dark-300 bg-white px-3 py-2.5 text-dark-900 focus:border-[#65a7ff] focus:outline-none focus:ring-2 focus:ring-[#65a7ff]/30" /></label>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-dark-900">Logo</p>
            <div className="mt-1.5 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#216ac4]/50 bg-white px-4 py-2.5 text-sm font-semibold text-[#216ac4] transition hover:border-[#216ac4] hover:bg-[#dbeafe]">
                <Upload size={17} /> {uploading ? 'Uploading…' : 'Upload logo'}
                <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="sr-only" disabled={uploading} onChange={event => uploadLogo(event.target.files?.[0])} />
              </label>
              {logoUrl && <div className="flex items-center gap-3"><div className="relative h-10 w-20 rounded bg-white p-1 ring-1 ring-black/10"><Image src={logoUrl} alt="Logo preview" fill className="object-contain p-1" /></div><span className="text-xs text-dark-500">Ready to add</span></div>}
            </div>
          </div>
        </div>
        <button disabled={saving || uploading} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3b82f6] disabled:cursor-not-allowed disabled:opacity-50"><Plus size={17} /> {saving ? 'Adding…' : 'Add brand'}</button>
      </form>

      {brands.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map(brand => (
            <article key={brand.id} className="portal-card bg-white p-4">
              <div className="flex items-start justify-between gap-4"><div className="relative h-16 w-28"><Image src={brand.logoUrl} alt={`${brand.name} logo`} fill className="object-contain object-left" /></div><button onClick={() => deleteBrand(brand)} className="rounded p-2 text-red-600 hover:bg-red-50" title="Remove brand"><Trash2 size={17} /></button></div>
              <h3 className="mt-4 font-semibold text-dark-900">{brand.name}</h3>
              {brand.websiteUrl ? <a href={brand.websiteUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm text-[#216ac4] hover:underline"><ExternalLink size={14} /> Visit website</a> : <p className="mt-1 text-sm text-dark-500">No website link</p>}
            </article>
          ))}
        </div>
      ) : <div className="rounded-xl border border-dashed border-dark-300 px-6 py-12 text-center text-sm text-dark-500">Your client logos will appear here after you add them.</div>}
    </div>
  )
}
