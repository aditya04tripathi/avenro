# AGENTS.md

## Code Formatting & Prettier

- Every change must strictly adhere to the monorepo's Prettier configurations (`packages/prettier-config`, `apps/api/prettier.config.mjs`, and `apps/web/prettier.config.mjs`).
- Import sorting is enforced via `@trivago/prettier-plugin-sort-imports`.
- Import order in `apps/api`:
  1. `^@nestjs/(.*)$`
  2. `^@prisma/(.*)$`
  3. `<THIRD_PARTY_MODULES>`
  4. `^src/(.*)$`
  5. `^@/(.*)$`
  6. `^[./]`
- Import order in `apps/web`:
  1. `^(react/(.*)$)|^(react$)$`
  2. `^(next/(.*)$)|^(next$)$`
  3. `<THIRD_PARTY_MODULES>`
  4. `^@/(.*)$`
  5. `^[./]`
- Always run `pnpm format` (or package-specific format script) after making changes to verify formatting and import ordering.

## Prisma Configuration & Guidelines

- Prisma schema is in `apps/api/prisma/schema.prisma` and runtime config in `apps/api/prisma7.config.ts`.
- Prisma client generation target is `apps/api/src/generated/prisma`.
- Do not edit generated files manually. Update the schema and generate via `pnpm --filter api exec prisma generate`.
- Do not run destructive database operations without explicit approval.

## Backend agent handoffs

For work under `apps/api`, every implementing/reviewing agent must read `apps/api/AGENTS.md` and `apps/api/.agents/MEMORY.md`, and use the `nestjs-docs` skill. Instruct every authorized backend handoff to use the `nestjs-docs` skill.
