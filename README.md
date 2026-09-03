# GreyVerse

**Online competition-management platform for DLS and eFootball players.**

GreyVerse is a gaming platform designed to manage player accounts, game-specific competition records, leagues, tournaments, fixtures, results, rankings, rewards, evidence, and seasonal movement. External DLS and eFootball matches provide the gameplay; GreyVerse manages the competition layer around them.

> **Project status:** Active development / conditionally ready. The core build and security checks are in place, while several authenticated behavioral workflows still require end-to-end verification before the platform should be described as fully competition-production-ready.

[![Cloudflare Pages](https://github.com/Dannygray29/Greyverse/actions/workflows/cloudflare-pages.yml/badge.svg)](https://github.com/Dannygray29/Greyverse/actions/workflows/cloudflare-pages.yml)

## What GreyVerse does

| Area | Current capability |
| --- | --- |
| 🎮 Games | Separate DLS and eFootball player contexts under one account |
| 🏆 Leagues | Four league systems with three tiers per game |
| ⚔️ Tournaments | Grey Champions League and Best Galactico competition flows |
| 📅 Matches | Server-backed availability, fixtures and result workflows |
| 📊 Competition | Standings, rankings, promotion and relegation logic |
| 🛡️ Security | Supabase Auth, RLS and controlled PostgreSQL RPCs |
| 🧾 Evidence | Match-result evidence workflow with private-storage architecture |
| 🎁 Progression | Player levels, wallets, rewards and transaction records |

## Competition model

GreyVerse currently supports **England, Spain, Italy and Germany**, with three tiers in each system. Tier 1 has a capacity of 20 players; Tiers 2 and 3 have capacities of 30. New players are intended to enter the lowest tier through the competition-placement flow.

League fixtures use external DLS/eFootball gameplay and support first-leg and second-leg formats. Match availability and result workflows are backed by Supabase. Promotion/relegation and playoff rules are designed to be controlled by database-side competition logic rather than trusted browser state.

The **Grey Champions League** is a separate competition beginning from Season 3 for the top five players in each Tier 1 league. **Best Galactico** is an open single-knockout competition for eligible users.

## Architecture

```text
┌──────────────────────────────┐
│ Next.js 16 + React 19        │
│ Static web client             │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Supabase                     │
│ Auth • PostgreSQL • RLS      │
│ RPCs • Realtime • Storage    │
└──────────────┬───────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
 Competition data    Evidence/storage
       │
       ▼
DLS / eFootball external matches

Android delivery: Capacitor 7
Web deployment: Cloudflare Pages
Automation: GitHub Actions
```

The web application is a static Next.js export (`output: 'export'`). This means there is no private Next.js server runtime in this repository. Authoritative workflows therefore belong in Supabase RLS, PostgreSQL RPCs and/or Edge Functions unless the deployment architecture is changed.

## Technology exposure

- Next.js 16 / React 19
- Supabase Auth and PostgreSQL
- Row-Level Security (RLS)
- PostgreSQL RPC functions
- Supabase Storage and Realtime
- Capacitor 7 for Android
- Cloudflare Pages
- GitHub Actions
- TypeScript

## Local development

```bash
npm ci
npm run dev
```

For a build check:

```bash
npm ci
npm run build
```

The production build should create a non-empty `out/index.html`.

Create environment configuration from `.env.example` and provide the public Supabase URL and publishable/anon key for the target project. **Never commit service-role keys, API secrets, private credentials, or user session data.**

## CI / deployment

The Cloudflare Pages workflow runs on pushes to `main` and can also be started manually. It installs dependencies, builds the static export, verifies `out/index.html`, stores the export as an artifact, and deploys it to Cloudflare Pages when the required Cloudflare secrets are configured.

A separate Android workflow builds the Capacitor Android project and produces a debug APK artifact.

## Security model

GreyVerse is designed around the principle that the browser is **not** the authority for competition-critical state. Supabase RLS and controlled database functions are intended to enforce access and mutation boundaries for player records, matches, results, standings, tournaments, rewards and other sensitive competition data.

The live Supabase audit recorded no security-advisor lints at the time of the latest documented inspection, and inspected public tables had RLS enabled. See [`SUPABASE_AUDIT.md`](./SUPABASE_AUDIT.md) for the recorded audit evidence.

## Known limitations / release gates

The project should not yet be marketed as a fully production-ready competitive platform. The documented remaining verification areas include:

- authenticated match-ready expiry behavior
- result agreement and dispute-resolution paths
- cross-game DLS/eFootball isolation tests
- scheduled seasonal processing and transition tests
- operational population of the lowest-tier external playoff opponent roster
- moving any remaining critical browser-side mutations behind authoritative database/server workflows where required
- replacing URL-only result evidence with a fully private Storage upload flow where appropriate

These limitations are intentional documentation of the current state, not hidden behind the project description. See [`AUDIT.md`](./AUDIT.md) for the detailed repository audit.

## Documentation

- [`AUDIT.md`](./AUDIT.md) — repository architecture, findings and release gates
- [`SUPABASE_AUDIT.md`](./SUPABASE_AUDIT.md) — database/security audit notes

## Attribution and project context

GreyVerse is maintained as an independent project under the `Dannygray29/Greyverse` repository. The repository documents implementation status and limitations rather than presenting unverified features as completed production functionality.

## Project principle

**Build practically. Verify honestly. Keep competition rules server-authoritative.**
