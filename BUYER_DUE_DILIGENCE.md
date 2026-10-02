# GreyVerse — Buyer Due-Diligence Checklist

This checklist is intended to make a potential acquisition review fast and explicit.

## Repository

- [ ] Confirm repository access
- [ ] Review commit history
- [ ] Review application routes
- [ ] Review package.json and build configuration
- [ ] Review environment template
- [ ] Confirm no private credentials are included

## Frontend

- [ ] Run `npm ci`
- [ ] Run `npm run build`
- [ ] Confirm `out/index.html` is generated
- [ ] Open landing/login/signup/profile screens
- [ ] Review League, Fixtures, Rankings, Tournaments and Notifications routes
- [ ] Inspect responsive/mobile presentation

## Supabase / database

- [ ] Review migrations
- [ ] Review tables and relationships
- [ ] Review RLS policies
- [ ] Review RPC functions
- [ ] Review Realtime configuration
- [ ] Review Storage/evidence architecture

## Functional validation

- [ ] Test authenticated match-ready expiry
- [ ] Test result agreement flow
- [ ] Test dispute path
- [ ] Test DLS/eFootball data isolation
- [ ] Test seasonal transition logic
- [ ] Test lowest-tier playoff sourcing
- [ ] Test critical mutations through authoritative workflows
- [ ] Test private evidence upload/storage where required

## Commercial diligence

- [ ] Confirm what source code is being transferred
- [ ] Confirm whether GreyVerse brand/IP is included
- [ ] Confirm which domains/accounts, if any, are included
- [ ] Confirm third-party dependencies and licenses
- [ ] Agree handover/support scope
- [ ] Agree payment/escrow method
- [ ] Complete written transfer agreement

## Buyer acknowledgement

GreyVerse is an early-stage software asset/MVP. The repository contains substantial implemented architecture, but the buyer should independently validate the remaining release gates before relying on the product for production competition operations.
