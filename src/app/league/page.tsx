'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function League() {
  const [leagues, setLeagues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    ;(async () => {
      if (!supabase) { setError('Supabase is not configured.'); setLoading(false); return }
      const { data, error } = await supabase.from('leagues').select('*').order('created_at', { ascending: false })
      if (!active) return
      if (error) setError(error.message)
      else setLeagues(data ?? [])
      setLoading(false)
    })()
    return () => { active = false }
  }, [])

  return <main className="shell"><nav className="nav"><a href="/">← GreyVerse</a><strong>🏆 League</strong></nav><section className="hero"><p className="muted">🏆 COMPETITIVE LEAGUES</p><h1>League Center</h1><p className="muted">Live leagues loaded directly from GreyVerse.</p></section>{loading && <article className="card"><h2>Loading leagues…</h2></article>}{error && <article className="card"><h2>League unavailable</h2><p className="muted">{error}</p></article>}{!loading && !error && <div className="grid">{leagues.map((league: any) => <article className="card" key={league.id}><div className="badge">🏆 League</div><h2>{league.league_name ?? league.display_name ?? 'GreyVerse League'}</h2><p className="muted">{league.current_players ?? 0}/{league.max_players ?? 30} players</p><p className="muted">Promotion: top {league.promotion_slots ?? 5}</p><a className="button" href={'/league/' + league.id + '/'}>View league →</a></article>)}{!leagues.length && <article className="card"><h2>No leagues found</h2><p className="muted">No leagues were returned by the database.</p></article>}</div>}</main>
}
