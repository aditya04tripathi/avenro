# Avenro: replace NestJS with Supabase, collapse to one Next.js app, compliance pass

## Context

Avenro is a pnpm monorepo: `apps/web` (Next.js 16.4.2, React 19.3, Tailwind 4, shadcn/base-ui) and `apps/api` (NestJS 12 + Prisma 7.10 + PostgreSQL). The API implements only auth (register, sign-in, sessions, email verification, password reset, Google OIDC) and health, but `apps/api/prisma/schema.prisma` defines 46 models (38 product-domain, 8 auth-storage). The root `docker-compose.yml` runs Postgres, Redis and SeaweedFS; Redis and SeaweedFS have no integration.

The owner wants:

1. NestJS, Prisma, Redis and SeaweedFS removed; Supabase (Auth, Postgres, Storage) in their place.
2. The repo collapsed into a single Next.js project, served locally through Docker.
3. UI kept visually consistent, Next.js best practice, minimal client bundle.
4. A long compliance list (legal pages, consent, privacy rights, accessibility, honest marketing, licenses).
5. A plan detailed enough to hand to lower-capability agents.

Decisions taken with the owner (5 Nov 2026):

| Topic | Decision |
| --- | --- |
| Local Supabase | Supabase CLI (`supabase start`). Root `docker-compose.yml` runs only the Next.js container. |
| Schema scope | Port all 38 domain models to Supabase SQL with RLS. The 8 Nest auth-storage models are replaced by Supabase Auth and are not ported. |
| Children | Block sign-up under 16 with a neutral age gate. Store only the fact the gate passed, never the birth year. No parental-consent flow is needed because no child data is collected. |
| Billing | No billing code. Publish free-pricing, refund and renewal policies, plus a release gate for any future paid plan. |

Facts verified in the code on 5 Nov 2026 (agents must not re-derive these):

- Web pages: `app/page.tsx` (marketing), `app/auth/{layout,sign-in/page,sign-up/page}.tsx`, `actions/auth.ts` (calls Nest `/auth/register`). Sign-in form has no action.
- Template leftovers: hero copy "Simple payments for startups … right inside Tailark", "Trusted by teams at" + Vercel/Spotify/Supabase logos, missing image `/mist/tailark.png`, CTA "Try Mist for Free"/lorem ipsum, e-commerce FAQ (shipping, returns), features copy "AI-powered scheduling"/"AI Meeting Scheduler"/"Marketing Campaigns", footer "© 2026 Tailark Mist", footer and social links all `href="#"`.
- Unused brand SVGs in `components/ui/svgs/` (openai, claude-ai, gemini, hulu, spotify, supabase, vercel, beacon, bolt).
- No countdown timers, reviews/testimonials, SOC 2 claims, analytics, tracking scripts, payments or marketing email code exist today.
- `components/theme-provider.tsx` binds the single key `d` to toggle theme (WCAG 2.1.4 failure).
- `components/avenro-logo.tsx` is a client component only to pick a theme image (bundle cost, hydration swap).
- Dark theme `--primary` is `--brand-teal` `#1e6b70`; used as text (`text-primary`) on the dark background it is very likely below 4.5:1.
- Images of unknown provenance: `assets/images/{auth-background.jpg,auth-background-wide.jpg,strava.png,woman-meditating-in-mountains.jpg}`.
- `next.config.ts` allows remote images from `images.unsplash.com` and `avatars.githubusercontent.com` (unused).
- Prisma migrations contain raw SQL not expressible in `schema.prisma`: partial unique indexes and the `require_workspace_owner_membership()` constraint triggers (`20261029120000_schema_integrity/migration.sql:553-747`).
- Every domain model except `User` and `Workspace` has a `workspaceId` column, so tenant RLS can key on `workspace_id` everywhere.
- `third-party/` is excluded via `.git/info/exclude` and is not part of the product. Leave it alone.


## How to use these files

Work one phase at a time, in order. Read this README (global rules, decisions, verified facts) first, then exactly one phase file. A phase is done only when every item under its **Acceptance** line passes; then commit on branch `chore/supabase-migration` as `phase NN: <summary>` with the attribution trailer. Record anything that blocks a step under a `## Blockers` heading at the end of that phase file and stop.

