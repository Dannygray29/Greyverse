# Security Policy

## Scope

GreyVerse is an online gaming/esports project under active development. Security-sensitive areas include authentication, player data, competition state, match results, rewards, private evidence and Supabase access control.

## Reporting

Please report suspected vulnerabilities privately through GitHub rather than publishing exploit details in an issue.

When reporting, include the affected area, reproduction steps, expected behavior and actual behavior. Do not include passwords, access tokens, private keys or other secrets.

## Development security requirements

- Never commit Supabase service-role keys or other private credentials.
- Keep local environment files out of version control.
- Treat browser-side values as public and enforce authorization with Supabase RLS/RPC or another trusted server boundary.
- Keep private evidence in private storage and use controlled access such as signed URLs.
- Do not treat client-side checks as authoritative competition rules.
- Verify authenticated match submission, dispute handling and season-transition workflows before production release.
