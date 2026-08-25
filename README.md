# GreyVerse

GreyVerse is a server-authoritative competition-management platform for external **DLS** and **eFootball** matches. The web client is a static Next.js export, while Supabase provides authentication, row-level security, PostgreSQL RPCs, realtime data, evidence workflows, standings, seasonal movement, and competition records.

## Platform rules implemented in the live system

GreyVerse supports four European league systems—England, Spain, Italy, and Germany—with three tiers per system. New players are assigned randomly to a Lowest Tier league. Tier capacities are 20 players in Tier 1, 30 in Tier 2, and 30 in the Lowest Tier. Fixtures are generated server-side, use external DLS/eFootball gameplay, and support first-leg and second-leg league formats. Match availability and result submission are handled through Supabase RPCs, with the 12-hour deadline rule awarding one point to the first player who marked availability and zero to the unavailable player, or zero points to both when neither player was available.

The Grey Champions League begins from Season 3 for the top five players in each Tier 1 league. The Best Galactico tournament is a separate open single-knockout competition for eligible users. Promotion and relegation decisions are server-controlled. For Tier 2 versus Lowest Tier playoffs, the lower-tier challengers are positions 21–25; the upper-tier player must win to retain the position, while a draw promotes the lower-tier player.

A single account can hold separate DLS and eFootball player records. The profile switcher changes game context without logout, and game-specific RLS policies are the authoritative isolation boundary. Country selection is mandatory during signup for future intercontinental tournaments.

## Stack

- Next.js 16 with React 19 and static export.
- Supabase Auth, PostgreSQL 17, RLS, RPCs, Storage, and Realtime.
- Capacitor 7 Android wrapper.
- Cloudflare Pages deployment through GitHub Actions.

## Local development

```bash
npm ci
npm run dev
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` when using a different Supabase project. The repository includes `.env.example`; never commit service-role keys or private credentials.

## Verification

```bash
npm ci
npm run build
```

The build must produce a non-empty `out/index.html`. The Android workflow additionally creates and syncs the Capacitor Android project, builds a debug APK, verifies the APK artifact, and uploads it to GitHub Actions.

## Deployment

The Cloudflare workflow builds and uploads the static export on every push to `main`. It deploys automatically when `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets are configured. If those secrets are absent, the workflow still verifies and uploads the static export rather than failing the build pipeline. The Supabase public URL and publishable/anon key should be configured as repository secrets for production builds.

## Readiness

The repository build and live Supabase security-advisor checks pass. The remaining release gate is behavioral verification with real authenticated accounts: match-ready expiry, result agreement, dispute resolution, cross-game isolation, scheduled seasonal processing, and population of the Lowest Tier external playoff opponent roster. See [`AUDIT.md`](./AUDIT.md) and [`SUPABASE_AUDIT.md`](./SUPABASE_AUDIT.md) for the detailed status.
