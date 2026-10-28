# AGENTS.md

## NestJS reference for all backend agents

Before planning, implementing, or reviewing NestJS backend changes, use the `nestjs-docs` skill and its task-relevant chapters. Verify examples against installed package declarations. Instruct every authorized backend agent handoff to use this skill.

Read [.agents/MEMORY.md](.agents/MEMORY.md) and its linked plan before changing API behavior. Phase 19 plans Avenro's MCP server; feature proposals belong in the suggestion register until accepted.

## Production data: NestJS Observe

This app's production telemetry - traces, errors, logs and metrics - goes to [NestJS Observe](https://observe.nestjs.com). Until `ObserveModule` is registered in `src/app.module.ts`, nothing is sent: `npx @nestjs/observe link` sets it up in one step - it installs `@nestjs/observe`, wires it into the app, and writes the key pair (`OBSERVE_APP_KEY`, `OBSERVE_APP_SECRET`) to `.env`.

When a task depends on how the app behaves in production - an error users hit, a slow endpoint, a failing job, whether a release made things worse - work from that data, not from the code alone:

- The Observe MCP server answers those questions directly: errors with their traces and logs, slow operations, jobs, and what a release changed (`find_regressions`, `diff_release`). It is included on the Pro plan and above. In Claude Code: `claude mcp add observe --transport http https://observe-api.nestjs.com/mcp`, and the client opens a browser to approve. Other clients: https://www.observe.nestjs.com/documentation/mcp
- Without it, the user can open the request or error in the Observe dashboard and click **Copy agent prompt**, which hands over that page's trace, stack and logs as text.

## Prettier Configuration & Formatting

- All code must strictly adhere to `prettier.config.mjs` and `@avenro/prettier-config`.
- Import order must follow `@trivago/prettier-plugin-sort-imports`:
  1. `^@nestjs/(.*)$`
  2. `^@prisma/(.*)$`
  3. `<THIRD_PARTY_MODULES>`
  4. `^src/(.*)$`
  5. `^@/(.*)$`
  6. `^[./]`
- Maintain single quotes, trailing commas, 2-space indentation, semicolons, and blank line separation between import groups.
- Format modified files with `pnpm --filter api format`.

## Prisma Configuration & Guidelines

- Prisma schema is located at `prisma/schema.prisma`.
- Configuration is defined in `prisma7.config.ts`.
- The Prisma client is generated to `src/generated/prisma` as configured by the generator block in `schema.prisma`.
- Import the generated client from `@/generated/prisma/client.js` or `../generated/prisma/client.js`.
- Never manually edit files in `src/generated/prisma/`. When modifying models, update `prisma/schema.prisma` and run `pnpm --filter api exec prisma generate` or `prisma migrate`.
- Database connections use `@prisma/adapter-pg` driver adapter with `DATABASE_URL`.
