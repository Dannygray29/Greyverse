# GreyVerse — Marketplace Submission Setup

## Current sale position

- Asking price: **$4,900 USD OBO**
- Internal minimum: **$1,000 USD**
- Revenue: **$0**
- Users: **No established user base**
- Stage: **Early-stage software asset / MVP**
- Category: **SaaS / Gaming / Esports / Web application**

## Public repository

https://github.com/Dannygray29/Greyverse

## Existing working demo

A previously deployed GreyVerse production build is available at:

https://greyverse-73a00t6a8-greyverse.vercel.app/

**Important:** this is a previously deployed build and does not include the newest buyer-only `/buyer` presentation route. Do not describe it as the latest build. The current `main` branch has the buyer presentation, but the latest Vercel production deployment currently fails its build step because the deployment environment is missing required Supabase configuration.

## SideProjectors submission fields

### Title
GreyVerse — Football Gaming & Esports Competition Platform

### Tagline
Football gaming competition platform with leagues, fixtures, rankings, tournaments and a Supabase/PostgreSQL backend.

### Category
SaaS / Web Application / Gaming / Esports

### Price
$4,900 OBO

### Revenue
$0

### Status
Pre-revenue / active development

### Technology
Next.js 16, React 19, TypeScript, Supabase, PostgreSQL, RLS, Capacitor, GitHub Actions, Cloudflare Pages

### Reason for selling
Making the existing software foundation available to another founder, developer, gaming community or esports operator who wants to continue development rather than start from zero.

### Short description
GreyVerse is an early-stage football gaming competition platform for organizing player identity, game-specific competition, leagues, fixtures, rankings, tournaments, match verification and progression around external DLS and eFootball matches.

### Long description
Use `BUYER_LISTING.md` as the base. Emphasize that the acquisition is a software/IP asset rather than a revenue-generating business. Include the documented remaining validation work and link to the repository for due diligence.

## Indiemaker submission fields

### Title
GreyVerse — Football Gaming Competition Platform

### Headline
Next.js + Supabase football gaming competition platform with leagues, tournaments and match operations.

### Asking price
$4,900 USD OBO

### Revenue
$0

### Users
No established users yet

### Product stage
Early-stage software asset / MVP

### Product URL
Use a currently functioning public deployment only after verifying that it represents the build being submitted. The previously deployed URL is recorded above; the current `main` buyer build still needs a successful deployment before it should be presented as the latest live product.

### Description
Use the text in `BUYER_LISTING.md` and `BUYER_DEMO.md`.

### Why it has value
GreyVerse combines an implemented web application with a substantial Supabase/PostgreSQL data model, RLS/security work, game-specific competition architecture, league/fixture/tournament structures and match-operation workflows. The buyer receives an existing technical foundation and product/IP direction rather than an idea or mockup.

### What remains
Use the release-gate list in `AUDIT.md` and `BUYER_DUE_DILIGENCE.md`. Do not describe the platform as fully production-validated.

## Screenshot checklist

Use only genuine screenshots of the actual GreyVerse application. Recommended order:

1. Main GreyVerse screen
2. League screen
3. Fixtures screen
4. Rankings screen
5. Tournament screen
6. Player profile screen
7. Authentication screen
8. Buyer presentation screen after the latest deployment is verified

Do not use AI-generated player images, fake dashboards, mockup screenshots or screenshots that imply functionality not present in the repository.

## Buyer handover package

The repository already contains:

- `SALE.md`
- `BUYER_LISTING.md`
- `BUYER_DEMO.md`
- `BUYER_DUE_DILIGENCE.md`
- `BUYER_OUTREACH.md`
- `BUYER_OUTREACH_READY.md`
- `AUDIT.md`
- `SUPABASE_AUDIT.md`
- `SECURITY.md`

## Submission blocker to clear before Indiemaker

The current `main` branch has a buyer showcase at `/buyer`, but the newest Vercel deployment is in an error state. The repository's Supabase client intentionally requires a public Supabase URL plus a publishable/anon key at build time. The Cloudflare workflow is configured to provide those public environment variables through GitHub Actions secrets.

Therefore:

1. Verify the required GitHub/Cloudflare public build secrets are configured.
2. Run the current `main` build through the configured deployment workflow.
3. Verify the resulting public URL and `/buyer` route.
4. Only then use that URL as the current Indiemaker product URL.

Never place a Supabase service-role key, private credential or other secret in a marketplace listing.
