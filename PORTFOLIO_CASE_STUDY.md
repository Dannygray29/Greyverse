# GreyVerse — AI-Native Engineering Case Study

## Project snapshot

**GreyVerse** is a football gaming competition-management platform for DLS and eFootball.

The external games provide the actual football gameplay. GreyVerse provides the competition infrastructure around those games: identity, leagues, fixtures, rankings, tournaments, evidence, results, progression and competition rules.

**Status:** Active development / conditionally ready.

## The problem

Players can play football games without needing another platform, but running a structured competitive ecosystem requires much more than match gameplay.

GreyVerse was designed to solve the surrounding operational problems:

- player identity and authentication
- separating DLS and eFootball competition contexts
- league membership and fixtures
- standings and rankings
- tournament qualification
- match readiness and result submission
- evidence and dispute workflows
- promotion/relegation rules
- rewards, progression and transaction records
- reporting and suspensions
- authorization and data isolation

## Architecture

```text
                     GreyVerse Web Client
                 Next.js 16 + React 19 + TS
                            │
                            ▼
                 ┌──────────────────────┐
                 │       Supabase       │
                 │                      │
                 │ Auth                 │
                 │ PostgreSQL           │
                 │ RLS                  │
                 │ RPCs                 │
                 │ Storage / Realtime   │
                 └──────────┬───────────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
          Players       Competition      Evidence
                         rules/data       workflows
             │              │
             └──────────────┴──────────────┐
                                            ▼
                                  DLS / eFootball
                                  external gameplay

     Android: Capacitor 7
     Web: Cloudflare Pages
     CI/CD: GitHub Actions
```

The web application uses a static Next.js export. There is no private Next.js server runtime in this repository, so competition-critical authority must live in Supabase RLS, PostgreSQL RPCs and/or Edge Functions.

## Engineering approach

The central architectural principle is:

> **The browser is a client, not the authority.**

Sensitive competition state should not depend solely on values supplied by the browser. Database authorization and controlled server-side/database logic are therefore part of the design.

### Game isolation

A player can use DLS or eFootball under the same broader account identity, while competition records are designed around the selected game context.

The goal is that a DLS player does not accidentally receive eFootball competition data, and vice versa, while shared community functionality can remain cross-game.

### Competition modeling

GreyVerse models:

- leagues
- tiers
- memberships
- fixtures
- matches
- standings
- rankings
- tournaments
- promotion/relegation
- playoff structures
- rewards
- progression
- reports and suspensions

This converts a gaming concept into a relational competition-management system.

## AI-native development workflow

AI coding agents are used as development accelerators.

The workflow is:

1. Define the product requirement.
2. Establish acceptance criteria.
3. Break the work into UI, data, architecture and validation tasks.
4. Use AI coding tools to implement or modify the required code.
5. Inspect the generated implementation.
6. Build and test the result.
7. Diagnose failures with AI assistance and iterate.
8. Review authorization, RLS and data-isolation implications.
9. Verify the behavior against the requirement.
10. Commit and document the result.

The important engineering skill is not simply generating code. It is directing the agent, recognizing incorrect output, validating behavior and deciding what is safe to ship.

## Technical evidence

The repository contains:

- `AUDIT.md` — repository architecture and release-gate audit
- `SUPABASE_AUDIT.md` — database/security audit notes
- `AI_NATIVE_PORTFOLIO.md` — portfolio positioning
- `AI_NATIVE_DEVELOPER_PROFILE.md` — application profile

## Current release position

GreyVerse is deliberately **not** described as fully production-ready.

The documented remaining verification areas include:

- authenticated match-ready expiry
- result agreement and dispute-resolution behavior
- cross-game isolation testing
- seasonal transition processing
- lowest-tier external playoff operations
- remaining critical browser-side mutations that may need authoritative database/server workflows
- fully private evidence-upload handling where appropriate

This distinction is part of the engineering evidence: known gaps are documented rather than hidden.

## What this demonstrates to an employer

### Product engineering

Ability to take a product idea and model it as a working full-stack system.

### AI-assisted engineering

Ability to use modern AI coding agents for rapid implementation while maintaining human review and technical ownership.

### Backend/data engineering

Experience with PostgreSQL, relational modeling, RLS, authorization boundaries and database-side business logic.

### Frontend engineering

Experience with Next.js, React, TypeScript and static web deployment.

### Security thinking

Understanding that client-side controls are insufficient for sensitive competition state and that authorization must be enforced at the data/backend boundary.

### Shipping discipline

GitHub-based development, CI/CD, Android packaging, deployment configuration, audits and explicit release gates.

## Portfolio statement

> **I use AI coding agents to turn product requirements into working full-stack software while owning the architecture, security boundaries, validation and shipping process. GreyVerse is my flagship example: a Next.js/Supabase competition platform built around real relational data, authorization and competition workflows.**
