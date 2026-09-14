'use client'

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

type ConnectionStatus = { connected: boolean; configured: boolean; message: string }

export default function RevolutStatus() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/revolut/status', { cache: 'no-store' })
      if (!response.ok) throw new Error()
      setStatus(await response.json())
    } catch {
      setStatus({ connected: false, configured: false, message: 'Connection status unavailable' })
    } finally { setRefreshing(false) }
  }

  useEffect(() => { load() }, [])

  const connected = status?.connected
  return <div className={`flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-medium ${connected ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-white/20 bg-white/10 text-white/75'}`} title={status?.message || 'Checking Revolut Merchant'}>
    <span className={`h-2 w-2 rounded-full ${connected ? 'bg-blue-500' : 'bg-white/50'}`} />
    <span className="hidden lg:inline">Revolut: {connected ? 'Connected' : 'Not connected'}</span>
    <button onClick={load} disabled={refreshing} className="rounded p-0.5 hover:bg-white/10 disabled:opacity-50" aria-label="Refresh Revolut connection status"><RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} /></button>
  </div>
}
