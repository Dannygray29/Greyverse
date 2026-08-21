'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Section = 'home' | 'league' | 'fixtures' | 'tournaments' | 'rankings' | 'profile' | 'notifications' | 'login' | 'signup'
type Row = Record<string, any>

const nav: [Section, string, string][] = [
  ['league', '⚔️', 'League'], ['fixtures', '⚽', 'Fixtures'], ['tournaments', '🏆', 'Tournaments'],
  ['rankings', '📊', 'Rankings'], ['profile', '👤', 'Profile'], ['notifications', '🔔', 'Notifications'],
]

export default function Home() {
  const [section, setSection] = useState<Section>('home')
  const [user, setUser] = useState<any>(null), [player, setPlayer] = useState<Row | null>(null), [profile, setProfile] = useState<Row | null>(null)
  const [rows, setRows] = useState<Row[]>([]), [players, setPlayers] = useState<Row[]>([]), [games, setGames] = useState<Row[]>([]), [seasons, setSeasons] = useState<Row[]>([])
  const [memberships, setMemberships] = useState<Row[]>([]), [registrations, setRegistrations] = useState<Row[]>([])
  const [loading, setLoading] = useState(false), [message, setMessage] = useState('')
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [username, setUsername] = useState(''), [game, setGame] = useState('eFootball'), [country, setCountry] = useState('Nigeria')
  const [savingProfile, setSavingProfile] = useState(false)
  const go = useCallback((next: Section) => { location.hash = next }, [])

  const refreshPlayerState = useCallback(async (u: any) => {
    if (!supabase || !u) return
    const { data: pl } = await supabase.from('players').select('*').eq('user_id', u.id).maybeSingle()
    const [{ data: p }, { data: m }, { data: tp }] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', u.id).maybeSingle(),
      pl ? supabase.from('league_members').select('*').eq('player_id', pl.id) : Promise.resolve({ data: [] as Row[] }),
      pl ? supabase.from('tournament_players').select('*').eq('player_id', pl.id) : Promise.resolve({ data: [] as Row[] }),
    ])
    setProfile(p ?? null); setPlayer(pl ?? null); setMemberships(m ?? []); setRegistrations(tp ?? [])
  }, [])

  useEffect(() => {
    const onHash = () => { const value = location.hash.replace('#', '') as Section; setSection((['home','league','fixtures','tournaments','rankings','profile','notifications','login','signup'] as string[]).includes(value) ? value : 'home') }
    onHash(); window.addEventListener('hashchange', onHash)
    let subscription: { unsubscribe: () => void } | undefined
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => { setUser(data.user ?? null); if (data.user) refreshPlayerState(data.user) })
      subscription = supabase.auth.onAuthStateChange((_event, session) => { const u = session?.user ?? null; setUser(u); if (u) refreshPlayerState(u); else { setProfile(null); setPlayer(null); setMemberships([]); setRegistrations([]) } }).data.subscription
    }
    return () => { window.removeEventListener('hashchange', onHash); subscription?.unsubscribe() }
  }, [refreshPlayerState])

  const loadSection = useCallback(async () => {
    if (!supabase || !['league','fixtures','tournaments','rankings','notifications'].includes(section)) return
    setLoading(true); setMessage('')
    try {
      if (section === 'notifications') {
        if (!user) { setRows([]); setMessage('Sign in to access your notifications.'); return }
        const { data, error } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }); if (error) throw error; setRows(data ?? [])
      } else if (section === 'rankings') {
        const { data, error } = await supabase.from('rankings').select('id,player_id,total_points,global_rank,league_rank,matches_played,wins,goals,rating,game_id,season_id').order('global_rank', { ascending: true, nullsFirst: false }).limit(50); if (error) throw error; setRows(data ?? [])
      } else {
        const table = section === 'league' ? 'leagues' : section === 'fixtures' ? 'fixtures' : 'tournaments'; const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false }).limit(100); if (error) throw error; setRows(data ?? [])
      }
    } catch (error: any) { setMessage(error?.message ?? 'Unable to load live data.') } finally { setLoading(false) }
  }, [section, user])
  useEffect(() => { loadSection() }, [loadSection])
  useEffect(() => { if (!supabase) return; const channel = supabase.channel(`greyverse-live-${user?.id ?? 'public'}`).on('postgres_changes', { event: '*', schema: 'public', table: 'leagues' }, loadSection).on('postgres_changes', { event: '*', schema: 'public', table: 'fixtures' }, loadSection).on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, loadSection).on('postgres_changes', { event: '*', schema: 'public', table: 'rankings' }, loadSection); if (user) channel.on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, loadSection); channel.subscribe(); return () => { supabase.removeChannel(channel) } }, [loadSection, user])
  useEffect(() => { if (!supabase) return; Promise.all([supabase.from('players').select('id,user_id,username,game_type,rank,rating,points').limit(500), supabase.from('games').select('*').order('display_order', { ascending: true }), supabase.from('seasons').select('*').order('start_date', { ascending: false })]).then(([p,g,s]) => { setPlayers(p.data ?? []); setGames(g.data ?? []); setSeasons(s.data ?? []) }) }, [])
  const playerName = useMemo(() => new Map(players.map(p => [p.id, p.username || `Player ${p.id.slice(0,6)}`])), [players]), gameName = useMemo(() => new Map(games.map(g => [g.id, g.game_name || g.short_name])), [games]), seasonName = useMemo(() => new Map(seasons.map(s => [s.id, s.season_name])), [seasons]), unreadCount = rows.filter(r => !r.is_read).length

  async function login(e: FormEvent) { e.preventDefault(); if (!supabase) return; setLoading(true); setMessage(''); const { data,error } = await supabase.auth.signInWithPassword({ email,password }); if (error) setMessage(error.message); else { setUser(data.user); go('profile') }; setLoading(false) }

  async function signup(e: FormEvent) {
    e.preventDefault(); if (!supabase) return; setLoading(true); setMessage('Creating account…')
    const { data,error } = await supabase.auth.signUp({ email,password,options:{ data:{ username,game_name:game,game_type:game,country } } })
    if (error) { setMessage(error.message); setLoading(false); return }
    if (data.user) {
      await refreshPlayerState(data.user)
      setUser(data.user)
      setMessage(data.session ? 'Account ready.' : 'Account created. Check your email, then sign in.')
      if (data.session) go('profile')
    }
    setLoading(false)
  }
  async function logout() { if (supabase) await supabase.auth.signOut(); setUser(null); setProfile(null); setPlayer(null); go('home') }
  async function saveProfile(e: FormEvent) { e.preventDefault(); if (!supabase || !user) return; setSavingProfile(true); setMessage(''); const {error}=await supabase.from('profiles').update({username,country,game_name:game,updated_at:new Date().toISOString()}).eq('user_id',user.id); if(error)setMessage(error.message); else {await refreshPlayerState(user);setMessage('Profile saved.')}; setSavingProfile(false) }
  async function markRead(id:string) { if(!supabase||!user)return; const {error}=await supabase.from('notifications').update({is_read:true,read_at:new Date().toISOString()}).eq('id',id).eq('user_id',user.id); if(!error)setRows(current=>current.map(r=>r.id===id?{...r,is_read:true}:r)) }
  async function joinLeague(league:Row) { if(!supabase||!user||!player){setMessage('Sign in and finish your player profile first.');return}; const seasonId=league.season_id||seasons.find(s=>s.status==='active'&&(!league.game_id||s.game_id===league.game_id))?.id; if(!seasonId){setMessage('This league has no active season configured.');return}; setLoading(true); const {error}=await supabase.from('league_members').insert({league_id:league.id,player_id:player.id,season_id:seasonId,membership_status:'active',active:true}); if(error)setMessage(error.message);else{setMessage('League registration submitted.');await refreshPlayerState(user);await loadSection()};setLoading(false) }
  async function joinTournament(tournament:Row) { if(!supabase||!user||!player){setMessage('Sign in and finish your player profile first.');return}; setLoading(true); const {error}=await supabase.from('tournament_players').insert({tournament_id:tournament.id,player_id:player.id,registration_status:'registered'}); if(error)setMessage(error.message);else{setMessage('Tournament registration submitted.');await refreshPlayerState(user);await loadSection()};setLoading(false) }

  return <main className="shell"><nav className="nav"><strong>◈ GreyVerse</strong><button className="button" onClick={()=>go('home')}>⌂ Home</button>{nav.map(([id,icon,name])=><button className="button" key={id} onClick={()=>go(id)}>{icon} {name}{id==='notifications'&&unreadCount>0?` (${unreadCount})`:''}</button>)}{user?<button className="button" onClick={logout}>↪ Sign out</button>:<><button className="button" onClick={()=>go('login')}>→ Sign in</button><button className="button" onClick={()=>go('signup')}>✦ Create account</button></>}</nav>
    {section==='home'&&<><section className="hero"><p className="muted">🎮 GAMING • ESPORTS • COMPETITION</p><h1>Welcome to GreyVerse</h1><p className="muted">A live competitive hub powered by Supabase — accounts, players, leagues, fixtures, tournaments, rankings and notifications are connected to the database.</p><button className="button" onClick={()=>go(user?'profile':'signup')}>Enter GreyVerse →</button></section><section className="grid">{nav.map(([id,icon,name])=><button className="card" onClick={()=>go(id)} key={id}><div className="badge">{icon}</div><h2>{name}</h2><p className="muted">Open live GreyVerse {name.toLowerCase()} data.</p><span className="button">Open {name} →</span></button>)}</section></>}
    {section==='login'&&<section className="hero"><h1>Sign in</h1><form className="card" onSubmit={login}><input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/><button className="button" disabled={loading}>{loading?'Signing in…':'Sign in'}</button><p className="muted">{message}</p></form></section>}
    {section==='signup'&&<section className="hero"><h1>Create account</h1><form className="card" onSubmit={signup}><input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required minLength={3}/><select value={game} onChange={e=>setGame(e.target.value)}>{games.length?games.map(g=><option key={g.id} value={g.game_name}>{g.game_name}</option>):<><option>eFootball</option><option>DLS</option></>}</select><input placeholder="Country" value={country} onChange={e=>setCountry(e.target.value)} required/><input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Password (6+ characters)" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required/><button className="button" disabled={loading}>{loading?'Creating…':'Create account'}</button><p className="muted">{message}</p></form></section>}
    {section==='profile'&&<section className="hero"><h1>👤 Profile</h1>{!user?<article className="card"><p className="muted">Sign in to load your live player profile.</p><button className="button" onClick={()=>go('login')}>Sign in</button></article>:<div className="grid"><article className="card"><div className="badge">🎮 {profile?.game_name??player?.game_type??'Game'}</div><h2>{profile?.username??player?.username??user.email}</h2><p className="muted">{user.email}</p><p className="muted">GreyVerse ID: {profile?.greyverse_id??player?.greyverse_id??'Pending'}</p><p className="muted">Player ID: {player?.id??'Pending'}</p></article><form className="card" onSubmit={saveProfile}><h2>Edit profile</h2><input value={username||profile?.username||''} onChange={e=>setUsername(e.target.value)} placeholder="Username" required/><input value={country||profile?.country||''} onChange={e=>setCountry(e.target.value)} placeholder="Country" required/><select value={game||profile?.game_name||'eFootball'} onChange={e=>setGame(e.target.value)}>{games.length?games.map(g=><option key={g.id} value={g.game_name}>{g.game_name}</option>):<><option>eFootball</option><option>DLS</option></>}</select><button className="button" disabled={savingProfile}>{savingProfile?'Saving…':'Save profile'}</button><p className="muted">{message}</p></form></div>}</section>}
    {['league','fixtures','tournaments','rankings','notifications'].includes(section)&&<section className="hero"><h1>{nav.find(n=>n[0]===section)?.[1]} {nav.find(n=>n[0]===section)?.[2]}</h1>{loading?<p className="muted">Loading live data…</p>:message&&<p className="muted">{message}</p>}<div className="grid">{rows.map((r,i)=><article className="card" key={r.id??i}><h2>{section==='rankings'?playerName.get(r.player_id)??'Player':section==='notifications'?r.title??'Notification':r.name??r.title??'GreyVerse'}</h2><p className="muted">{section==='rankings'?`Points: ${r.total_points??0} • Rank: ${r.global_rank??'-'} • Rating: ${r.rating??'-'}${r.game_id?` • ${gameName.get(r.game_id)??''}`:''}${r.season_id?` • ${seasonName.get(r.season_id)??''}`:''}`:r.description??r.status??r.scheduled_at??r.created_at??'Live database record'}</p>{section==='notifications'&&user&&!r.is_read&&<button className="button" onClick={()=>markRead(r.id)}>Mark read</button>}{section==='league'&&user&&player&&<button className="button" onClick={()=>joinLeague(r)} disabled={loading}>Join league</button>}{section==='tournaments'&&user&&player&&<button className="button" onClick={()=>joinTournament(r)} disabled={loading}>Register</button>}</article>)}</div></section>}
  </main>
}
