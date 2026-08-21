'use client'

import { FormEvent, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Section = 'home' | 'league' | 'fixtures' | 'tournaments' | 'rankings' | 'profile' | 'notifications' | 'login' | 'signup'
const nav: [Section, string, string][] = [['league','⚔️','League'],['fixtures','⚽','Fixtures'],['tournaments','🏆','Tournaments'],['rankings','📊','Rankings'],['profile','👤','Profile'],['notifications','🔔','Notifications']]

export default function Home() {
  const [section, setSection] = useState<Section>('home')
  const [user, setUser] = useState<any>(null)
  const [rows, setRows] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [player, setPlayer] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [username, setUsername] = useState(''); const [game, setGame] = useState('eFootball'); const [country, setCountry] = useState('Nigeria')

  useEffect(() => {
    const onHash = () => setSection((location.hash.replace('#','') as Section) || 'home')
    onHash(); window.addEventListener('hashchange', onHash)
    if (supabase) supabase.auth.getUser().then(({data}) => setUser(data.user ?? null))
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function go(next: Section) { location.hash = next }

  useEffect(() => {
    if (!supabase || !['league','fixtures','tournaments','rankings','notifications','profile'].includes(section)) return
    let active = true
    setLoading(true); setMessage('')
    ;(async () => {
      if (section === 'profile' || section === 'notifications') {
        const {data:{user:u}} = await supabase.auth.getUser(); if (!active) return
        setUser(u ?? null)
        if (!u) { setMessage('Sign in to access this section.'); setLoading(false); return }
        if (section === 'profile') {
          const [p,pl] = await Promise.all([supabase.from('profiles').select('*').eq('user_id',u.id).maybeSingle(),supabase.from('players').select('*').eq('user_id',u.id).maybeSingle()])
          if (p.error || pl.error) setMessage(p.error?.message ?? pl.error?.message ?? 'Unable to load profile.')
          else { setProfile(p.data); setPlayer(pl.data) }
        } else {
          const {data,error}=await supabase.from('notifications').select('*').eq('user_id',u.id).order('created_at',{ascending:false}); if(error) setMessage(error.message); else setRows(data ?? [])
        }
      } else {
        const table = section === 'league' ? 'leagues' : section === 'fixtures' ? 'fixtures' : section === 'tournaments' ? 'tournaments' : 'rankings'
        const query = section === 'rankings' ? supabase.from(table).select('id,player_id,total_points,global_rank,league_rank,matches_played,wins,goals,rating').order('global_rank',{ascending:true,nullsFirst:false}).limit(50) : supabase.from(table).select('*').limit(100)
        const {data,error}=await query; if(error) setMessage(error.message); else setRows(data ?? [])
      }
      if (active) setLoading(false)
    })()
    return () => { active = false }
  }, [section])

  async function login(e:FormEvent){e.preventDefault();if(!supabase)return;setLoading(true);setMessage('');const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error)setMessage(error.message);else{setUser(data.user);go('profile')}setLoading(false)}
  async function signup(e:FormEvent){e.preventDefault();if(!supabase)return;setLoading(true);setMessage('Creating account…');const {data,error}=await supabase.auth.signUp({email,password,options:{data:{username,game_name:game,country}}});if(error){setMessage(error.message);setLoading(false);return}if(data.user){const p=await supabase.from('profiles').upsert({user_id:data.user.id,username,game_name:game,country,activity_status:'online',privacy_consent_at:new Date().toISOString(),terms_accepted_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:'user_id'});if(p.error){setMessage(p.error.message);setLoading(false);return}const existing=await supabase.from('players').select('id').eq('user_id',data.user.id).maybeSingle();if(!existing.data){const pl=await supabase.from('players').insert({user_id:data.user.id,username,game_type:game,status:'active'});if(pl.error){setMessage(pl.error.message);setLoading(false);return}}}setUser(data.user);setMessage(data.session?'Account ready.':'Account created. Check your email, then sign in.');if(data.session)go('profile');setLoading(false)}
  async function logout(){if(supabase)await supabase.auth.signOut();setUser(null);setProfile(null);setPlayer(null);go('home')}

  return <main className="shell">
    <nav className="nav"><strong>◈ GreyVerse</strong><button className="button" onClick={()=>go('home')}>⌂ Home</button>{nav.map(([id,icon,name])=><button className="button" key={id} onClick={()=>go(id)}>{icon} {name}</button>)}{user?<button className="button" onClick={logout}>↪ Sign out</button>:<><button className="button" onClick={()=>go('login')}>→ Sign in</button><button className="button" onClick={()=>go('signup')}>✦ Create account</button></>}</nav>
    {section==='home' && <><section className="hero"><p className="muted">🎮 GAMING • ESPORTS • COMPETITION</p><h1>Welcome to GreyVerse</h1><p className="muted">Your home for eFootball and DLS leagues, tournaments, rankings and community competition.</p><button className="button" onClick={()=>go(user?'profile':'signup')}>Enter GreyVerse →</button></section><section className="grid">{nav.map(([id,icon,name])=><button className="card" onClick={()=>go(id)} key={id}><div className="badge">{icon}</div><h2>{name}</h2><p className="muted">Open the live GreyVerse {name.toLowerCase()} center.</p><span className="button">Open {name} →</span></button>)}</section></>}
    {section==='login' && <section className="hero"><h1>Sign in</h1><form className="card" onSubmit={login}><input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/><button className="button" disabled={loading}>{loading?'Signing in…':'Sign in'}</button><p className="muted">{message}</p></form></section>}
    {section==='signup' && <section className="hero"><h1>Create account</h1><form className="card" onSubmit={signup}><input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required minLength={3}/><select value={game} onChange={e=>setGame(e.target.value)}><option>eFootball</option><option>DLS</option></select><input placeholder="Country" value={country} onChange={e=>setCountry(e.target.value)} required/><input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Password (6+ characters)" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required/><button className="button" disabled={loading}>{loading?'Creating…':'Create account'}</button><p className="muted">{message}</p></form></section>}
    {section==='profile' && <section className="hero"><h1>👤 Profile</h1>{!user?<article className="card"><p className="muted">Sign in to load your player profile.</p><button className="button" onClick={()=>go('login')}>Sign in</button></article>:<div className="grid"><article className="card"><div className="badge">🎮 {profile?.game_name??player?.game_type??'Game'}</div><h2>{profile?.username??player?.username??user.email}</h2><p className="muted">{user.email}</p><p className="muted">Player ID: {player?.id??'Pending'}</p></article><article className="card"><h2>Progress</h2><p className="muted">XP: {player?.xp??0}</p><p className="muted">Level: {player?.level??1}</p><p className="muted">Rating: {player?.rating??0}</p></article></div>}</section>}
    {['league','fixtures','tournaments','rankings','notifications'].includes(section) && <section className="hero"><h1>{nav.find(x=>x[0]===section)?.[1]} {nav.find(x=>x[0]===section)?.[2]}</h1>{loading&&<article className="card"><h2>Loading…</h2></article>}{message&&<article className="card"><p className="muted">{message}</p></article>}{!loading&&!message&&<div className="grid">{rows.map((r:any,i)=><article className="card" key={r.id??i}><div className="badge">{section==='rankings'?'#'+(r.global_rank??i+1):section==='notifications'?'🔔 '+(r.notification_type??'Update'):'LIVE'}</div><h2>{r.tournament_name??r.league_name??r.title??r.player_name??(section==='rankings'?'Player '+r.player_id:section==='fixtures'?'Match':'GreyVerse '+section)}</h2><p className="muted">{r.message??r.total_points!=null?`${r.total_points} points · Rating ${r.rating??0}`:r.status??r.game_type??'GreyVerse competition'}</p></article>)}{!rows.length&&<article className="card"><h2>Nothing here yet</h2><p className="muted">The GreyVerse database has no records for this section yet.</p></article>}</div>}</section>}
  </main>
}
