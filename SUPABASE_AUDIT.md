# Supabase Audit Notes

Project: Greyverse (`kxgwxiukbcqzhhcvbdya`), region `eu-west-1`, status `ACTIVE_HEALTHY`.

## Schema snapshot

The public schema contains game, profile, player, league, league_members, matches, fixtures, tournaments, tournament_players, tournament_matches, rankings, league_standings, match_ready, match_results, match_evidence, match_disputes, promotion_history, relegation_playoffs, player_levels, player_wallets, transactions, rewards, notifications, reports, player_suspensions, activity_logs, and related tables. The inspected tables all reported RLS enabled. The project had two profiles, two players, two games, 36 leagues, two seasons, two rankings, two wallets, and no rows in most live competition/event tables at inspection time.

## Migration snapshot

The project has extensive migration history through 2026-08-22, including league engine foundations, promotion/relegation automation, match verification, round-robin generation, game isolation, private evidence storage RLS, signup triggers, security hardening, realtime feeds, and performance cleanup.

## Security advisories

The live Supabase security advisor currently returns no lints. The three privileged competition RPC warnings were remediated by migration `revoke_authenticated_privileged_competition_rpcs`: authenticated users no longer have `EXECUTE` permission on `create_relegation_playoff(...)`, `prepare_fixture_match(...)`, or `resolve_relegation_playoff(...)`; trusted `service_role` execution remains available for controlled jobs. Leaked-password protection was also enabled by the live migration history, while the signup page retains a 12-character local policy as an additional free-plan safeguard.

## Performance advisories

Performance advisors reported several RLS policies on `public.enquiries` that should wrap `auth` calls in `select`, plus unused indexes across activity logs, admin roles, suspensions, transactions, leaderboard history, leagues, daily rewards, standings, rankings, reports, and fixtures. These are lower priority than the security warnings and should be reviewed against real query usage before removal.

## Source URLs

Security function advisory: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable
Password protection: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
RLS initialization plan: https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan
Unused index advisory: https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index

## Free-plan password workaround

The signup page now enforces a local password policy requiring at least 12 characters, uppercase and lowercase letters, a number, a symbol, and no username/email fragment or listed common password. This improves password hygiene on the free plan and complements Supabase's HaveIBeenPwned-based leaked-password protection, which is enabled in the live migration history.

## RLS advisor follow-up

A fresh inspection of the live project on 25 August 2026 reports no security lints. All inspected public tables report RLS enabled. The remaining operational verification is behavioral: authenticated tests must prove that DLS and eFootball records cannot cross-read or cross-mutate, and that match, evidence, dispute, wallet, and seasonal RPC paths reject unauthorized access. No destructive policy rewrite was applied without a reproducible regression test.

## Playoff correction applied

Migration `correct_greyverse_playoff_pairings` was applied to production. Tier 2 versus Lowest Tier pairings now use Lowest Tier positions 21–25, while other adjacent-tier pairings use positions 6–10. The upper-tier player must win to retain the place; a draw promotes the lower-tier challenger. The lowest-tier external opponent source is still an operational dependency because the current schema does not contain an active waiting-list roster.

## League catalog alignment applied

Migration `align_greyverse_league_systems` was applied to production. Active leagues are now limited to England, Spain, Italy, and Germany for both DLS and eFootball. Each game/system has one active league at each of the three tiers, with capacities of 20 for Tier 1 and 30 for Tiers 2 and 3. Unsupported historical systems were archived rather than deleted.
