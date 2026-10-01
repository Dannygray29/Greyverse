# GreyVerse — Buyer Demo & Feature Walkthrough

## 60-second buyer view

GreyVerse is a football gaming competition-management platform built around external DLS and eFootball matches. It provides the infrastructure around those matches: player accounts, game-specific competition contexts, leagues, fixtures, standings, rankings, tournaments, verification/evidence, disputes, rewards, notifications and seasonal movement.

**Current stage:** active-development software asset / MVP. Core architecture is implemented; documented end-to-end release gates remain.

## What a buyer is acquiring

### Product layer
- Player registration and profiles
- Separate DLS and eFootball competition contexts
- League, fixture and standings experiences
- Rankings and player progression
- Tournament experiences
- Notifications and competition operations
- Match readiness, result, evidence and dispute workflows
- Rewards, wallets and transaction records
- Reports and suspension records

### Competition engine
- England, Spain, Italy and Germany competition systems
- Three tiers per game system
- Tier 1 capacity: 20 players
- Tier 2 and Tier 3 capacity: 30 players
- First-leg / second-leg fixture structure
- Promotion and relegation rules
- Relegation playoff architecture
- Grey Champions League qualification structure
- Best Galactico knockout competition

### Technical foundation
- Next.js 16 / React 19 / TypeScript
- Supabase Auth + PostgreSQL
- Row-Level Security
- Controlled PostgreSQL RPCs
- Supabase Realtime and Storage architecture
- Capacitor 7 Android project
- Cloudflare Pages deployment workflow
- GitHub Actions CI/CD
- Static Next.js export architecture

## Buyer walkthrough

### 1. Landing / entry
The application presents GreyVerse as a football competition platform and provides entry into authentication and the competition areas.

### 2. Account and profile
A user can register/login and maintain a player profile. Game-specific records are separated so competition data can be scoped to the selected game context.

### 3. League
The league area exposes the competition structure, standings and player placement model.

### 4. Fixtures
Fixtures are generated/managed around external DLS or eFootball gameplay. The platform manages availability and result workflows rather than replacing the underlying football game.

### 5. Rankings
Competition performance is surfaced through rankings and standings, with player progression data available to the platform.

### 6. Tournaments
Grey Champions League and Best Galactico provide separate tournament competition flows.

### 7. Match verification
The data model includes match readiness, results, evidence and dispute handling so competition operators can establish a structured record around reported matches.

### 8. Operations
Notifications, reports, suspensions, activity logs, rewards, wallets and transactions provide an operational foundation for running a recurring competition.

## Architecture at a glance

```text
Next.js / React / TypeScript
          |
          v
Supabase Auth
          |
          +--> PostgreSQL + RLS
          |       |
          |       +--> competition data
          |       +--> standings/rankings
          |       +--> match workflows
          |       +--> rewards/transactions
          |
          +--> RPCs / Realtime / Storage
          |
          v
External DLS / eFootball gameplay

Web: Cloudflare Pages
Android: Capacitor
CI/CD: GitHub Actions
```

## Implemented vs. validation

### Implemented architecture
The repository contains the application routes, competition data model, migrations, security model, match workflows, tournament structures, progression records and deployment configuration.

### Release validation still required
- authenticated match-ready expiry
- result agreement and dispute resolution
- DLS/eFootball isolation using representative accounts
- seasonal transition processing
- lowest-tier playoff opponent sourcing
- authoritative handling of any remaining critical mutations
- fully private evidence upload/storage flow where required

## Important buyer note

GreyVerse is being sold as a software asset and codebase, **not as a claim of an already profitable or fully production-validated esports business**. The repository documents known limitations so a buyer can perform technical due diligence before purchase.

## Suggested demo order

1. Open the app
2. Register or sign in
3. Open Profile
4. Open League
5. Open Fixtures
6. Open Rankings
7. Open Tournaments
8. Open Notifications
9. Review repository architecture and Supabase migrations
10. Review SALE.md and BUYER_LISTING.md
11. Run the documented release-gate tests

## Related buyer documents

- SALE.md
- BUYER_LISTING.md
- AUDIT.md
- SUPABASE_AUDIT.md