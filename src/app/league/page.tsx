import { getLeagues } from '@/lib/data'

export default async function League() {
  const leagues = await getLeagues()

  return (
    <main className="shell">
      <nav className="nav"><a href="/">← GreyVerse</a><strong>🏆 League</strong></nav>
      <section className="hero">
        <p className="muted">🏆 COMPETITIVE LEAGUES</p>
        <h1>League Center</h1>
        <p className="muted">Choose a GreyVerse league and compete for promotion.</p>
      </section>
      <div className="grid">
        {leagues.map((league: any) => (
          <article className="card" key={league.id}>
            <div className="badge">🏆 League</div>
            <h2>{league.league_name ?? league.display_name ?? 'GreyVerse League'}</h2>
            <p className="muted">{league.current_players ?? 0}/{league.max_players ?? 30} players</p>
            <p className="muted">Promotion: top {league.promotion_slots ?? 5}</p>
            <a className="button" href={'/league/' + league.id}>View league →</a>
          </article>
        ))}
        {!leagues.length && (
          <article className="card"><h2>No leagues found</h2><p className="muted">No leagues were returned by the database.</p></article>
        )}
      </div>
    </main>
  )
}
