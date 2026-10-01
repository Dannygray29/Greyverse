import Link from 'next/link'

const modules = [
  ['League engine', '30-player leagues, tiers, promotion, relegation and playoff architecture.'],
  ['Match center', 'Fixtures, availability, deadlines, result submission and verification flow.'],
  ['Tournament system', 'Registration, qualification paths, formats and scheduled rest-day rules.'],
  ['Rankings', 'Global player ranking surface with points, matches, wins and ratings.'],
  ['Player identity', 'Profiles, GreyVerse ID, country, game selection, progression and wallet.'],
  ['Live operations', 'Supabase-backed data, Realtime subscriptions, notifications and competition state.'],
]

const architecture = ['Next.js 16', 'React 19', 'TypeScript', 'Supabase', 'PostgreSQL + RLS', 'Capacitor Android', 'Cloudflare Pages']

export default function BuyerPage() {
  return (
    <main className="buyer">
      <nav className="buyerNav">
        <Link href="/">◈ GreyVerse</Link>
        <div>
          <a href="#platform">Platform</a>
          <a href="#engine">Engine</a>
          <a href="#technical">Technical</a>
          <a href="#handover">Handover</a>
        </div>
      </nav>

      <section className="buyerHero">
        <div className="eyebrow">SOFTWARE ASSET • FOOTBALL GAMING • ESPORTS</div>
        <h1>A working foundation for a competitive football gaming platform.</h1>
        <p>
          GreyVerse combines player identity, game-specific competition, leagues, fixtures,
          tournaments, rankings, match verification and progression in one Supabase-backed application.
        </p>
        <div className="heroButtons">
          <a className="primary" href="#platform">Explore the asset →</a>
          <a className="secondary" href="https://github.com/Dannygray29/Greyverse" target="_blank" rel="noreferrer">Open repository</a>
        </div>
        <div className="price">
          <span>ASKING</span>
          <strong>$4,900 OBO</strong>
          <small>Early-stage software asset / MVP • active development</small>
        </div>
      </section>

      <section id="platform" className="section">
        <div className="sectionHead">
          <span>01</span>
          <div><div className="eyebrow">WHAT THE BUYER GETS</div><h2>The competition product is already structured.</h2></div>
        </div>
        <div className="moduleGrid">
          {modules.map(([title, text]) => (
            <article className="module" key={title}>
              <div className="moduleIcon">◆</div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="engine" className="section dark">
        <div className="sectionHead">
          <span>02</span>
          <div><div className="eyebrow">COMPETITION ENGINE</div><h2>Designed around recurring competitive seasons.</h2></div>
        </div>
        <div className="flow">
          {['Choose game', 'Create player', 'League placement', 'Fixtures', 'Report result', 'Verify', 'Rank / reward', 'Season transition'].map((item, i) => (
            <div className="flowItem" key={item}><b>{String(i + 1).padStart(2, '0')}</b><span>{item}</span></div>
          ))}
        </div>
        <div className="callout">
          <strong>Game isolation is intentional.</strong>
          <p>Players operate inside their selected game context rather than being shown unrelated game competitions. The community layer can remain cross-game.</p>
        </div>
      </section>

      <section id="technical" className="section">
        <div className="sectionHead">
          <span>03</span>
          <div><div className="eyebrow">TECHNICAL FOUNDATION</div><h2>Built on a conventional, transferable web stack.</h2></div>
        </div>
        <div className="techGrid">
          {architecture.map((item) => <div className="tech" key={item}><span>✓</span>{item}</div>)}
        </div>
        <div className="twoCol">
          <article>
            <div className="eyebrow">IMPLEMENTED</div>
            <ul>
              <li>Authentication and player profile flow</li>
              <li>Game-aware league, fixture and tournament surfaces</li>
              <li>Standings, rankings, notifications and progression surfaces</li>
              <li>Supabase schema, RLS and database-backed workflows</li>
              <li>Capacitor Android configuration and deployment configuration</li>
            </ul>
          </article>
          <article>
            <div className="eyebrow">VALIDATION REMAINS</div>
            <ul>
              <li>Authenticated match-ready expiry testing</li>
              <li>Full result agreement and dispute-path testing</li>
              <li>Season-transition and lowest-tier playoff validation</li>
              <li>Moving remaining critical browser mutations behind authoritative workflows</li>
              <li>Private evidence-upload hardening where required</li>
            </ul>
          </article>
        </div>
      </section>

      <section id="handover" className="section dark">
        <div className="sectionHead">
          <span>04</span>
          <div><div className="eyebrow">TRANSACTION / HANDOVER</div><h2>Clear scope. No hidden credentials.</h2></div>
        </div>
        <div className="handover">
          <div><strong>Included</strong><p>Source code, database architecture/migrations, application configuration, product/IP assets created for GreyVerse, documentation and Git history.</p></div>
          <div><strong>Excluded</strong><p>Third-party accounts, subscriptions, personal identities, credentials, secrets, unrelated Greyvona projects and third-party IP.</p></div>
          <div><strong>Handover principle</strong><p>Ownership, repository control and production assets transfer only under the agreed transaction and payment conditions.</p></div>
        </div>
        <div className="finalCta">
          <div><span className="eyebrow">GREYVERSE</span><h2>Take the foundation. Build the next season.</h2></div>
          <a className="primary" href="https://github.com/Dannygray29/Greyverse" target="_blank" rel="noreferrer">Inspect the repository →</a>
        </div>
      </section>

      <footer>GreyVerse • Early-stage software asset / MVP • This page describes the current repository scope and does not represent the product as a mature revenue-generating business.</footer>

      <style jsx>{`
        .buyer{min-height:100vh;background:#070812;color:#f7f7fb;font-family:Arial,Helvetica,sans-serif}
        .buyerNav{position:sticky;top:0;z-index:10;display:flex;justify-content:space-between;align-items:center;padding:18px 6vw;background:rgba(7,8,18,.9);backdrop-filter:blur(16px);border-bottom:1px solid #202238}
        .buyerNav a{color:#fff;text-decoration:none;margin-left:22px}.buyerNav>a{font-weight:800;font-size:18px;margin:0}
        .buyerHero{padding:100px 8vw 85px;max-width:1100px;margin:auto}.eyebrow{font-size:11px;letter-spacing:.18em;font-weight:800;color:#9ea5ff}
        .buyerHero h1{font-size:clamp(42px,7vw,82px);line-height:.98;max-width:900px;margin:18px 0 25px;letter-spacing:-.055em}
        .buyerHero>p{font-size:19px;line-height:1.7;color:#b9bdd0;max-width:760px}
        .heroButtons{display:flex;gap:12px;flex-wrap:wrap;margin:30px 0}.primary,.secondary{display:inline-block;padding:14px 20px;border-radius:12px;text-decoration:none;font-weight:800}.primary{background:#fff;color:#080914}.secondary{border:1px solid #373a55;color:#fff}
        .price{display:flex;align-items:center;gap:18px;margin-top:45px}.price span{font-size:10px;letter-spacing:.15em;color:#858ba4}.price strong{font-size:27px}.price small{color:#858ba4}
        .section{padding:85px 8vw;max-width:1250px;margin:auto}.section.dark{max-width:none;background:#0b0d19}.sectionHead{display:flex;gap:25px;margin-bottom:42px}.sectionHead>span{font-size:12px;color:#777d98;padding-top:6px}.sectionHead h2{font-size:clamp(30px,4vw,50px);max-width:760px;margin:8px 0;letter-spacing:-.035em}
        .moduleGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.module,.tech,.handover>div,.twoCol article{border:1px solid #242741;background:#0d0f1d;border-radius:18px;padding:25px}.moduleIcon{font-size:11px;color:#a5aaff}.module h3{margin:15px 0 8px}.module p,.handover p,.twoCol li{color:#969caf;line-height:1.65}
        .flow{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;max-width:1100px}.flowItem{padding:20px;border:1px solid #282b43;border-radius:14px;background:#0f1120}.flowItem b{display:block;color:#737995;font-size:11px;margin-bottom:12px}.callout{margin-top:28px;border-left:3px solid #8d91ff;background:#101222;padding:24px;max-width:900px}.callout p{color:#aeb2c4;line-height:1.6}
        .techGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.tech{font-weight:700}.tech span{margin-right:10px;color:#9da2ff}.twoCol{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px}.twoCol ul{padding-left:20px}
        .handover{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.handover>div{background:#101222}.handover strong{font-size:18px}.finalCta{display:flex;justify-content:space-between;align-items:center;gap:25px;margin-top:55px;padding-top:45px;border-top:1px solid #282b43}.finalCta h2{font-size:35px;margin:8px 0}
        footer{padding:35px 8vw;color:#686e87;border-top:1px solid #202238;font-size:12px;line-height:1.6}
        @media(max-width:800px){.buyerNav div{display:none}.buyerHero{padding-top:65px}.moduleGrid,.techGrid,.flow,.twoCol,.handover{grid-template-columns:1fr}.price{align-items:flex-start;flex-direction:column;gap:5px}.finalCta{display:block}.finalCta .primary{margin-top:18px}}
      `}
      </style>
    </main>
  )
}
