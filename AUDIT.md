# GreyVerse Repository Audit

## Scope

This audit reviews the current `greyverse` repository against the agreed GreyVerse product rules: external DLS and eFootball gameplay, game-specific competition data, shared account switching, mandatory country selection, server-controlled competition logic, and Supabase-backed persistence.

## Findings

| Area | Status | Finding |
|---|---|---|
| Supabase client | Present | `src/lib/supabase.ts` uses `@supabase/supabase-js` and environment-backed public credentials. |
| DLS/eFootball separation | Improved | The profile route now loads all player records for the authenticated account and switches the active DLS/eFootball record in-session; live Supabase RLS remains the authoritative isolation boundary. |
| Country signup | Fixed | Signup now uses a standardized country dropdown shared from `src/lib/countries.ts`. |
| Shared account switching | Fixed in UI | Profile now supports multiple game-specific player rows per account and switches between them without logout; a missing game row is surfaced instead of silently showing another game. |
| Server authority | Gap | The app is a static export and currently performs provisioning and mutations directly from the browser. Critical operations should move to Supabase RPC functions with RLS and transactional logic. |
| League placement | Gap | The UI communicates automatic placement, but server-side random system assignment is not implemented in this repository. |
| Promotion/playoffs | Implemented with follow-up | Live Supabase contains season processing and playoff RPCs. Migration `20260825192000_correct_greyverse_playoff_pairings.sql` corrected the lower-tier challenger positions and retained the draw-promotes-lower rule. Lowest-tier external opponent sourcing and full season-transition integration tests remain operational follow-ups. |
| Evidence | Partial | Result submission accepts an evidence URL; a private Supabase Storage upload flow is still recommended. |
| Production deployment | Present | Cloudflare Pages deploys the static `out/` artifact and Capacitor consumes the same export. |

## Edits made in this pass

The signup route now validates a required country selection from a shared country list and presents labeled controls. The profile route now provides a visible DLS/eFootball context switcher that persists the active game locally without logging the user out. The global stylesheet includes accessible styles for labels and the switcher. The shared country list is ready for future country-based tournament features.

## Supabase requirements before production

The Supabase project should enforce the following independently of the client UI:

1. Separate DLS and eFootball records using a required game identifier.
2. Row-level security for profiles, players, fixtures, results, standings, tournaments, notifications, evidence, and wallet records.
3. Server-side or database RPC functions for placement, readiness, result submission, standings, promotion, relegation, and rewards.
4. Idempotency and transaction boundaries for result submission, reward issuance, and seasonal transitions.
5. Private Storage buckets and signed URLs for screenshots and recordings.
6. Audit logs for administrative changes and seasonal movement.

## Architectural limitation

`next.config.ts` uses `output: 'export'`, so this repository has no Next.js server runtime or private server-side API. Supabase remains the database and authentication layer, but authoritative workflows must be implemented in Supabase Edge Functions, PostgreSQL RPC functions, and RLS policies, or the deployment architecture must change to a server-capable Next.js deployment.

## Verification

The production build completes successfully with `npm run build`. The live Supabase security advisor currently returns no lints, and all inspected public tables report RLS enabled. The platform remains conditionally ready rather than fully competition-production-ready until authenticated match, dispute, game-isolation, and season-transition tests are run with representative accounts and the lowest-tier playoff opponent roster is operationally supplied.
