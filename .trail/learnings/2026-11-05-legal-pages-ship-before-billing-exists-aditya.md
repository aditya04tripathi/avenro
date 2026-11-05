---
title: Legal pages ship before billing exists and use placeholders for unknown business facts
author: Aditya
date: 2026-11-05
branch: chore/supabase-migration
cost: { minutes: 5, tokens: 122783 }
id: l-993e1cff
scope: repo
status: active
src: agent
touches:
  - app/(legal)/contact/page.tsx
  - app/(legal)/cookies/page.tsx
  - app/(legal)/layout.tsx
  - app/(legal)/pricing/page.tsx
  - app/(legal)/privacy/page.tsx
  - app/(legal)/refunds/page.tsx
  - app/(legal)/subprocessors/page.tsx
  - app/(legal)/terms/page.tsx
  - app/layout.tsx
  - app/robots.ts
---

## Decided
Phase 08 writes /pricing, /terms, /refunds and /subprocessors as the final subscription terms, even though phase 13 builds the Stripe billing that makes them true. Unknown business facts (legal name, address, governing law, refund window, data region, privacy email) stay "__OWNER_TO_PROVIDE__" in lib/legal/company.ts, and the pages render them as-is.

In the code: lib/legal/company.ts (company, plan, PLACEHOLDER), app/(legal)/pricing/page.tsx, app/(legal)/subprocessors/page.tsx.

## Tried and ruled out
Leaving the legal pages out until billing ships. The footer already links to them, so they must exist first.

## Watch out
- Until phase 13 lands, the billing claims on these pages are promises, not facts. Do not treat the pages as accurate for a live product yet.
- Stripe and Supabase DPA URLs were written from memory and are not verified. Check them before release.
- "Active member" (non-Viewer, non-Client, active membership) is an inference. Confirm it against phase 13 before it goes live.
- Port 3100 on this machine is a Docker container serving an old build. Test on another port.
