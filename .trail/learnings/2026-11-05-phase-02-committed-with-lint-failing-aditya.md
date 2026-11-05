---
title: Phase 02 committed with lint failing on pre-existing product errors
author: Aditya
date: 2026-11-05
branch: chore/supabase-migration
cost: { minutes: 6, tokens: 117401 }
id: l-25475364
scope: repo
status: active
src: agent
touches:
  - ".env.example"
  - ".prettierignore"
  - AGENTS.md
  - CLAUDE.md
  - README.md
  - actions/auth.ts
  - actions/types.ts
  - app/auth/layout.tsx
  - app/auth/sign-in/page.tsx
---

## Decided
Phase 02 (monorepo collapse) committed as ca0c381 even though `pnpm lint` fails. The four errors existed in apps/web before the move. Fixing them belongs to phases 07 and 11, and rule 7 forbids touching components/ui outside phase 11. Recorded under Blockers in the phase file.

## Tried and ruled out
Fixing the four errors inside phase 02. Ruled out: they are product copy and hook-pattern issues owned by later phases, and fixing them here widens the diff.

## Watch out
In the code: `pnpm lint` errors at components/avenro-logo.tsx:37, components/ui/carousel.tsx:97, hooks/use-mobile.ts:14 (react-hooks/set-state-in-effect) and components/marketing/faqs.tsx:81 (react/no-unescaped-entities). `.trail/**` was added to eslint ignores because the root lint scope now includes trail's own .cjs scripts. The untracked apps/api/.env was deleted with apps/ and was not read. Third-party clones were removed on owner request; headroom-venv was kept.
