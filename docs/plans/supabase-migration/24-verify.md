# Phase 24 — Guard checks and final verification

Read [README.md](README.md) first: its global rules, decisions and verified facts apply to every step here. Start only after phase 23 is committed.

Skills: `karpathy-guidelines`, `antislop-code`.

Steps:
1. `scripts/check-compliance.mjs` (Node, no deps), run by `pnpm check:compliance` and as `prebuild` when `NODE_ENV=production`:
   - fails on `__OWNER_TO_PROVIDE__` in `lib/legal/company.ts` when `NODE_ENV=production` (warns in dev);
   - fails on patterns in `app/ components/ lib/`: `/countdown|setInterval\([^)]*(timer|deadline)/i`, `/soc ?2|iso ?27001|hipaa|gdpr[- ]certified/i`, `/testimonial|★★★★★|rating ?value|reviewCount/i`, `/trusted by/i`, `/99\.9+ ?%/`;
   - fails if any `next/script` or `<script src=` outside `components/consent/` is not wrapped in `ConsentGate` (regex check for the import and the wrapper in the same file);
   - fails if `lib/legal/versions.ts` versions differ from the `legal_documents` seed in `supabase/migrations`;
   - fails if any file in `lib/email/` sends mail without calling `assertMarketingAllowed` and `buildMarketingHeaders` (string check);
   - fails if an image file under `assets/` or `public/` lacks a row in `assets/LICENSES.md`.
2. Full run: `pnpm format && pnpm lint && pnpm typecheck && pnpm check:compliance && pnpm db:reset && pnpm db:test && pnpm build && docker compose up --build -d`, then the manual journey below in the browser pane, then `docker compose down`.
3. Run `trail check`; resolve conflicts or explain them in the final commit.
4. Update `README.md` (run locally, scripts, env vars, where legal text lives) and the compliance matrix status column.

## Amendment 2 additions

- Run the full journey from README "Verification" plus phase 13's billing acceptance list again, end to end, in Docker.
- Re-run every app phase's role walkthrough (14–23) on the final build, using the seed users.
- `scripts/check-compliance.mjs` also checks that `/pricing` mentions the trial length, the price per member, renewal and how to cancel, and that `lib/billing/*` never logs card data or full email addresses.
