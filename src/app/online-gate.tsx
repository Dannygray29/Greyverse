'use client'

import { useCallback, useEffect, useState } from 'react'
import { SUPABASE_URL } from '@/lib/supabase'

type Status = 'checking' | 'online' | 'offline'

async function checkBackend(): Promise<boolean> {
  if (!navigator.onLine) return false

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    })
    return response.ok
  } catch {
    return false
  }
}

export default function OnlineGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('checking')

  const verify = useCallback(async () => {
    setStatus('checking')
    setStatus((await checkBackend()) ? 'online' : 'offline')
  }, [])

  useEffect(() => {
    let mounted = true

    const run = async () => {
      const online = await checkBackend()
      if (mounted) setStatus(online ? 'online' : 'offline')
    }

    const handleOnline = () => void verify()
    const handleOffline = () => setStatus('offline')

    void run()
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      mounted = false
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [verify])

  if (status === 'online') return <>{children}</>

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#07070a', color: '#fff' }}>
      <section style={{ width: '100%', maxWidth: 420, textAlign: 'center', padding: 28, border: '1px solid #27272a', borderRadius: 20, background: '#111116' }}>
        <div style={{ fontSize: 42, marginBottom: 12 }}>◉</div>
        <h1 style={{ margin: 0, fontSize: 24 }}>GreyVerse requires internet</h1>
        <p style={{ margin: '12px 0 22px', color: '#a1a1aa', lineHeight: 1.5 }}>
          GreyVerse is an online-only gaming platform. Connect to the internet to use the app and reach the live GreyVerse servers.
        </p>
        <button onClick={() => void verify()} style={{ border: 0, borderRadius: 12, padding: '12px 18px', background: '#fff', color: '#09090b', fontWeight: 700, cursor: 'pointer' }}>
          {status === 'checking' ? 'Checking connection…' : 'Try again'}
        </button>
      </section>
    </main>
  )
}
