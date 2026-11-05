# Phase 20 — Documents and requirements

Read [README.md](README.md), then [APP_PATTERNS.md](APP_PATTERNS.md), first. Start only after phase 19 is committed.

Goal: folders, documents with versions, file uploads to the `workspace-files` bucket, requirements linked to issues.

Tables covered: `document_folder`, `project_document`, `document_version`, `requirement`, `storage_object`.

Skills: `high-end-visual-design`, `emil-design-eng`, `vercel-react-best-practices`, `antislop`, `antislop-code`, `antislop-copywriting`, `antislop-ui`, `antislop-layoutmobile`, `fixing-accessibility`, `karpathy-guidelines`; `baseline-ui` and `web-design-guidelines` as the final pass.

Steps:
1. For each table above, read its columns in `database.types.ts` and its RLS policies in `supabase/migrations/*_rls.sql`. Use `LSP` to find existing helpers before writing new ones.
2. Write `lib/data/<entity>.ts` query functions (server-only, paginated) and `actions/<entity>.ts` server actions (zod, one write each, `revalidatePath`), copying the phase 15 pattern. Gate controls with `lib/auth/capabilities.ts` per the Scrum matrix.
3. Build the pages and components for the goal above under the `app/(app)/w/[workspaceSlug]/…` routes. Follow the north star: a title-only create, "More details" for the rest, one primary action per screen, Undo toasts, plain language, inline editing.
4. Add the empty state, loading skeleton (`loading.tsx`), error state (`error.tsx`) and read-only state for every page.
5. Extend `supabase/seed.sql` with realistic sample rows for these tables (no real people's data), and extend `supabase/tests/` with pgTAP cases for any policy this phase depends on.
6. Add entries to the ⌘K command palette for the new pages and create actions.

Acceptance:
- `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm db:test` pass.
- In the browser pane, signed in as each seed role (owner, PO, SM, developer, viewer, client), every capability in the Scrum matrix that touches these tables behaves as the matrix says. Record a pass or fail table in the commit message.
- Keyboard-only walkthrough of every new page passes; contrast passes.
- Screenshots at 375 px and 1440 px are saved to `docs/screenshots/phase-20/` and match `DESIGN.md`.
- First Load JS per new route is recorded in the commit message; no route imports `recharts` or `@dnd-kit` unless it needs them.
