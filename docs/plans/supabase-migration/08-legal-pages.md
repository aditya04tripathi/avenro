# Phase 08 — Legal pages and business details

Read [README.md](README.md) first: its global rules, decisions and verified facts apply to every step here. Start only after phase 07 is committed.

Skills: `antislop-copywriting`, `fixing-metadata`, `antislop-layoutmobile`, `antislop-ui`, `karpathy-guidelines`.

Steps:
1. `lib/legal/company.ts`: `legalName`, `tradingName: "Avenro"`, `postalAddress`, `contactEmail` (`avenro@adityatripathi.dev` is the verified sender; owner confirms), `privacyEmail`, `governingLaw`, `jurisdiction`, `minimumAge: 16`, `lastUpdated`. Unknown values are the literal string `"__OWNER_TO_PROVIDE__"`.
2. `lib/legal/versions.ts`: `TERMS_VERSION = "2026-11-01"`, `PRIVACY_VERSION = "2026-11-01"`; must match `legal_documents` seed.
3. Route group `app/(legal)/layout.tsx` with a readable prose column using existing tokens; each page is a static server component with `export const metadata` (title, description, canonical) and a visible "Last updated" date.
4. Pages and required content:
   - `/privacy`: controller identity and contact; data collected (account: email, display name, password hash held by Supabase Auth; content you create; the age-gate result, not your birth date; consent records; no analytics today); purposes and legal bases; retention table from `docs/legal/data-retention.md`; subprocessors link; international transfers; rights (access, export, deletion, correction, objection, complaint to a supervisory authority) and how to use them (`/account/privacy` or email); 30-day response; under-16 not allowed; "We do not sell or share personal data and do not use your content to train AI models, and we do not allow subprocessors to."
   - `/terms`: who may use (16+), accounts, acceptable use, user content ownership and the limited license Avenro needs to host it, no AI training on user content, availability ("provided as is, no uptime guarantee or SLA; we aim to give notice of planned maintenance"), free service and no fees, changes to terms with re-acceptance, termination and deletion, liability limits, governing law placeholder, contact.
   - `/cookies`: table of each cookie/storage key actually set: `sb-avenro-auth-token*` (necessary, session), `avenro_consent` (necessary, 6 months), `age_gate` (necessary, 24 h), `theme` in localStorage (necessary preference). States that no analytics or marketing cookies are used today.
   - `/pricing`: "Avenro is free. No trial, no card, no auto-renewal, no hidden fees."
   - `/refunds`: no charges today, so nothing to refund; the commitment that any future paid plan will offer cancel-anytime from account settings, disclose renewal date and price before purchase, and a stated refund window (owner decides; placeholder).
   - `/subprocessors`: Supabase (database, auth, storage; region placeholder), email provider (Zoho Mail SMTP, if used for auth email; owner confirms), hosting provider (placeholder until chosen). Purpose, location, DPA link per row (owner has accepted the DPAs; link each provider's public DPA page). "We will update this page before adding a subprocessor."
   - No `/dmca` page (owner decision). `/terms` keeps one short "Copyright complaints" paragraph pointing to `contactEmail`.
   - `/contact`: legal name, postal address, email, privacy email.
5. `app/robots.ts` and `app/sitemap.ts` (fixing-metadata): allow marketing and legal pages; disallow `/account`, `/auth`, `/app`, `/api`. Add `X-Robots-Tag: noai, noimageai` and `noindex` for authenticated routes via `next.config.ts` headers.
6. Security headers in `next.config.ts` `headers()`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Content-Security-Policy: frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'`, `Strict-Transport-Security` only when `NODE_ENV=production`. A full script CSP is out of scope (next-themes injects an inline script); note it in README as follow-up.

Acceptance: every page renders and is linked from the footer; `pnpm build` passes; each page has a unique title (fixing-metadata check).
