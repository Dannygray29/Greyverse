import { getTournaments } from '@/lib/data'

export default async function Tournaments() {
  const tournaments = await getTournaments()
  return <main className="shell"><nav className="nav"><a href="/">← GreyVerse</a><strong>Tournaments</strong></nav><section className="hero"><p className="muted">COMPETITIVE PLAY</p><h1>Tournaments</h1><p className="muted">Live competitions from the GreyVerse database.</p></section><div className="grid">{tournaments.map((t:any)=><article className="card" key={t.id}><h2>{t.tournament_name ?? 'GreyVerse Tournament'}</h2><p className="muted">{t.tournament_type ?? 'Tournament'} · {t.status ?? 'open'}</p><p className="muted">Players: {t.max_players ?? '—'}</p></article>)}{!tournaments.length&&<article className="card"><h2>No tournaments found</h2><p className="muted">No tournaments were returned by the database.</p></article>}</div></main>
