'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Notifications() {
  const [rows, setRows] = useState<any[]>([])
  const [msg, setMsg] = useState('Loading notifications…')

  useEffect(() => {
    let active = true
    ;(async () => {
      if (!supabase) { setMsg('Supabase is not configured.'); return }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setMsg('Sign in to see your notifications.'); return }
      const { data, error } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (!active) return
      if (error) { setMsg(error.message); return }
      setRows(data ?? [])
      setMsg('')
    })()
    return () => { active = false }
  }, [])

  return (
    <main className="shell">
      <nav className="nav"><a href="/">← GreyVerse</a><strong>🔔 Notifications</strong></nav>
      <section className="hero">
        <p className="muted">🔔 UPDATES</p>
        <h1>Notifications</h1>
        <p className="muted">Competition updates, match alerts and account activity.</p>
      </section>
      {msg && <div className="card"><p className="muted">{msg}</p>{msg.startsWith('Sign in') && <a className="button" href="/login">Sign in</a>}</div>}
      <div className="grid">
        {rows.map((n: any) => (
          <article className="card" key={n.id}>
            <div className="badge">🔔 {n.notification_type ?? 'Update'}</div>
            <h2>{n.title ?? 'GreyVerse update'}</h2>
            <p className="muted">{n.message ?? n.body ?? ''}</p>
            <small className="muted">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</small>
          </article>
        ))}
        {!msg && !rows.length && <article className="card"><h2>You're all caught up</h2><p className="muted">New competition and account updates will appear here.</p></article>}
      </div>
    </main>
  )
}
