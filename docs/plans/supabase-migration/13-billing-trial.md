# Phase 13 — Billing and 30-day trial

Read [README.md](README.md) first: its global rules, decisions and verified facts apply to every step here. Start only after phase 12 is committed.

Decisions this phase implements:

| Topic | Decision |
| --- | --- |
| Pricing | One "Team" plan: $8 per active member per month, or $80 per year. No seat minimum. VIEWER and CLIENT members are free. Prices are Stripe Prices with lookup keys `team_monthly` and `team_yearly`. All features are in the plan, with no feature gating. |
| Trial | 30 days, card required at start. |
| Trial abuse | One trial per card fingerprint, per normalized verified email, per workspace, and per profile. Stripe Radar's free-trial-abuse control is on. If a duplicate is found after Checkout, that trial subscription is cancelled at once with nothing charged, and the user is offered a no-trial subscription that needs a fresh, explicit click. |
| Lapse | When the trial ends unpaid or the subscription lapses, the workspace becomes read-only, with export still available, for 30 days. It is then deleted. Emails go out on day 0, day 23 and day 29. |
| App scope | Front end for all 43 domain tables. |
| Scrum roles | A member can hold several project roles (`project_membership.roles` is already a `project_role[]`). The capability matrix below applies, enforced in RLS and mirrored in the UI. |
| Design | Modern SaaS app shell: sidebar navigation, ⌘K command palette, inbox, dense keyboard-friendly lists. Built strictly from `DESIGN.md` tokens, polished with `high-end-visual-design` and `emil-design-eng`. |

Honest limit to write into README: these controls make abuse expensive and detectable. No system can guarantee zero abuse (for example, a person with many real cards and real email addresses). The plan names that residual risk instead of claiming otherwise.

Skills: `stripe-best-practices`, `stripe-docs` (read every Stripe API used, in the installed `stripe` package version), `karpathy-guidelines`, `antislop-code`, `antislop-copywriting`, `vercel-react-best-practices`.

1. `pnpm add stripe nodemailer` and `pnpm add -D @types/nodemailer vitest`. Add `pnpm test` (vitest). The owner supplies test-mode keys; agents never use live keys.
2. `scripts/stripe-setup.mjs`: an idempotent script that creates Product "Avenro Team" and Prices `team_monthly` ($8, per unit, monthly) and `team_yearly` ($80, per unit, yearly), with `tax_behavior` set and found by `lookup_keys`.
3. Migration `<ts>_billing.sql`:
   - `billing_customers(workspace_id pk → workspace, stripe_customer_id unique)`.
   - `subscriptions(workspace_id pk, stripe_subscription_id unique, status text, price_lookup_key, quantity int, trial_end timestamptz, current_period_end timestamptz, cancel_at_period_end bool, updated_at)`.
   - `trial_claims(kind text check in ('email','card','workspace','profile'), value_hmac text, created_at, primary key(kind, value_hmac))`.
   - `stripe_events(id text pk, type text, processed_at timestamptz)`.
   - On `workspace`: `read_only_since timestamptz`, `scheduled_deletion_at timestamptz`, `lapse_notice_sent int default 0`.
   - RLS: members select `subscriptions`; no client access to `billing_customers`, `trial_claims` or `stripe_events`. `create or replace private.can_write(ws)` adds "workspace has a subscription with status in (`trialing`,`active`,`past_due`) and `read_only_since is null`".
