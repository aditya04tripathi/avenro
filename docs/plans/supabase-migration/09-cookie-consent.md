# Phase 09 — Cookie banner, tracker blocking, SDK audit

Read [README.md](README.md) first: its global rules, decisions and verified facts apply to every step here. Start only after phase 08 is committed.

Skills: `antislop-ui`, `antislop-human`, `fixing-accessibility`, `antislop-layoutmobile`, `antislop-copywriting`, `karpathy-guidelines`.

Steps:
1. `lib/consent/consent.ts` (shared, no React): categories `necessary` (always true), `analytics`, `marketing`; cookie `avenro_consent` JSON `{v:1, analytics, marketing, ts}`, `SameSite=Lax`, `Secure` in production, max-age 180 days; parse/serialize with zod.
2. `components/consent/cookie-banner.tsx` (`"use client"`, no new dependencies, under 3 KB gzipped): reads the cookie on mount, renders a fixed bottom non-modal `role="region" aria-label="Cookie preferences"` only when absent or older than 180 days. Buttons "Reject all", "Accept all", "Customize" with identical size and variant (no visual nudge). "Customize" opens a `Dialog` with `Switch` per optional category, both off by default. Never set non-essential cookies before a choice. Tab order reaches the banner; it does not trap focus; `Escape` does not count as consent.
3. `components/consent/consent-gate.tsx`: client component `<ConsentGate category="analytics">{children}</ConsentGate>` that renders children only after consent; any future third-party script (`next/script`) must be wrapped. Today there are none, so it is unused infrastructure plus a lint rule in phase 13.
4. "Cookie settings" button in the footer reopens the dialog (custom event on `window`).
5. Cookie consent is device-scoped and lives only in the `avenro_consent` cookie. Do not store it server-side, even for logged-in users (minimisation). It is unrelated to `marketing_consents`.
6. Mount the banner in `app/layout.tsx` after `{children}`; do not read cookies in the root layout (keeps marketing pages static).
7. SDK audit: write `docs/legal/third-party-audit.md` listing every runtime dependency in `package.json`, whether it ships to the browser, whether it makes network calls, and what data it sends. Expected result: only Supabase JS (first-party backend) contacts the network; `next/font/google` is self-hosted at build time (no Google request at runtime); no analytics. Verify by loading every page in the browser pane and listing network requests to non-local hosts: must be zero.

Acceptance: first visit shows banner; Reject sets cookie with both false; banner gone on reload; footer button reopens; keyboard-only operation works; zero third-party requests.

## Amendment 2 (5 Nov 2026) — overrides earlier steps where they conflict

allowed outbound navigation is `checkout.stripe.com` and `billing.stripe.com` (redirects only). No Stripe.js on Avenro pages. The zero-third-party-requests check stays.
