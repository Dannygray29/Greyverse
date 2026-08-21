'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Section = 'home' | 'league' | 'fixtures' | 'tournaments' | 'rankings' | 'profile' | 'notifications' | 'login' | 'signup'
type Row = Record<string, any>

const nav: [Section, string, string][] = [
  ['league', '⚔️', 'League'],
  ['fixtures', '⚽', 'Fixtures'],
  ['tournaments', '🏆', 'Tournaments'],
  ['rankings', '📊', 'Rankings'],
  ['profile', '👤', 'Profile'],
  ['notifications', '🔔', 'Notifications'],
]

export default function Home() {
  const [section, setSection] = useState<Section>('home')
  const [user, setUser] = useState<any>(null)
  const [player, setPlayer] = useState<Row | null>(null)
  const [profile, setProfile] = useState<Row | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [players, setPlayers] = useState<Row[]>([])
  const [games, setGames] = useState<Row[]>([])
  const [seasons, setSeasons] = useState<Row[]>([])
  const [memberships, setMemberships] = useState<Row[]>([])
  const [registrations, setRegistrations] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [game, setGame] = useState('eFootball')
  const [country, setCountry] = useState('Nigeria')
  const [savingProfile, setSavingProfile] = useState(false)

  const go = useCallback((next: Section) => { location.hash = next }, [])

  const refreshPlayerState = useCallback(async (u: any) => {
    if (!supabase || !u) return
    const [{ data: p }, { data: pl }, { data: m }, { data: tp }] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', u.id).maybeSingle(),
      supabase.from('players').select('*').eq('user_id', u.id).maybeSingle(),
      supabase.from('league_members').select('*').eq('player_id', (await supabase.from('players').select('id').eq('user_id', u.id).maybeSingle()).data?.id ?? ''),
      supabase.from('tournament_players').select('*').eq('player_id', (await supabase.from('players').select('id').eq('user_id', u.id).maybeSingle()).data?.id ?? ''),
    ])
    setProfile(p ?? null)
    setPlayer(pl ?? null)
    setMemberships(m ?? [])
    setRegistrations(tp ?? [])
  }, [])

  useEffect(() => {
    const onHash = () => setSection((location.hash.replace('#', '') as Section) || 'home')
    onHash()
    window.addEventListener('hashchange', onHash)
    let subscription: { unsubscribe: () => void } | undefined
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        setUser(data.user ?? null)
        if (data.user) refreshPlayerState(data.user)
      })
      subscription = supabase.auth.onAuthStateChange((_event, session) => {
        const u = session?.user ?? null
        setUser(u)
        if (u) refreshPlayerState(u)
        else { setProfile(null); setPlayer(null); setMemberships([]); setRegistrations([]) }
      }).data.subscription
    }
    return () => { window.removeEventListener('hashchange', onHash); subscription?.unsubscribe() }
  }, [refreshPlayerState])

  const loadSection = useCallback(async () => {
    if (!supabase || !['league', 'fixtures', 'tournaments', 'rankings', 'notifications'].includes(section)) return
    setLoading(true)
    setMessage('')
    try {
      if (section === 'notifications') {
        if (!user) { setRows([]); setMessage('Sign in to access your notifications.'); return }
        const { data, error } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        if (error) throw error
        setRows(data ?? [])
      } else if (section === 'rankings') {
        const { data, error } = await supabase.from('rankings').select('id,player_id,total_points,global_rank,league_rank,matches_played,wins,goals,rating,game_id,season_id').order('global_rank', { ascending: true, nullsFirst: false }).limit(50)
        if (error) throw error
        setRows(data ?? [])
      } else {
        const table = section === 'league' ? 'leagues' : section === 'fixtures' ? 'fixtures' : 'tournaments'
        const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false }).limit(100)
        if (error) throw error
        setRows(data ?? [])
      }
    } catch (error: any) {
      setMessage(error?.message ?? 'Unable to load live data.')
    } finally {
      setLoading(false)
    }
  }, [section, user])

  useEffect(() => { loadSection() }, [loadSection])

  useEffect(() => {
    if (!supabase) return
    let channel = supabase.channel('greyverse-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leagues' }, loadSection)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fixtures' }, loadSection)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, loadSection)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rankings' }, loadSection)
    if (user) channel = channel.on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, loadSection)
    channel.subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [loadSection, user])

  useEffect(() => {
    if (!supabase) return
    Promise.all([
      supabase.from('players').select('id,user_id,username,game_type,rank,rating,points').limit(500),
      supabase.from('games').select('*').order('display_order', { ascending: true }),
      supabase.from('seasons').select('*').order('start_date', { ascending: false }),
    ]).then(([p, g, s]) => {
      setPlayers(p.data ?? [])
      setGames(g.data ?? [])
      setSeasons(s.data ?? [])
    })
  }, [])

  const playerName = useMemo(() => new Map(players.map(p => [p.id, p.username || `Player ${p.id.slice(0, 6)}`])), [players])
  const gameName = useMemo(() => new Map(games.map(g => [g.id, g.game_name || g.short_name])), [games])
  const seasonName = useMemo(() => new Map(seasons.map(s => [s.id, s.season_name])), [seasons])
  const unreadCount = rows.filter(r => !r.is_read).length

  async function login(e: FormEvent) {
    e.preventDefault(); if (!supabase) return
    setLoading(true); setMessage('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    else { setUser(data.user); go('profile') }
    setLoading(false)
  }

  async function signup(e: FormEvent) {
    e.preventDefault(); if (!supabase) return
    setLoading(true); setMessage('Creating account…')
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username, game_name: game, country } } })
    if (error) { setMessage(error.message); setLoading(false); return }
    if (data.user) {
      const p = await supabase.from('profiles').upsert({ user_id: data.user.id, username, game_name: game, country, activity_status: 'online', privacy_consent_at: new Date().toISOString(), terms_accepted_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      if (p.error) { setMessage(p.error.message); setLoading(false); return }
      const existing = await supabase.from('players').select('id').eq('user_id', data.user.id).maybeSingle()
      if (existing.error) { setMessage(existing.error.message); setLoading(false); return }
      if (!existing.data) {
        const gameRow = games.find(g => g.game_name === game || g.short_name === game)
        const pl = await supabase.from('players').insert({ user_id: data.user.id, username, game_type: game, game_id: gameRow?.id ?? null, status: 'active' })
        if (pl.error) { setMessage(pl.error.message); setLoading(false); return }
      }
      await refreshPlayerState(data.user)
    }
    setUser(data.user)
    setMessage(data.session ? 'Account ready.' : 'Account created. Check your email, then sign in.')
    if (data.session) go('profile')
    setLoading(false)
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut()
    setUser(null); setProfile(null); setPlayer(null); go('home')
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault(); if (!supabase || !user) return
    setSavingProfile(true); setMessage('')
    const { error } = await supabase.from('profiles').update({ username, country, game_name: game, updated_at: new Date().toISOString() }).eq('user_id', user.id)
    if (error) setMessage(error.message)
    else { await refreshPlayerState(user); setMessage('Profile saved.') }
    setSavingProfile(false)
  }

  async function markRead(id: string) {
    if (!supabase || !user) return
    const { error } = await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id)
    if (!error) setRows(current => current.map(r => r.id === id ? { ...r, is_read: true } : r))
  }

  async function joinLeague(league: Row) {
    if (!supabase || !user || !player) { setMessage('Sign in and finish your player profile first.'); return }
    const seasonId = league.season_id || seasons.find(s => s.status === 'active' && (!league.game_id || s.game_id === league.game_id))?.id
    if (!seasonId) { setMessage('This league has no active season configured.'); return }
    setLoading(true)
    const { error } = await supabase.from('league_members').insert({ league_id: league.id, player_id: player.id, season_id: seasonId, membership_status: 'active', active: true })
    if (error) setMessage(error.message)
    else { setMessage('League registration submitted.'); await refreshPlayerState(user); await loadSection() }
    setLoading(false)
  }

  async function joinTournament(tournament: Row) {
    if (!supabase || !user || !player) { setMessage('Sign in and finish your player profile first.'); return }
    setLoading(true)
    const { error } = await supabase.from('tournament_players').insert({ tournament_id: tournament.id, player_id: player.id, registration_status: 'registered' })
    if (error) setMessage(error.message)
    else { setMessage('Tournament registration submitted.'); await refreshPlayerState(user); await loadSection() }
    setLoading(false)
  }

  return <main className="shell">
    <nav className="nav">
      <strong>◈ GreyVerse</strong>
      <button className="button" onClick={() => go('home')}>⌂ Home</button>
      {nav.map(([id, icon, name]) => <button className="button" key={id} onClick={() => go(id)}>{icon} {name}{id === 'notifications' && unreadCount > 0 ? ` (${unreadCount})` : ''}</button>)}
      {user ? <button className="button" onClick={logout}>↪ Sign out</button> : <><button className="button" onClick={() => go('login')}>→ Sign in</button><button className="button" onClick={() => go('signup')}>✦ Create account</button></>}
    </nav>

    {section === 'home' && <>
      <section className="hero"><p className="muted">🎮 GAMING • ESPORTS • COMPETITION</p><h1>Welcome to GreyVerse</h1><p className="muted">A live competitive hub powered by Supabase — accounts, players, leagues, fixtures, tournaments, rankings and notifications are connected to the database.</p><button className="button" onClick={() => go(user ? 'profile' : 'signup')}>Enter GreyVerse →</button></section>
      <section className="grid">{nav.map(([id, icon, name]) => <button className="card" onClick={() => go(id)} key={id}><div className="badge">{icon}</div><h2>{name}</h2><p className="muted">Open live GreyVerse {name.toLowerCase()} data.</p><span className="button">Open {name} →</span></button>)}</section>
    </>}

    {section === 'login' && <section className="hero"><h1>Sign in</h1><form className="card" onSubmit={login}><input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required/><input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required/><button className="button" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button><p className="muted">{message}</p></form></section>}

    {section === 'signup' && <section className="hero"><h1>Create account</h1><form className="card" onSubmit={signup}><input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required minLength={3}/><select value={game} onChange={e => setGame(e.target.value)}>{games.length ? games.map(g => <option key={g.id} value={g.game_name}>{g.game_name}</option>) : <><option>eFootball</option><option>DLS</option></>}</select><input placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} required/><input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required/><input type="password" placeholder="Password (6+ characters)" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required/><button className="button" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button><p className="muted">{message}</p></form></section>}

    {section === 'profile' && <section className="hero"><h1>👤 Profile</h1>{!user ? <article className="card"><p className="muted">Sign in to load your live player profile.</p><button className="button" onClick={() => go('login')}>Sign in</button></article> : <div className="grid">
      <article className="card"><div className="badge">🎮 {profile?.game_name ?? player?.game_type ?? 'Game'}</div><h2>{profile?.username ?? player?.username ?? user.email}</h2><p className="muted">{user.email}</p><p className="muted">GreyVerse ID: {profile?.greyverse_id ?? player?.greyverse_id ?? 'Pending'}</p><p className="muted">Player ID: {player?.id ?? 'Pending'}</p></article>
      <form className="card" onSubmit={saveProfile}><h2>Edit profile</h2><input value={username || profile?.username || ''} onChange={e => setUsername(e.target.value)} placeholder="Username" required/><input value={country || profile?.country || ''} onChange={e => setCountry(e.target.value)} placeholder="Country" required/><select value={game || profile?.game_name || 'eFootball'} onChange={e => setGame(e.target.value)}>{games.length ? games.map(g => <option key={g.id} value={g.game_name}>{g.game_name}</option>) : <><option>eFootball</option><option>DLS</option></>}</select><button className="button" disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Save profile'}</button><p className="muted">{message}</p></form>
      <article className="card"><h2>Progress</h2><p className="muted">Matches: {player?.matches_played ?? 0}</p><p className="muted">Wins: {player?.wins ?? 0}</p><p className="muted">Points: {player?.points ?? 0}</p><p className="muted">Rank: {player?.rank ?? 'Bronze'}</p><p className="muted">League registrations: {memberships.length}</p><p className="muted">Tournament registrations: {registrations.length}</p></article>
    </div>}</section>}

    {section === 'league' && <section className="hero"><h1>⚔️ League</h1>{loading && <article className="card"><h2>Syncing live league data…</h2></article>}{message && <article className="card"><p className="muted">{message}</p></article>}<div className="grid">{rows.map((r, i) => <article className="card" key={r.id ?? i}><div className="badge">{r.is_active ? 'LIVE' : r.status ?? 'UPCOMING'}</div><h2>{r.display_name ?? r.league_name ?? `League ${i + 1}`}</h2><p className="muted">Division {r.division_number ?? r.division ?? 1} · {r.current_players ?? 0}/{r.max_players ?? 30} players · {r.league_duration_days ?? 60} days</p>{user && player && <button className="button" disabled={loading || memberships.some(m => m.league_id === r.id)} onClick={() => joinLeague(r)}>{memberships.some(m => m.league_id === r.id) ? 'Joined ✓' : 'Join league'}</button>}</article>)}{!loading && !rows.length && <article className="card"><h2>No leagues yet</h2><p className="muted">The database has no league records.</p></article>}</div></section>}

    {section === 'fixtures' && <section className="hero"><h1>⚽ Fixtures</h1>{loading && <article className="card"><h2>Syncing live fixtures…</h2></article>}{message && <article className="card"><p className="muted">{message}</p></article>}<div className="grid">{rows.map((r, i) => <article className="card" key={r.id ?? i}><div className="badge">{r.status ?? 'scheduled'}</div><h2>{playerName.get(r.home_player_id) ?? `Home ${r.home_player_id?.slice(0, 6)}`} vs {playerName.get(r.away_player_id) ?? `Away ${r.away_player_id?.slice(0, 6)}`}</h2><p className="muted">Matchday {r.matchday} · {r.scheduled_date}{r.scheduled_time ? ` · ${r.scheduled_time}` : ''}</p><p className="muted">{r.verified ? 'Verified result' : 'Awaiting verified result'}</p></article>)}{!loading && !rows.length && <article className="card"><h2>No fixtures yet</h2></article>}</div></section>}

    {section === 'tournaments' && <section className="hero"><h1>🏆 Tournaments</h1>{loading && <article className="card"><h2>Syncing live tournaments…</h2></article>}{message && <article className="card"><p className="muted">{message}</p></article>}<div className="grid">{rows.map((r, i) => <article className="card" key={r.id ?? i}><div className="badge">{String(r.status ?? 'upcoming').trim()}</div><h2>{r.tournament_name ?? `Tournament ${i + 1}`}</h2><p className="muted">{r.tournament_type} · {r.max_players} players · Entry {r.entry_cost ?? 0}</p>{user && player && <button className="button" disabled={loading || registrations.some(x => x.tournament_id === r.id)} onClick={() => joinTournament(r)}>{registrations.some(x => x.tournament_id === r.id) ? 'Registered ✓' : 'Register'}</button>}</article>)}{!loading && !rows.length && <article className="card"><h2>No tournaments yet</h2></article>}</div></section>}

    {section === 'rankings' && <section className="hero"><h1>📊 Rankings</h1>{loading && <article className="card"><h2>Syncing live rankings…</h2></article>}{message && <article className="card"><p className="muted">{message}</p></article>}<div className="grid">{rows.map((r, i) => <article className="card" key={r.id ?? i}><div className="badge">#{r.global_rank ?? i + 1}</div><h2>{playerName.get(r.player_id) ?? `Player ${r.player_id?.slice(0, 6)}`}</h2><p className="muted">{r.total_points} points · Rating {r.rating ?? 0} · {r.wins} wins</p><p className="muted">Game: {gameName.get(r.game_id) ?? 'All games'} · Season: {seasonName.get(r.season_id) ?? 'Current'}</p></article>)}{!loading && !rows.length && <article className="card"><h2>No rankings yet</h2></article>}</div></section>}

    {section === 'notifications' && <section className="hero"><h1>🔔 Notifications</h1>{loading && <article className="card"><h2>Syncing notifications…</h2></article>}{message && <article className="card"><p className="muted">{message}</p></article>}<div className="grid">{rows.map((r, i) => <article className="card" key={r.id ?? i}><div className="badge">{r.is_read ? 'READ' : 'NEW'}</div><h2>{r.title}</h2><p className="muted">{r.message ?? r.body}</p><small className="muted">{new Date(r.created_at).toLocaleString()}</small>{!r.is_read && <button className="button" onClick={() => markRead(r.id)}>Mark as read</button>}</article>)}{!loading && !rows.length && !message && <article className="card"><h2>No notifications</h2></article>}</div></section>}
  </main>
}
