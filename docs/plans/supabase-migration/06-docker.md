# Phase 06 — Serve locally through Docker

Read [README.md](README.md) first: its global rules, decisions and verified facts apply to every step here. Start only after phase 05 is committed.

Skills: `karpathy-guidelines`. Read `02-guides/self-hosting.md` and `01-getting-started/17-deploying.md` in the Next docs.

Steps:
1. `next.config.ts`: `output: "standalone"`.
2. `Dockerfile`, multi-stage on an exact Node LTS alpine tag that matches `engines`/local Node (verify the tag exists on Docker Hub; never `latest`): `deps` (`corepack enable`, `pnpm install --frozen-lockfile`), `builder` (build args `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`; `pnpm build`), `runner` (non-root `node` user, copy `.next/standalone`, `.next/static`, `public`, `ENV HOSTNAME=0.0.0.0 PORT=3000`, `CMD ["node","server.js"]`).
3. `.dockerignore`: `node_modules`, `.next`, `.git`, `.env*` (except `.env.example`), `third-party`, `supabase/.temp`, `docs`.
4. `docker-compose.yml`: one service `web`, build args from `.env`, runtime env `SUPABASE_URL=http://host.docker.internal:54321`, `SUPABASE_SECRET_KEY`, `UNSUBSCRIBE_TOKEN_SECRET`, `SITE_URL=http://localhost:3000`; `extra_hosts: ["host.docker.internal:host-gateway"]`; ports `3000:3000`; healthcheck `wget -qO- http://127.0.0.1:3000/api/health`.
5. `app/api/health/route.ts`: returns `{ status: "ok" }`; no database call (Supabase has its own health).
6. README "Run locally": `pnpm db:start`, copy `.env.example` → `.env` and fill keys from `pnpm exec supabase status -o env`, `docker compose up --build`, open `http://localhost:3000`.

Acceptance: `docker compose up --build` serves the site; sign-up and sign-in work inside the container (proves the cookie-name fix); healthcheck is healthy; container runs as non-root (`docker compose exec web id -u` ≠ 0).

## Amendment 2 (5 Nov 2026) — overrides earlier steps where they conflict

compose adds service `cron` (`alpine:3` + `curl`, `crond`, hourly `POST http://web:3000/api/cron/run` with header `Authorization: Bearer $CRON_SECRET`). Env gains `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `TRIAL_CLAIM_SECRET`, `CRON_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` (local: Supabase's Mailpit SMTP at `host.docker.internal:54325`, no auth). README run steps add `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
