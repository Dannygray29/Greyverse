'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Game = 'DLS' | 'eFootball'

type Player = {
  id?: string
  game_type?: Game
  username?: string
  greyverse_id?: string
  xp?: number
  level?: number
  rating?: number
}

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [activeGame, setActiveGame] = useState<Game>('eFootball')
  const [message, setMessage] = useState('Loading profile…')

  useEffect(() => {
    const stored = window.localStorage.getItem('greyverse-active-game')
    if (stored === 'DLS' || stored === 'eFootball') setActiveGame(stored)

    let active = true
    ;(async () => {
      if (!supabase) {
        setMessage('Supabase is not configured.')
        return
      }
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) {
        setMessage('Sign in to load your player profile.')
        return
      }
      if (!active) return
      setUser(authData.user)
      const [{ data: profileData, error: profileError }, { data: playerData, error: playerError }] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', authData.user.id).maybeSingle(),
        supabase.from('players').select('*').eq('user_id', authData.user.id).order('created_at', { ascending: true }),
      ])
      if (!active) return
      if (profileError || playerError) {
        setMessage(profileError?.message ?? playerError?.message ?? 'Unable to load player data.')
        return
      }
      setProfile(profileData)
      setPlayers(playerData ?? [])
      setMessage('')
    })()
    return () => { active = false }
  }, [])

  function switchGame(game: Game) {
    setActiveGame(game)
    window.localStorage.setItem('greyverse-active-game', game)
  }

  const activePlayer = useMemo(() => players.find(player => player.game_type === activeGame) ?? null, [players, activeGame])
  const displayName = profile?.username ?? activePlayer?.username ?? 'GreyVerse Player'
  const greyverseId = activePlayer?.greyverse_id ?? profile?.greyverse_id ?? activePlayer?.id ?? 'Pending player record'

  if (!user) {
    return <main className="shell"><nav className="nav"><a href="/">← GreyVerse</a></nav><section className="hero"><h1>Profile</h1><div className="card"><p className="muted">{message}</p><a className="button" href="/login">Sign in</a></div></section></main>
  }

  return (
    <main className="shell">
      <nav className="nav"><a href="/">← GreyVerse</a><strong>👤 Profile</strong></nav>
      <section className="hero">
        <p className="muted">PLAYER IDENTITY</p>
        <div className="profile-head"><div><h1>{displayName}</h1><p className="muted">{profile?.country ?? 'Country pending'} • {user.email}</p></div><div className="status-pill">● ONLINE</div></div>
        <div className="game-switcher" aria-label="Active game profile">
          <span className="muted">ACTIVE GAME</span>
          {(['DLS', 'eFootball'] as Game[]).map(game => <button type="button" key={game} className={`button ${activeGame === game ? '' : 'ghost'}`} onClick={() => switchGame(game)}>{game}</button>)}
        </div>
        <p className="muted">Switching is instant and does not log you out. Each game has separate player records, fixtures, rankings, tournaments, results, and rewards.</p>
      </section>
      <div className="grid">
        <article className="card"><div className="badge">🎮 {activeGame}</div><h2>{activeGame} profile</h2><p className="muted">GreyVerse ID: {greyverseId}</p><p className="muted">Only {activeGame} competitions are shown in this context.</p>{!activePlayer && <p className="muted">No {activeGame} profile is linked to this account yet.</p>}</article>
        <article className="card"><h2>Progress</h2><p className="muted">XP: {activePlayer?.xp ?? 0}</p><p className="muted">Level: {activePlayer?.level ?? 1}</p><p className="muted">Rating: {activePlayer?.rating ?? 0}</p></article>
      </div>
    </main>
  )
}