4. `lib/billing/normalize-email.ts`: trim, NFC, lowercase; drop the `+tag` for every domain; for `gmail.com`/`googlemail.com` remove dots and map to `gmail.com`. `lib/billing/claims.ts` (`server-only`): HMAC-SHA256 with `TRIAL_CLAIM_SECRET`. Disposable-email check from a vendored domain list in `lib/billing/disposable-domains.txt`; record its source and license (must be CC0/MIT/public domain) in `THIRD_PARTY_NOTICES.md`. Vitest unit tests for all three.
5. Start trial (`actions/billing.ts` `startTrialAction(workspaceId, interval)`), OWNER only:
   1. Check the email is confirmed, the domain is not disposable, and no claim exists for `profile`, `email` or `workspace`. Any failure: the trial is not offered, and the user is offered "Subscribe without trial".
   2. Create the Stripe customer (metadata `workspace_id`) and a Checkout Session: `mode: "subscription"`, line item price by lookup key with `quantity` = current active members, `subscription_data.trial_period_days: 30`, `subscription_data.trial_settings.end_behavior.missing_payment_method: "cancel"`, `payment_method_collection: "always"`, `automatic_tax.enabled: true`, `consent_collection.terms_of_service: "required"`, `custom_text.submit.message` stating "Free for 30 days, then $X per member per month plus tax. Cancel anytime before <date> and you will not be charged. We email you 7 and 3 days before." Idempotency key `trial:<workspaceId>`.
   3. Redirect to Checkout. Wire Radar exactly as `docs.stripe.com/radar/free-trial-abuse` describes for this integration.
6. `app/api/stripe/webhook/route.ts`: raw body, `stripe.webhooks.constructEvent`, skip events already in `stripe_events`, insert after successful handling. Handle:
   - `checkout.session.completed`: retrieve the subscription and its default payment method, read `card.fingerprint`, and insert all four `trial_claims` in one transaction. On unique violation (the card, email or workspace already had a trial), cancel the subscription immediately with `invoice_now: false, prorate: false` so nothing is charged, and mark the workspace "trial_denied" so the billing page offers a no-trial Checkout (`trial_period_days` omitted) that the user must click again.
   - `customer.subscription.created/updated/deleted` and `invoice.paid/payment_failed`: upsert `subscriptions`. Status in (`canceled`,`unpaid`,`incomplete_expired`,`paused`) → set `read_only_since = now()`, `scheduled_deletion_at = now() + 30 days`. Back to `active`/`trialing` → clear both.
   - `customer.subscription.trial_will_end`: show an in-app banner flag. Stripe's own reminder email covers the 7-day notice (owner enables it in the dashboard; the webhook fires 3 days before).
7. Seat sync: `lib/billing/sync-seats.ts` updates the subscription item quantity (proration `create_prorations`) after any membership change that alters the active-member count. Phases 14 and 15 call it. The billing page shows the next invoice preview.
8. `app/api/cron/run/route.ts` (POST, `Authorization: Bearer CRON_SECRET`, constant-time compare): sends lapse emails on day 0, 23 and 29 via `lib/email/transactional.ts` (nodemailer, SMTP env, plain text plus HTML, sender `MAIL_FROM`); after `scheduled_deletion_at`, calls `private.purge_workspace(ws)` (deletes rows in FK order, covered by pgTAP); deletes `stripe_events` older than 90 days.
9. Billing UI is built in phase 14. This phase ships the actions, routes and a minimal `app/(app)/w/[workspaceSlug]/billing/page.tsx` used for testing: status, trial end date, "Manage billing" (Customer Portal session), "Start trial" or "Subscribe".

Acceptance (Stripe test mode, `stripe listen` running):
- A new workspace starts its trial with test card 4242, and the subscription is `trialing` with trial end in 30 days.
- A second workspace by the same user is refused before Checkout.
- A different user with the same card gets the trial cancelled without charge after Checkout, then an explicit no-trial offer.
- A `+tag` or dotted Gmail variant of a used email is refused.
- Card `4000000000000341` (attach fails) is handled.
- `stripe trigger customer.subscription.deleted` puts the workspace into read-only, and RLS blocks inserts while export works.
- Cron sends the day-0 email to Mailpit; after `scheduled_deletion_at` is forced into the past, the purge removes the workspace data.
- Cancelling in the Customer Portal sets `cancel_at_period_end`.
- Replaying the same webhook event is a no-op.
- `pnpm test` and `pnpm db:test` pass.
