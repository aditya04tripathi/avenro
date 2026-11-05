---
title: "Server Supabase client in the proxy must use the server URL, not the browser URL"
author: Aditya
date: 2026-11-05
branch: chore/supabase-migration
cost: { minutes: 9, tokens: 130891 }
id: l-18bd134c
scope: repo
status: active
src: agent
touches:
  - ".dockerignore"
  - ".env.example"
  - Dockerfile
  - README.md
  - app/api/health/route.ts
  - docker-compose.yml
  - lib/supabase/proxy.ts
  - next.config.ts
  - lib/supabase/server.ts
  - lib/env.ts
---

## Decided
The proxy session client reads the server `SUPABASE_URL`, the same as `lib/supabase/server.ts`. The browser-facing `NEXT_PUBLIC_SUPABASE_URL` is for the browser only.

## Tried and ruled out
Using `NEXT_PUBLIC_SUPABASE_URL` in the proxy. Inside the Docker container `127.0.0.1` is the container itself, so `getClaims` failed silently. Sign-in appeared to succeed, then `/account` redirected back to sign-in with no error logged.

## Watch out
In the code: `lib/supabase/proxy.ts`, `lib/supabase/server.ts`, `docker-compose.yml` (`SUPABASE_URL=http://host.docker.internal:54321`).
Build also fails without server env: `lib/env.ts` parses at import and page-data collection runs at build. The Dockerfile builder stage sets build-only placeholders. The runner stage starts from `base`, so they never ship.
A stale `age_gate=blocked` cookie is shared across `localhost` ports. A sign-up refusal can come from another port's test. Use `127.0.0.1` to get a clean cookie jar.
Node 26 alpine images ship no `corepack`. Install pnpm with npm.
