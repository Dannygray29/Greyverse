'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Section = 'home'|'league'|'fixtures'|'tournaments'|'rankings'|'profile'|'notifications'|'login'|'signup'
type Row = Record<string, any>
const sections: [Section,string,string][] = [
  ['league','⚔️','League'],['fixtures','⚽','Fixtures'],['tournaments','🏆','Tournaments'],
  ['rankings','📊','Rankings'],['profile','👤','Profile'],['notifications','🔔','Notifications'],
]
const allowed = new Set(['home','league','fixtures','tournaments','rankings','profile','notifications','login','signup'])

export default function Home(){
  const [section,setSection]=useState<Section>('home')
  const [user,setUser]=useState<any>(null),[player,setPlayer]=useState<Row|null>(null),[profile,setProfile]=useState<Row|null>(null)
  const [membership,setMembership]=useState<Row|null>(null),[league,setLeague]=useState<Row|null>(null),[standings,setStandings]=useState<Row[]>([])
  const [rows,setRows]=useState<Row[]>([]),[players,setPlayers]=useState<Row[]>([]),[games,setGames]=useState<Row[]>([]),[seasons,setSeasons]=useState<Row[]>([])
  const [registrations,setRegistrations]=useState<Row[]>([]),[level,setLevel]=useState<Row|null>(null),[wallet,setWallet]=useState<Row|null>(null)
  const [loading,setLoading]=useState(false),[message,setMessage]=useState(''),[onlineReady,setOnlineReady]=useState(false)
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[username,setUsername]=useState(''),[game,setGame]=useState('eFootball'),[country,setCountry]=useState('Nigeria')
  const [saving,setSaving]=useState(false),[resultMatch,setResultMatch]=useState<Row|null>(null),[homeScore,setHomeScore]=useState(''),[awayScore,setAwayScore]=useState(''),[evidence,setEvidence]=useState('')

  const go=useCallback((next:Section)=>{location.hash=next},[])
  const connectivity=useCallback(async()=>{
    if(!supabase||!navigator.onLine){setOnlineReady(false);return false}
    const {error}=await supabase.from('games').select('id').limit(1)
    const ok=!error
    setOnlineReady(ok)
    return ok
  },[])

  const refreshPlayer=useCallback(async(u:any)=>{
    if(!supabase||!u)return
    const [{data:p},{data:pl}]=await Promise.all([
      supabase.from('profiles').select('*').eq('user_id',u.id).maybeSingle(),
      supabase.from('players').select('*').eq('user_id',u.id).maybeSingle(),
    ])
    setProfile(p??null);setPlayer(pl??null)
    if(!pl)return
    setUsername(p?.username??pl.username??'');setCountry(p?.country??'Nigeria');setGame(p?.game_name??pl.game_type??'eFootball')
    const [{data:m},{data:t},{data:l},{data:w}]=await Promise.all([
      supabase.from('league_members').select('*').eq('player_id',pl.id).eq('active',true).order('assigned_at',{ascending:false}).limit(1).maybeSingle(),
      supabase.from('tournament_players').select('*').eq('player_id',pl.id),
      supabase.from('player_levels').select('*').eq('player_id',pl.id).maybeSingle(),
      supabase.from('player_wallets').select('*').eq('player_id',pl.id).maybeSingle(),
    ])
    setMembership(m??null);setRegistrations(t??[]);setLevel(l??null);setWallet(w??null)
    if(m?.league_id){const [{data:lg},{data:st}]=await Promise.all([
      supabase.from('leagues').select('*').eq('id',m.league_id).maybeSingle(),
      supabase.from('league_standings').select('*').eq('league_id',m.league_id).eq('season_id',m.season_id).order('position',{ascending:true}),
    ]);setLeague(lg??null);setStandings(st??[])}else{setLeague(null);setStandings([])}
  },[])

  useEffect(()=>{
    const onHash=()=>{const v=location.hash.slice(1);setSection(allowed.has(v)?v as Section:'home')}
    onHash();addEventListener('hashchange',onHash);connectivity()
    const online=()=>connectivity(),offline=()=>setOnlineReady(false);addEventListener('online',online);addEventListener('offline',offline)
    let sub:any
    if(supabase){
      supabase.auth.getUser().then(({data})=>{setUser(data.user??null);if(data.user)refreshPlayer(data.user)})
      sub=supabase.auth.onAuthStateChange((_e,s)=>{const u=s?.user??null;setUser(u);if(u)refreshPlayer(u);else{setPlayer(null);setProfile(null);setMembership(null);setLeague(null);setStandings([])}}).data.subscription
    }
    return()=>{removeEventListener('hashchange',onHash);removeEventListener('online',online);removeEventListener('offline',offline);sub?.unsubscribe()}
  },[connectivity,refreshPlayer])

  useEffect(()=>{if(!supabase||!onlineReady)return;Promise.all([
    supabase.from('players').select('id,user_id,username,game_type,rank,rating,points').limit(1000),
    supabase.from('games').select('*').order('display_order',{ascending:true}),
    supabase.from('seasons').select('*').order('start_date',{ascending:false}),
  ]).then(([p,g,s])=>{setPlayers(p.data??[]);setGames(g.data??[]);setSeasons(s.data??[])})},[onlineReady])

  const loadSection=useCallback(async()=>{
    if(!supabase||!onlineReady)return
    setMessage('')
    if(section==='league'){
      if(user&&player){await refreshPlayer(user)}
      return
    }
    if(!['fixtures','tournaments','rankings','notifications'].includes(section))return
    setLoading(true)
    try{
      let q:any
      if(section==='fixtures')q=supabase.from('fixtures').select('*').order('scheduled_date',{ascending:true}).order('scheduled_time',{ascending:true}).limit(100)
      if(section==='tournaments')q=supabase.from('tournaments').select('*').order('created_at',{ascending:false}).limit(100)
      if(section==='rankings')q=supabase.from('rankings').select('*').order('global_rank',{ascending:true}).limit(100)
      if(section==='notifications'){if(!user){setRows([]);setMessage('Sign in to access notifications.');return};q=supabase.from('notifications').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(100)}
      const {data,error}=await q;if(error)throw error;setRows(data??[])
    }catch(e:any){setMessage(e?.message??'Unable to load live GreyVerse data.')}finally{setLoading(false)}
  },[section,user,player,onlineReady,refreshPlayer])
  useEffect(()=>{loadSection()},[loadSection])

  useEffect(()=>{if(!supabase||!onlineReady)return;const ch=supabase.channel(`greyverse-live-${user?.id??'public'}`)
    .on('postgres_changes',{event:'*',schema:'public',table:'league_standings'},loadSection)
    .on('postgres_changes',{event:'*',schema:'public',table:'fixtures'},loadSection)
    .on('postgres_changes',{event:'*',schema:'public',table:'tournaments'},loadSection)
    .on('postgres_changes',{event:'*',schema:'public',table:'rankings'},loadSection)
    .on('postgres_changes',{event:'*',schema:'public',table:'notifications'},loadSection)
    .subscribe();return()=>{supabase.removeChannel(ch)}},[onlineReady,user,loadSection])

  const playerNames=useMemo(()=>new Map(players.map(p=>[p.id,p.username||`Player ${p.id.slice(0,6)}`])),[players])
  const gameNames=useMemo(()=>new Map(games.map(g=>[g.id,g.game_name||g.short_name])),[games])
  const seasonNames=useMemo(()=>new Map(seasons.map(s=>[s.id,s.season_name])),[seasons])
  const unread=rows.filter(r=>!r.is_read).length
  const currentPosition=standings.find(s=>s.player_id===player?.id)?.position

  async function login(e:FormEvent){e.preventDefault();if(!supabase)return;setLoading(true);setMessage('');const {data,error}=await supabase.auth.signInWithPassword({email,password});if(error)setMessage(error.message);else{setUser(data.user);await refreshPlayer(data.user);go('profile')}setLoading(false)}
  async function signup(e:FormEvent){e.preventDefault();if(!supabase)return;setLoading(true);setMessage('Creating your player and assigning your starting league…');const {data,error}=await supabase.auth.signUp({email,password,options:{data:{username,game_name:game,game_type:game,country}}});if(error){setMessage(error.message);setLoading(false);return}if(data.user){setUser(data.user);await refreshPlayer(data.user);setMessage(data.session?'Account ready — your starting league has been assigned automatically.':'Account created. Confirm your email, then sign in; your league placement is handled automatically.');if(data.session)go('profile')}setLoading(false)}
  async function logout(){if(supabase)await supabase.auth.signOut();setUser(null);setPlayer(null);setProfile(null);setMembership(null);setLeague(null);go('home')}
  async function saveProfile(e:FormEvent){e.preventDefault();if(!supabase||!user)return;setSaving(true);const {error}=await supabase.from('profiles').update({username,country,game_name:game,updated_at:new Date().toISOString()}).eq('user_id',user.id);if(error)setMessage(error.message);else{await refreshPlayer(user);setMessage('Profile saved.')};setSaving(false)}
  async function available(f:Row){if(!supabase)return;setLoading(true);const {data,error}=await supabase.rpc('mark_fixture_available',{p_fixture_id:f.id});setMessage(error?.message??(data?'Availability recorded. Your opponent has been notified.':'Fixture availability updated.'));setLoading(false);await loadSection()}
  async function submitResult(e:FormEvent){e.preventDefault();if(!supabase||!resultMatch)return;setLoading(true);const {error}=await supabase.rpc('submit_match_result',{p_match_id:resultMatch.match_id,p_home_score:Number(homeScore),p_away_score:Number(awayScore),p_evidence_url:evidence||null});if(error)setMessage(error.message);else{setMessage('Result submitted for verification.');setResultMatch(null);setHomeScore('');setAwayScore('');setEvidence('');await loadSection()}setLoading(false)}
  async function registerTournament(t:Row){if(!supabase||!player){setMessage('Sign in and finish player provisioning first.');return}setLoading(true);const {error}=await supabase.from('tournament_players').insert({tournament_id:t.id,player_id:player.id,registration_status:'registered'});if(error)setMessage(error.message);else{setMessage('Tournament registration submitted. XP will be awarded by the competition system.');await refreshPlayer(user)}setLoading(false)}
  async function markRead(id:string){if(!supabase||!user)return;const {error}=await supabase.from('notifications').update({is_read:true,read_at:new Date().toISOString()}).eq('id',id).eq('user_id',user.id);if(!error)setRows(r=>r.map(x=>x.id===id?{...x,is_read:true}:x))}

  if(!onlineReady)return <main className="offline"><div className="offline-card"><div className="badge">◈ GREYVERSE</div><h1>GreyVerse requires internet</h1><p>GreyVerse is an online-only gaming platform. Connect to the internet to reach the live GreyVerse servers.</p><button className="button" onClick={connectivity}>Try again</button></div></main>

  return <main className="shell">
    <nav className="nav"><strong>◈ GreyVerse</strong><span className="online-dot">● ONLINE</span><button className="button" onClick={()=>go('home')}>⌂ Home</button>{sections.map(([id,icon,name])=><button className="button" key={id} onClick={()=>go(id)}>{icon} {name}{id==='notifications'&&unread?` (${unread})`:''}</button>)}{user?<button className="button ghost" onClick={logout}>↪ Sign out</button>:<><button className="button" onClick={()=>go('login')}>→ Sign in</button><button className="button" onClick={()=>go('signup')}>✦ Create account</button></>}</nav>

    {section==='home'&&<><section className="hero"><p className="eyebrow">LIVE ESPORTS • REAL PLAYERS • REAL COMPETITION</p><h1>GreyVerse</h1><p className="muted">Your competitive gaming universe. Live leagues, real fixtures, tournaments, rankings, rewards and player progression — all backed by GreyVerse servers.</p><div className="hero-actions"><button className="button" onClick={()=>go(user?'profile':'signup')}>{user?'Open Player Hub →':'Create your player →'}</button><button className="button ghost" onClick={()=>go('league')}>View League Center</button></div></section><section className="dashboard-grid">{sections.map(([id,icon,name])=><button className="card feature" onClick={()=>go(id)} key={id}><div className="feature-icon">{icon}</div><div><h2>{name}</h2><p className="muted">Open live {name.toLowerCase()} data and actions.</p></div><span>→</span></button>)}</section></>}

    {section==='login'&&<section className="hero narrow"><p className="eyebrow">PLAYER ACCESS</p><h1>Sign in</h1><form className="card form" onSubmit={login}><input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/><button className="button" disabled={loading}>{loading?'Signing in…':'Sign in'}</button><p className="muted">{message}</p></form></section>}

    {section==='signup'&&<section className="hero narrow"><p className="eyebrow">JOIN GREYVERSE</p><h1>Create your player</h1><p className="muted">Choose your game. GreyVerse will create your account, player profile and automatically place you into a random available lower league.</p><form className="card form" onSubmit={signup}><input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required minLength={3}/><select value={game} onChange={e=>setGame(e.target.value)}>{games.length?games.map(g=><option key={g.id} value={g.game_name}>{g.game_name}</option>):<><option>eFootball</option><option>DLS</option></>}</select><input placeholder="Country" value={country} onChange={e=>setCountry(e.target.value)} required/><input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Password (6+ characters)" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required/><button className="button" disabled={loading}>{loading?'Creating player…':'Create account'}</button><p className="muted">{message}</p></form></section>}

    {section==='profile'&&<section className="hero"><p className="eyebrow">PLAYER HUB</p><div className="profile-head"><div><h1>{profile?.username??player?.username??'Player'}</h1><p className="muted">{profile?.country??country} • {profile?.game_name??player?.game_type??'Game'} • {user?.email}</p></div><div className="status-pill">● ONLINE</div></div>{!user?<article className="card"><p className="muted">Sign in to access your player hub.</p><button className="button" onClick={()=>go('login')}>Sign in</button></article>:<div className="dashboard-grid"><article className="card stat-card"><span className="muted">GREYVERSE ID</span><strong>{profile?.greyverse_id??player?.greyverse_id??'Pending'}</strong><span className="muted">Player ID {player?.id??'Provisioning…'}</span></article><article className="card stat-card"><span className="muted">CURRENT LEAGUE</span><strong>{league?.display_name??league?.league_name??'Placement pending'}</strong><span className="muted">Position {currentPosition??'—'} / 30</span></article><article className="card stat-card"><span className="muted">LEVEL</span><strong>{level?.level??1}</strong><span className="muted">{level?.current_xp??0} / {level?.next_level_xp??100} XP</span></article><article className="card stat-card"><span className="muted">WALLET</span><strong>{wallet?.coins??0} coins</strong><span className="muted">Live GreyVerse balance</span></article><form className="card form" onSubmit={saveProfile}><h2>Edit profile</h2><input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" required/><input value={country} onChange={e=>setCountry(e.target.value)} placeholder="Country" required/><select value={game} onChange={e=>setGame(e.target.value)}>{games.map(g=><option key={g.id} value={g.game_name}>{g.game_name}</option>)}</select><button className="button" disabled={saving}>{saving?'Saving…':'Save profile'}</button><p className="muted">{message}</p></form></div>}</section>}

    {section==='league'&&<section className="hero"><p className="eyebrow">LEAGUE CENTER • 30 PLAYERS</p><h1>{league?.display_name??league?.league_name??'Your League'}</h1>{!user||!membership?<article className="card"><h2>Automatic placement</h2><p className="muted">New players are randomly placed into an available lower league after registration. There is no manual starting-league selection.</p><button className="button" onClick={()=>go(user?'profile':'signup')}>{user?'Open Player Hub':'Create player'}</button></article>:<><div className="league-meta"><span>{league?.tier??'League'} • Division {league?.division_number??'—'}</span><span>Season {seasonNames.get(membership.season_id)??membership.season_id}</span><span>{league?.current_players??standings.length}/30 players</span></div><div className="table-wrap"><table><thead><tr><th>#</th><th>Player</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>PTS</th></tr></thead><tbody>{standings.map((s,i)=><tr className={`${s.player_id===player?.id?'me ':''}${s.position<=5?'promotion ':''}${s.position>=26?'relegation ':''}`} key={s.id??s.player_id}><td>{s.position??i+1}</td><td>{playerNames.get(s.player_id)??(s.player_id===player?.id?'You':'Player')}</td><td>{s.played??0}</td><td>{s.wins??0}</td><td>{s.draws??0}</td><td>{s.losses??0}</td><td>{s.goals_for??0}</td><td>{s.goals_against??0}</td><td>{s.goal_difference??0}</td><td><strong>{s.points??0}</strong></td></tr>)}{standings.length===0&&<tr><td colSpan={10}>No live standings yet.</td></tr>}</tbody></table></div><div className="rules"><article className="card"><span className="rule-tag promote">PROMOTION</span><h2>Top 5</h2><p className="muted">Positions 1–5 earn automatic promotion at the end of the league season.</p></article><article className="card"><span className="rule-tag playoff">RELEGATION PLAYOFF</span><h2>26th–30th</h2><p className="muted">30th vs 10th below • 29th vs 9th • 28th vs 8th • 27th vs 7th • 26th vs 6th.</p><p className="muted"><strong>The upper-league player must win to stay.</strong> A draw or loss relegates the upper player and promotes the lower player.</p></article></div></>}</section>}

    {section==='fixtures'&&<section className="hero"><p className="eyebrow">MATCH CENTER</p><h1>Fixtures</h1>{loading?<p className="muted">Loading live fixtures…</p>:message&&<p className="muted">{message}</p>}<div className="grid-list">{rows.map((f,i)=><article className="card match-card" key={f.id??i}><div className="match-top"><span className="status-pill">{f.status??'scheduled'}</span><span className="muted">Matchday {f.matchday??f.round??'—'}</span></div><h2>{playerNames.get(f.home_player_id)??'Home'} <span className="score">{f.status==='completed'&&f.match_result_id?'':'vs'}</span> {playerNames.get(f.away_player_id)??'Away'}</h2><p className="muted">{f.scheduled_date??''}{f.scheduled_time?` • ${f.scheduled_time}`:''} • Deadline {f.deadline_at?new Date(f.deadline_at).toLocaleString(): '—'}</p>{user&&player&&(f.home_player_id===player.id||f.away_player_id===player.id)&&f.status==='scheduled'&&<button className="button" onClick={()=>available(f)} disabled={loading}>I’m available</button>}{user&&player&&f.match_id&&f.status!=='completed'&&(f.home_player_id===player.id||f.away_player_id===player.id)&&<button className="button ghost" onClick={()=>setResultMatch(f)}>Submit result</button>}</article>)}</div>{rows.length===0&&!loading&&<article className="card"><h2>No fixtures yet</h2><p className="muted">Your league schedule will appear here when fixtures are generated.</p></article>}</section>}

    {section==='tournaments'&&<section className="hero"><p className="eyebrow">COMPETITION HUB</p><h1>Tournaments</h1><p className="muted">Live competitions from the GreyVerse database. Tournament configuration controls qualification, format and mandatory rest days.</p><div className="grid-list">{rows.map((t,i)=><article className="card" key={t.id??i}><div className="match-top"><span className="status-pill">{t.status}</span><span className="muted">{t.tournament_type}</span></div><h2>{t.tournament_name}</h2><p className="muted">Up to {t.max_players} players • Entry {t.entry_cost??0} • {t.rest_day_required?'Full rest day required':'Standard schedule'}</p>{user&&player&&<button className="button" onClick={()=>registerTournament(t)} disabled={loading||registrations.some(r=>r.tournament_id===t.id)}> {registrations.some(r=>r.tournament_id===t.id)?'Registered':'Register'} </button>}</article>)}</div></section>}

    {section==='rankings'&&<section className="hero"><p className="eyebrow">GLOBAL COMPETITION</p><h1>Rankings</h1><div className="table-wrap"><table><thead><tr><th>#</th><th>Player</th><th>Points</th><th>Matches</th><th>Wins</th><th>Rating</th><th>Game</th></tr></thead><tbody>{rows.map((r,i)=><tr className={r.player_id===player?.id?'me':''} key={r.id??i}><td>{r.global_rank||r.rank_position||i+1}</td><td>{playerNames.get(r.player_id)??'Player'}</td><td>{r.total_points??0}</td><td>{r.matches_played??0}</td><td>{r.wins??0}</td><td>{r.rating??'—'}</td><td>{gameNames.get(r.game_id)??'—'}</td></tr>)}</tbody></table></div></section>}

    {section==='notifications'&&<section className="hero"><p className="eyebrow">LIVE UPDATES</p><h1>Notifications</h1><div className="grid-list">{rows.map((n,i)=><article className={`card ${n.is_read?'':'unread'}`} key={n.id??i}><div className="match-top"><span className="status-pill">{n.notification_type}</span><span className="muted">{n.created_at?new Date(n.created_at).toLocaleString():''}</span></div><h2>{n.title}</h2><p className="muted">{n.message??n.body}</p>{user&&!n.is_read&&<button className="button" onClick={()=>markRead(n.id)}>Mark read</button>}</article>)}{rows.length===0&&<article className="card"><p className="muted">No notifications yet.</p></article>}</div></section>}

    {resultMatch&&<div className="modal-backdrop"><form className="card modal form" onSubmit={submitResult}><h2>Submit match result</h2><p className="muted">Enter the final score exactly as played. Your opponent must report the same score for automatic verification.</p><input type="number" min="0" placeholder="Home score" value={homeScore} onChange={e=>setHomeScore(e.target.value)} required/><input type="number" min="0" placeholder="Away score" value={awayScore} onChange={e=>setAwayScore(e.target.value)} required/><input placeholder="Evidence URL (optional)" value={evidence} onChange={e=>setEvidence(e.target.value)}/><div className="hero-actions"><button className="button" disabled={loading}>{loading?'Submitting…':'Submit result'}</button><button type="button" className="button ghost" onClick={()=>setResultMatch(null)}>Cancel</button></div></form></div>}
  </main>
}
