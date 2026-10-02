# GreyVerse — AI-Native Developer Portfolio

## Profile

**AI-Native Full-Stack Product Builder**

I build web products by combining software engineering fundamentals with AI-assisted development workflows. My approach is to use AI coding tools to accelerate implementation while personally directing product requirements, architecture, database design, security boundaries, testing, debugging and deployment.

## Featured project

### GreyVerse — Football Gaming Competition Platform

**Repository:** https://github.com/Dannygray29/Greyverse

GreyVerse is an online competition-management platform for DLS and eFootball players. External games provide the football gameplay; GreyVerse provides the competition layer around them.

### What I built

- Player accounts and authentication
- Game-specific DLS/eFootball player contexts
- League and membership architecture
- Fixtures and match workflows
- Standings and rankings
- Tournament structures
- Match-ready, result, evidence and dispute workflows
- Notifications
- Player progression, wallets, rewards and transaction structures
- Reporting and suspension structures
- Row-Level Security architecture
- PostgreSQL competition logic and RPC architecture
- Capacitor Android configuration
- Cloudflare Pages deployment configuration
- GitHub Actions CI/CD

## Technology

- Next.js 16
- React 19
- TypeScript
- Supabase Auth
- PostgreSQL
- Row-Level Security (RLS)
- PostgreSQL RPC functions
- Supabase Storage / Realtime architecture
- Capacitor 7
- Cloudflare Pages
- GitHub Actions
- Git/GitHub

## AI-assisted development workflow

AI is used as an engineering accelerator rather than as a substitute for product ownership.

Typical workflow:

1. Define the feature and acceptance criteria.
2. Break the requirement into architecture, data, UI and validation tasks.
3. Use AI coding tools to generate or modify implementation.
4. Inspect the generated code and compare it against the intended architecture.
5. Run builds/tests and investigate errors.
6. Use AI to diagnose and iterate on implementation problems.
7. Review security, authorization and data-isolation implications.
8. Verify the resulting behavior.
9. Commit the working change to GitHub.
10. Document known limitations instead of presenting unverified functionality as complete.

## Engineering decisions demonstrated by GreyVerse

### Static Next.js architecture

GreyVerse uses a static Next.js export. Because there is no private Next.js server runtime, authoritative workflows are designed around Supabase RLS, PostgreSQL RPCs and/or Edge Functions.

### Security boundaries

The project treats the browser as an untrusted client. RLS and controlled database functions are used as the security boundary for sensitive competition data.

### Game isolation

The product separates DLS and eFootball player contexts under one account and is designed so competition records can be scoped to the selected game.

### Honest release validation

The repository includes a technical audit documenting remaining behavioral verification rather than claiming that every competition workflow is production-validated.

## What this project demonstrates

- Turning a product concept into a structured application
- Working with AI coding agents on a multi-feature codebase
- Full-stack TypeScript development
- Relational database design
- Authentication and authorization architecture
- RLS/security thinking
- Competition/business-rule modeling
- Mobile packaging with Capacitor
- CI/CD and deployment configuration
- Debugging and iterative development
- Technical documentation and release-gate thinking

## Current development status

GreyVerse is in active development and is **conditionally ready**, not presented as fully competition-production-ready.

Documented remaining verification includes authenticated match workflows, result/dispute behavior, cross-game isolation tests, seasonal transition testing, lowest-tier playoff operations, and any remaining critical mutations that should be moved behind authoritative server/database workflows.

See:

- [AUDIT.md](./AUDIT.md)
- [SUPABASE_AUDIT.md](./SUPABASE_AUDIT.md)

## Portfolio positioning

### Short version

> AI-native full-stack product builder who uses AI coding agents to rapidly design, implement, debug and ship real software. Built GreyVerse, a Next.js/Supabase football competition platform with authentication, game-specific data, leagues, fixtures, rankings, tournaments, match workflows and RLS-backed architecture.

### One-line version

> **I use AI coding agents to turn product requirements into working full-stack software, while owning the architecture, validation and shipping process.**

## Important distinction

This portfolio does not claim that AI independently created GreyVerse or that every line was manually written. It demonstrates the ability to **direct, review, validate and ship AI-assisted software development work**.
