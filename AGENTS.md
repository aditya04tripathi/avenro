# AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Code Formatting & Prettier

- Every change must strictly adhere to the root `prettier.config.mjs`.
- Import sorting is enforced via `@trivago/prettier-plugin-sort-imports`. Import order:
  1. `^(react/(.*)$)|^(react$)`
  2. `^(next/(.*)$)|^(next$)`
  3. `<THIRD_PARTY_MODULES>`
  4. `^@/(.*)$`
  5. `^[./]`
- Always run `pnpm format` after making changes to verify formatting and import ordering.

## Supabase

- Migrations live in `supabase/migrations`. Start the local stack with `pnpm db:start`; reset the local database with `pnpm db:reset` (local CLI stack only).
- Types are generated with `pnpm db:types`. Never edit generated types by hand.
- RLS is required on every table.

## TypeScript LSP

- Symptom: the `LSP` tool fails with `plugin:typescript-native-lsp:typescript crashed with exit code 1`.
- Cause: the repo root had no `typescript` package. The root `node_modules` was empty, so the language server started from the root could not find a TypeScript install.
- Fix: `typescript` is a root devDependency. Run `pnpm install` at the root after cloning. `LSP findReferences` works after that.