| Phase | File |
| --- | --- |
| 00 | [Prep and safety](00-prep.md) |
| 01 | [Extract the exact database schema from Prisma](01-schema-extract.md) |
| 02 | [Collapse the monorepo into one Next.js project](02-collapse-monorepo.md) |
| 03 | [Supabase local stack and domain schema with RLS](03-supabase-schema-rls.md) |
| 04 | [Compliance data layer](04-compliance-data.md) |
| 05 | [Next.js Supabase integration and auth flows](05-auth-flows.md) |
| 06 | [Serve locally through Docker](06-docker.md) |
| 07 | [Honest marketing content](07-marketing-content.md) |
| 08 | [Legal pages and business details](08-legal-pages.md) |
| 09 | [Cookie banner, tracker blocking, SDK audit](09-cookie-consent.md) |
| 10 | [Privacy center: access, deletion, marketing consent, unsubscribe](10-privacy-center.md) |
| 11 | [Accessibility, contrast, keyboard, alt text, bundle size](11-accessibility-bundle.md) |
| 12 | [License audit](12-licenses-images.md) |
| 13 | [Guard checks and final verification](13-verify.md) |

## Global rules for every agent

1. Read `AGENTS.md` (root). Until phase 02 lands, also read `apps/web/AGENTS.md`. Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` (Next 16 renamed `middleware` to `proxy`; do not use training-data APIs).
2. Load skills: `karpathy-guidelines` and `antislop` always; `antislop-code` whenever writing code (no AI-slop comments, keep existing comments); others per phase.
3. Before using any Supabase API, open the installed package (`node_modules/@supabase/ssr/README.md`, `node_modules/@supabase/supabase-js`, `supabase --help`) and match it. Record installed versions in the phase commit message.
4. Never read, print or commit `.env` values. Only edit `.env.example`.
5. No destructive operations without the owner: no `supabase db reset` against anything but the local CLI stack, no `git clean`, no force push. The only authorized volume deletion is the one in phase 02 step 11 (owner approved 5 Nov 2026).
6. Format with `pnpm format`, lint with `pnpm lint`, typecheck with `pnpm typecheck` before every commit. Import order is the web order in `AGENTS.md`.
7. Do not edit `components/ui/*` except for an accessibility fix required by phase 11.
8. Legal pages describe facts only. Never invent certifications, uptime numbers, customers, reviews, partners or legal entity details. Unknown facts use a placeholder from `lib/legal/company.ts` (see phase 08) that blocks production builds.
9. If a step is impossible or contradicts the code, stop and write the blocker into the phase file under a `## Blockers` heading. Do not improvise around it.
10. Code search order. For any TypeScript symbol use the `LSP` tool first: `workspaceSymbol` to find it, `goToDefinition`, `findReferences` before changing, moving, renaming or deleting any export, `incomingCalls`/`outgoingCalls` for blast radius. Use `trail ask`/`trail grep` for broad discovery ("where is X handled"). Use plain grep only for non-symbol text (copy strings, CSS classes, env names). A phase that deletes or moves a file lists the `findReferences` result for each export it touched in the commit message.
11. Server first. Every page, layout and component is a Server Component unless it needs state, effects, event handlers or browser APIs. Then make the smallest leaf a client island and pass it minimal serializable props. Data fetching, Supabase queries, auth checks, validation and secrets stay on the server (Server Components, Server Actions, Route Handlers, `server-only` modules). No Supabase browser client in a component unless the feature needs realtime. Allowed client islands after this migration: `HeroHeader` (scroll state), auth/privacy forms (`useActionState`), `CookieBanner`, `ConsentGate`, theme toggle, dialogs/accordion primitives in `components/ui`. Adding another needs a one-line reason in the commit message. Load `vercel-react-best-practices` for this rule.
12. Visual quality without drift. `DESIGN.md` (tokens, fonts, radii, components) is authoritative. Use `high-end-visual-design` and `emil-design-eng` for polish within those tokens (spacing rhythm, hierarchy, shadows, states, motion timing). Where they prescribe different fonts or colors, `DESIGN.md` wins. Run `baseline-ui` and `web-design-guidelines` as the final pass of every UI phase.


## Compliance matrix

| Requirement | Where |
| --- | --- |
| Privacy policy | 08 `/privacy` |
| Terms of service | 08 `/terms` |
| Cookie banner | 09 |
| Block trackers until consent | 09 `ConsentGate`, 13 guard |
| Audit third-party SDKs, analytics, tracking | 09 `third-party-audit.md` |
| Unsubscribe in marketing emails | 10 one-click unsubscribe + headers helper |
| Separate marketing consent | 05 separate unchecked checkbox, 10 settings switch |
| Checkbox to accept privacy policy and terms | 05 sign-up and complete-profile |
| Record acceptance of terms | 04 `legal_acceptances`, versioned re-acceptance in 05 |
| Data retention limits | 04 pg_cron jobs, `docs/legal/data-retention.md`, 08 privacy page |
| Data access and deletion requests | 04 RPCs, 10 privacy center, `privacy_requests` log |
| Stop collecting unnecessary data | 01/04 drop email copy, no IP/UA, no birth year; 09 cookie consent device-only |
| Parental consent for children | Decision: under-16 blocked before any data is stored (05); no OAuth, so no account exists before the age gate |
| Prevent unauthorized AI training on user data | 08 terms/privacy commitments, subprocessor rule, robots + `noai` headers |
| Label AI-generated content | 12 asset register + visible caption rule |
| Fix color contrast | 11 contrast script on all token pairs |
| Alt text | 11 |
| Keyboard navigation | 11 skip link, focus ring, remove single-key shortcut, banner/dialog checks |
| Remove dark patterns | 07 honest CTAs, 09 equal-weight banner, 10 one-step deletion and unsubscribe, 05 no pre-ticked boxes |
| Remove fake countdown timers | None exist (verified 5 Nov 2026); 13 guard |
| Remove fake reviews | None exist (verified); 13 guard |
| Remove unsupported claims | 07 hero, features, FAQ, CTA rewrite |
| Remove false SOC 2 claims | None exist (verified); 13 guard; terms make no certification claims |
| No customer logos without permission | 07 remove "Trusted by" logos and unused brand SVGs |
| Verify image, font, code licenses | 12 |
| Open source license obligations | 12 `THIRD_PARTY_NOTICES.md` |
| Refund policy | 08 `/refunds` |
| Easy subscription cancellation | No subscriptions; 08 refunds/pricing commitment + release gate below |
| Disclose auto-renewals | 08 `/pricing` states none; release gate |
| Remove hidden fees | 08 `/pricing` |
| Realistic uptime commitments | 08 terms: no SLA, best effort; 13 guard on "99.9%" claims |
| Publish subprocessors list | 08 `/subprocessors` |
| Data processing agreements | Owner accepted (5 Nov 2026); links on `/subprocessors` (08) |
| DMCA registration | Checked; owner chose not to register a designated agent (5 Nov 2026). Note: without one, US DMCA §512 safe harbor is unavailable. Terms keep a copyright-complaint contact. |
| Business contact details | 08 `company.ts`, `/contact`, footer |

Release gate for any future paid plan (README; implement with the `stripe-best-practices` and `stripe-docs` skills): checkout must show price, billing interval, renewal date and total including tax before payment; cancellation must be self-serve in `/account` in as few steps as sign-up; renewal reminder email before annual renewals; refund window stated on `/refunds`; `/pricing` and terms updated and `TERMS_VERSION` bumped.


## Owner actions

1. Commit or stash current WIP before phase 00.
2. Fill `lib/legal/company.ts`: legal name, postal address, contact and privacy emails, governing law, jurisdiction, refund window.
3. Confirm the retention defaults in phase 04 or change them.

Resolved by the owner on 5 Nov 2026 (no agent action beyond what the phases say):
- Legal review: done.
- DPAs (Supabase, Zoho, host): accepted.
- DMCA designated agent: not wanted.
- Google OAuth: removed; email and password only.
- Old Docker volumes: delete them (phase 02 step 11).
- Tailark-derived sections and the images in `assets/`: open source per the owner. Phase 12 records them.
- Social profile URLs: keep the icons with placeholder URLs marked `TODO:` (phase 07 step 5).
- Uncommitted WIP: kept and committed in phase 00.


## Verification (end to end, run in phase 13)

1. `pnpm format && pnpm lint && pnpm typecheck && pnpm check:compliance` pass.
2. `pnpm db:reset && pnpm db:test` pass (RLS, onboarding trigger, deletion, export).
3. `pnpm build` passes; First Load JS for `/` is no larger than before the migration.
4. `docker compose up --build`: on `http://localhost:3000`, using the browser pane: banner appears, Reject all works, zero third-party requests; sign up with birth year making the user 15 → refused, no `auth.users` row; sign up as adult with marketing unticked → confirm via Mailpit → `/account`; `legal_acceptances` has two rows, `marketing_consents.opted_in = false`; toggle marketing on, then unsubscribe through a generated token → off; download export → only own data; delete account → signed out, `auth.users` row gone, profile scrubbed.
5. Keyboard-only pass on `/`, `/auth/sign-up`, `/account/privacy`; contrast script passes; every legal page linked from footer.
6. `git ls-files | grep -E '^(apps|packages)/'` empty; no `nest`, `prisma`, `redis`, `seaweed` strings outside `docs/plans` and git history.
