'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Game = 'DLS' | 'eFootball'

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [player, setPlayer] = useState<any>(null)
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
        supabase.from('players').select('*').eq('user_id', authData.user.id).maybeSingle(),
      ])
      if (!active) return
      if (profileError || playerError) {
        setMessage(profileError?.message ?? playerError?.message ?? 'Unable to load player data.')
        return
      }
      setProfile(profileData)
      setPlayer(playerData)
      if (profileData?.game_name === 'DLS' || profileData?.game_name === 'eFootball') {
        setActiveGame(profileData.game_name)
      }
      setMessage('')
    })()
    return () => { active = false }
  }, [])

  function switchGame(game: Game) {
    setActiveGame(game)
    window.localStorage.setItem('greyverse-active-game', game)
  }

  if (!user) {
    return <main className="shell"><nav className="nav"><a href="/">← GreyVerse</a></nav><section className="hero"><h1>Profile</h1><div className="card"><p className="muted">{message}</p><a className="button" href="/login">Sign in</a></div></section></main>
  }

  const displayName = profile?.username ?? player?.username ?? 'GreyVerse Player'
  const greyverseId = profile?.greyverse_id ?? player?.greyverse_id ?? player?.id ?? 'Pending player record'

  return (
    <main className="shell">
      <nav className="nav"><a href="/">← GreyVerse</a><strong>👤 Profile</strong></nav>
      <section className="hero">
        <p className="muted">PLAYER IDENTITY</p>
        <div className="profile-head"><div><h1>{displayName}</h1><p className="muted">{profile?.country ?? 'Country pending'} • {user.email}</p></div><div className="status-pill">● ONLINE</div></div>
        <div className="game-switcher" aria-label="Active game profile">
          <span className="muted">ACTIVE GAME</span>
          {(['DLS', 'eFootball'] as Game[]).map(game => <button key={game} className={`button ${activeGame === game ? '' : 'ghost'}`} onClick={() => switchGame(game)}>{game}</button>)}
        </div>
        <p className="muted">Switching is instant and does not log you out. Fixtures, leagues, rankings, tournaments, and results remain separated by game.</p>
      </section>
      <div className="grid">
        <article className="card"><div className="badge">🎮 {activeGame}</div><h2>{activeGame} profile</h2><p className="muted">GreyVerse ID: {greyverseId}</p><p className="muted">Only {activeGame} competitions are shown in this context.</p></article>
        <article className="card"><h2>Progress</h2><p className="muted">XP: {player?.xp ?? 0}</p><p className="muted">Level: {player?.level ?? 1}</p><p className="muted">Rating: {player?.rating ?? 0}</p></article>
      </div>
    </main>
  )
}
