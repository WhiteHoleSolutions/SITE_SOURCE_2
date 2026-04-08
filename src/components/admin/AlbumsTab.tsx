'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Plus, Trash2, Upload, Users as UsersIcon, Play, Eye, Download, X, Edit, Search } from 'lucide-react'

export default function AlbumsTab() {
  const [albums, setAlbums] = useState<any[]>([])
  const [filteredAlbums, setFilteredAlbums] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [customers, setCustomers] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null)
  const [newAlbum, setNewAlbum] = useState({
    title: '',
    description: '',
    type: 'PUBLIC' as 'PUBLIC' | 'PRIVATE',
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchAlbums()
    fetchCustomers()
  }, [])

  useEffect(() => {
    // Filter albums based on search query
    if (searchQuery.trim() === '') {
      setFilteredAlbums(albums)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = albums.filter(album => 
        album.title.toLowerCase().includes(query) ||
        album.description?.toLowerCase().includes(query) ||
        album.type.toLowerCase().includes(query)
      )
      setFilteredAlbums(filtered)
    }
  }, [albums, searchQuery])

  const fetchAlbums = async () => {
    try {
      const response = await fetch('/api/albums')
      const data = await response.json()
      setAlbums(data.albums || [])
    } catch (error) {
      toast.error('Failed to fetch albums')
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      const data = await response.json()
      setCustomers(data.customers || [])
    } catch (error) {
      console.error('Failed to fetch customers')
    }
  }

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlbum),
      })

      if (response.ok) {
        toast.success('Album created successfully')
        setShowModal(false)
        setNewAlbum({ title: '', description: '', type: 'PUBLIC' })
        fetchAlbums()
      } else {
        toast.error('Failed to create album')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm('Are you sure you want to delete this album?')) return

    try {
      const response = await fetch(`/api/albums/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Album deleted successfully')
        fetchAlbums()
      } else {
        toast.error('Failed to delete album')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, albumId: string) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const uploadData = await uploadResponse.json()

        if (uploadResponse.ok) {
          const type = file.type.startsWith('video') ? 'VIDEO' : 'IMAGE'
          
          await fetch(`/api/albums/${albumId}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: uploadData.url,
              type,
              title: file.name,
            }),
          })
        }
      }

      toast.success('Media uploaded successfully')
      fetchAlbums()
    } catch (error) {
      toast.error('Failed to upload media')
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateAccess = async (albumId: string, accessList: { customerId: string; permission: string }[]) => {
    try {
      const response = await fetch(`/api/albums/${albumId}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessList }),
      })

      if (response.ok) {
        toast.success('Access updated successfully')
        fetchAlbums()
      } else {
        toast.error('Failed to update access')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return

    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Media deleted successfully')
        fetchAlbums()
      } else {
        toast.error('Failed to delete media')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-dark-900">Albums</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 sm:gap-2 bg-primary-500 hover:bg-primary-600 active:scale-95 text-white px-3 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Create Album</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400" size={20} />
          <input
            type="text"
            placeholder="Search albums by name, description, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredAlbums.length === 0 && searchQuery.trim() !== '' && (
        <div className="text-center py-12">
          <p className="text-dark-600">No albums found matching "{searchQuery}"</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {filteredAlbums.map((album) => (
          <div key={album.id} className="bg-white border rounded-lg overflow-hidden">
            <div className="relative h-40 sm:h-48">
              {album.media[0] ? (
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
                      <Play size={32} className="text-white" />
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600" />
              )}
            </div>
            <div className="p-3 sm:p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm sm:text-base text-dark-900 flex-1 pr-2">{album.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                  album.type === 'PUBLIC' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {album.type}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-dark-600 mb-3 sm:mb-4">{album.media.length} items</p>
              
              <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setSelectedAlbum(album)
                    setShowEditModal(true)
                  }}
                  className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-primary-500 hover:bg-primary-600 active:scale-95 text-white px-2 sm:px-3 py-2 rounded text-xs sm:text-sm transition"
                >
                  <Edit size={14} className="sm:w-4 sm:h-4" />
                  <span>Manage</span>
                </button>
                
                <button
                  onClick={() => handleDeleteAlbum(album.id)}
                  className="bg-red-100 hover:bg-red-200 active:scale-95 text-red-900 p-2 rounded transition"
                  title="Delete Album"
                >
                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Album Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Create New Album</h3>
            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-dark-900">Title</label>
                <input
                  type="text"
                  value={newAlbum.title}
                  onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-dark-900">Description</label>
                <textarea
                  value={newAlbum.description}
                  onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-dark-900">Type</label>
                <select
                  value={newAlbum.type}
                  onChange={(e) => setNewAlbum({ ...newAlbum, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg"
                >
                  Create
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

      {/* Comprehensive Album Edit Modal */}
      {showEditModal && selectedAlbum && (
        <AlbumEditModal
          album={selectedAlbum}
          customers={customers}
          onClose={() => {
            setShowEditModal(false)
            setSelectedAlbum(null)
          }}
          onUpdate={fetchAlbums}
          uploading={uploading}
          setUploading={setUploading}
        />
      )}
    </div>
  )
}

function AlbumEditModal({ album, customers, onClose, onUpdate, uploading, setUploading }: any) {
  const [activeTab, setActiveTab] = useState<'details' | 'media' | 'permissions'>('details')
  const [editData, setEditData] = useState({
    title: album.title,
    description: album.description || '',
    type: album.type
  })
  const [media, setMedia] = useState(album.media || [])
  const [accessList, setAccessList] = useState<{ customerId: string; permission: string }[]>([])
  const [customerSearch, setCustomerSearch] = useState('')

  useEffect(() => {
    const initialAccess = album.access?.map((a: any) => ({
      customerId: a.customerId,
      permission: a.permission || 'VIEW'
    })) || []
    setAccessList(initialAccess)
  }, [album])

  // Filter customers based on search
  const filteredCustomers = customers.filter((customer: any) =>
    customer.user.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.user.email.toLowerCase().includes(customerSearch.toLowerCase())
  )

  const handleUpdateDetails = async () => {
    try {
      const response = await fetch(`/api/albums/${album.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        toast.success('Album details updated')
        onUpdate()
      } else {
        toast.error('Failed to update album')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const uploadData = await uploadResponse.json()

        if (uploadResponse.ok) {
          const type = file.type.startsWith('video') ? 'VIDEO' : 'IMAGE'
          
          const mediaResponse = await fetch(`/api/albums/${album.id}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: uploadData.url,
              type,
              title: file.name,
            }),
          })

          if (mediaResponse.ok) {
            const newMedia = await mediaResponse.json()
            setMedia((prev: any) => [...prev, newMedia.media])
          }
        }
      }

      toast.success('Media uploaded successfully')
      onUpdate()
    } catch (error) {
      toast.error('Failed to upload media')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return

    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Media deleted')
        setMedia((prev: any) => prev.filter((m: any) => m.id !== mediaId))
        onUpdate()
      } else {
        toast.error('Failed to delete media')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const toggleCustomer = (customerId: string) => {
    const exists = accessList.find(a => a.customerId === customerId)
    if (exists) {
      setAccessList(prev => prev.filter(a => a.customerId !== customerId))
    } else {
      setAccessList(prev => [...prev, { customerId, permission: 'VIEW' }])
    }
  }

  const updatePermission = (customerId: string, permission: string) => {
    setAccessList(prev => 
      prev.map(a => a.customerId === customerId ? { ...a, permission } : a)
    )
  }

  const handleSavePermissions = async () => {
    try {
      const response = await fetch(`/api/albums/${album.id}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessList }),
      })

      if (response.ok) {
        toast.success('Permissions updated')
        onUpdate()
      } else {
        toast.error('Failed to update permissions')
      }
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-dark-900">Manage Album: {album.title}</h3>
          <button
            onClick={onClose}
            className="text-dark-600 hover:text-dark-900 p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'details'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-dark-600 hover:text-dark-900'
            }`}
          >
            Album Details
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'media'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-dark-600 hover:text-dark-900'
            }`}
          >
            Media ({media.length})
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'permissions'
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-dark-600 hover:text-dark-900'
            }`}
          >
            Permissions ({accessList.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium mb-2 text-dark-900">Title</label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-dark-900">Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-dark-900">Type</label>
                <select
                  value={editData.type}
                  onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-dark-900"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                </select>
                <p className="text-xs text-dark-600 mt-1">
                  {editData.type === 'PUBLIC' 
                    ? 'Public albums are visible to everyone' 
                    : 'Private albums are only visible to customers with permissions'}
                </p>
              </div>

              <button
                onClick={handleUpdateDetails}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg"
              >
                Save Details
              </button>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div>
              <div className="mb-4">
                <label className="inline-block cursor-pointer bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading ? 'Uploading...' : '+ Add Media'}
                </label>
              </div>

              {media.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-dark-600">No media in this album yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {media.map((item: any) => (
                    <div key={item.id} className="relative group">
                      <div className="aspect-square relative bg-dark-100 rounded-lg overflow-hidden">
                        {item.type === 'IMAGE' ? (
                          <Image
                            src={item.url}
                            alt={item.title || 'Media'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <video
                              src={item.url}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Play size={32} className="text-white" />
                            </div>
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => handleDeleteMedia(item.id)}
                            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition active:scale-95"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                      
                      {item.title && (
                        <p className="text-xs text-dark-700 mt-1 truncate">
                          {item.title}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div>
              <div className="mb-4">
                <p className="text-sm text-dark-600 mb-3">
                  {editData.type === 'PUBLIC' 
                    ? 'This is a public album. Permissions are only needed for private albums.' 
                    : 'Select customers who can access this album and set their permission level.'}
                </p>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-dark-900 placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredCustomers.map((customer: any) => {
                  const access = accessList.find(a => a.customerId === customer.id)
                  const isChecked = !!access
                  
                  return (
                    <div
                      key={customer.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCustomer(customer.id)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-dark-900">{customer.user.name}</div>
                        <div className="text-sm text-dark-600">{customer.user.email}</div>
                      </div>
                      
                      {isChecked && (
                        <select
                          value={access.permission}
                          onChange={(e) => updatePermission(customer.id, e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-dark-900 text-sm"
                        >
                          <option value="VIEW">View Only</option>
                          <option value="DOWNLOAD">View & Download</option>
                        </select>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-4">
                <button
                  onClick={handleSavePermissions}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg"
                >
                  Save Permissions
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t">
          <button
            onClick={onClose}
            className="bg-dark-200 hover:bg-dark-300 text-dark-900 px-6 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
