# Phase 00 — Prep and safety

Read [README.md](README.md) first: its global rules, decisions and verified facts apply to every step here.

Skills: `karpathy-guidelines`, `create-design-md`.

Uncommitted work on `main` (decided 5 Nov 2026, owner delegated the call): keep all of it. It is the state this plan was written against: auth pages, `actions/`, `components/shared/`, the new `components/ui/*`, hooks, `lib/highlighter.tsx`, `.claude/skills/`, the auth background images, the deleted `components/logo.tsx` and the deleted nested `apps/web/pnpm-*` files. Nothing in it is harmful; formatting drift in `apps/web/tsconfig.json` is fixed by `pnpm format` in phase 02.

Steps:
1. `git switch chore/supabase-migration` (the branch already exists and holds this plan; uncommitted changes carry over). Run `git add -A`, then confirm no secret is staged: `git diff --cached --name-only | grep -E '(^|/)\.env($|\.)' | grep -v '\.env\.example$'` must print nothing, and `.claude/settings.local.json` must not appear. Commit as `chore: snapshot web work before Supabase migration`.
2. Create a filesystem snapshot outside the repo: `tar --exclude=node_modules --exclude=.next --exclude=third-party -czf ../avenro-pre-supabase-$(date +%Y%m%d).tgz .`. Verify with `tar -tzf … | head`.
3. Copy skills into the repo (read each `SKILL.md` and any scripts before copying; do not copy a skill whose scripts make network calls without telling the owner):
   - from `~/.gemini/config/skills/`: `high-end-visual-design`;
   - from `~/.agents/skills/`: `emil-design-eng`, `vercel-react-best-practices`, `vercel-react-view-transitions`, `web-design-guidelines`, `writing-for-agents`, `stripe-apps`, `stripe-best-practices`, `stripe-directory`, `stripe-docs`, `stripe-pay`, `stripe-projects`.
   Command per skill: `cp -R ~/.agents/skills/<name> .claude/skills/<name>`. The Stripe skills are reference for the future paid-plan release gate only; no phase adds Stripe code.
4. Make the TypeScript LSP work. On 5 Nov 2026 the `LSP` tool failed with `plugin:typescript-native-lsp:typescript crashed with exit code 1` for every call. Diagnose (plugin log, whether `typescript` resolves from the repo root, whether the native server binary is installed), fix it with the smallest change, and record the cause and fix in `AGENTS.md`. Re-check after phase 02 moves the app to the root.
5. Run `create-design-md` on `apps/web` and save `DESIGN.md` at repo root. It must capture the tokens in `apps/web/app/globals.css`, fonts (Rubik heading, Public Sans body, Geist Mono), radii, spacing used in `components/marketing/*`, button variants and the header/footer pattern. Every later UI phase must follow `DESIGN.md`.

Acceptance: branch exists; archive lists files; 12 new skill folders under `.claude/skills/`; `LSP findReferences` on `AvenroLogo` (`components/avenro-logo.tsx:29`) returns the header, footer and shared header usages; `DESIGN.md` exists and names every color token in `:root` and `.dark`.
