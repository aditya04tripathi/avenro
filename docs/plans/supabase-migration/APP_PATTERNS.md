# App patterns (phases 14–23)

Read this after README.md and before your phase file. These rules apply to every product page.

## Product north star

Avenro is a Jira alternative built to fix Jira's problems: better looking, friendlier, and more reductive. Every app phase follows these rules.

1. **Jira parity where it matters:** issue types (epic, story, task, bug, subtask per the `issue_type` enum), backlog, boards, sprints, workflows, filters, comments, dependencies, reports. Anything Jira users expect daily exists.
2. **Reductive by default:** a new issue needs only a title. Every other field has a sensible default and sits behind "More details". One primary action per screen. No setup screen is required before the first useful action. Each new field or setting needs a stated user reason in the commit message.
3. **Plain language:** no Jira jargon ("schemes", "screens", "permission schemes", "resolutions"). Use "workflow", "who can do what", "done". Microcopy follows `antislop-copywriting`.
4. **Undo over confirm:** reversible actions (move, edit, archive) apply at once and show an Undo toast. Confirm dialogs only for irreversible ones (delete account, purge).
5. **Friendly speed:** keyboard-first with ⌘K, inline editing, optimistic status changes, no full-page reloads for common edits.
6. **Better looking:** calm, spacious, consistent. `DESIGN.md` tokens, one accent color, soft depth, purposeful motion only. Each UI phase's acceptance includes before/after screenshots at 375 px and 1440 px, checked against `high-end-visual-design` and `emil-design-eng`.
7. **Migration path:** phase 23 adds a Jira CSV import (issues, types, statuses, assignees by email, sprints), so teams can switch without copying by hand. It uses server-side parsing and a preview before writing.

## Scrum roles

Workspace roles (OWNER, ADMIN, MEMBER, VIEWER) decide workspace access. Project roles decide Scrum accountabilities inside a project. A project role never grants workspace administration (CURRENT_STATE concern 10).

| Capability | PRODUCT_OWNER | SCRUM_MASTER | DEVELOPER | VIEWER | CLIENT |
| --- | --- | --- | --- | --- | --- |
| Read project | yes | yes | yes | yes | portal only |
| Create and edit issues, comment, estimate, change status | yes | yes | yes | no | no |
| Order backlog, set priority, accept done work | yes | no | no | no | no |
| Requirements, product goals, approve change requests | yes | no | no | no | no |
| Create, start and complete sprints; sprint scope changes | with SM | yes | no | no | no |
| Sprint goal | yes | yes | no | no | no |
| Meetings: schedule, facilitate, finalize minutes | yes | yes | yes (take minutes) | no | no |
| Retrospectives: run | no | yes | no | no | no |
| Retrospectives: give feedback | yes | yes | yes | no | no |
| Risks and impediments | yes | yes | yes | no | no |
| Workflow and board configuration | no | yes | no | no | no |
| Publish client portal items | yes | no | no | no | read published |

Workspace OWNER and ADMIN can manage project memberships and roles. They do not automatically get PO or SM capabilities: they assign roles, including to themselves.

Constraints, enforced in SQL:
- Exactly zero or one PRODUCT_OWNER per project, and zero or one SCRUM_MASTER. Enforce with a constraint trigger over the `roles` array. Starting a sprint requires both to be set.
- VIEWER and CLIENT are exclusive: if either is in the array, nothing else may be.
- PRODUCT_OWNER plus SCRUM_MASTER held by one person is allowed, but the UI warns ("Scrum recommends separating these accountabilities").
- The roles array is non-empty and has no duplicates.

RLS helpers: `private.project_roles(project uuid) returns public.project_role[]` and `private.has_project_role(project uuid, roles public.project_role[]) returns boolean` (true if the caller holds any of them). Write policies use them per the matrix. Template A's write check becomes: `private.can_write(workspace_id)` and the matrix capability.

## Build patterns

- **Routes:** `app/(app)/w/[workspaceSlug]/…` for the app, `app/(app)/w/[workspaceSlug]/p/[projectKey]/…` for projects, `app/portal/[workspaceSlug]/…` for clients. The `(app)` layout calls `requireMember()` on the server.
- **Data layer:** `lib/data/<entity>.ts` (`import "server-only"`), typed with `database.types.ts`, using only the user's server client so RLS decides. Cursor pagination, 50 rows per page. No Supabase browser client except for realtime, which no phase adds.
- **Mutations:** `actions/<entity>.ts` server actions. Each one parses with zod, calls one RPC or insert/update, maps errors to `{ ok: false, message }`, and calls `revalidatePath` on the affected route. Use `useOptimistic` only for status changes and reordering.
- **Permissions in the UI:** `lib/auth/capabilities.ts` mirrors the Scrum matrix from `private.project_roles` and hides or disables controls. RLS stays authoritative.
- **Read-only workspaces:** a banner, with every mutation control disabled and an explanation linking to billing. Export stays available.
- **Shell:** collapsible sidebar using `components/ui/sidebar`; the `cmdk` command palette on ⌘K/Ctrl+K (modifier shortcuts only, which satisfies WCAG 2.1.4); an inbox (notifications); breadcrumbs; a page header with one primary action.
- **Design:** tokens from `DESIGN.md` only. Dense tables with 40 px rows, skeletons for streaming, empty states with one action, motion ≤ 200 ms respecting reduced motion. Skills per UI phase: `high-end-visual-design`, `emil-design-eng`, `vercel-react-best-practices`, `antislop-ui`, `fixing-accessibility`, `baseline-ui`, `web-design-guidelines` as the final pass.
- **Client islands:** forms, dialogs, the command palette, the board drag-and-drop and charts. Heavy libraries (`@dnd-kit/*`, `recharts`) are loaded with `next/dynamic` only on the routes that use them.
- **Every phase's acceptance:** `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm db:test`. A browser-pane walkthrough as each relevant role (seed users in `supabase/seed.sql`: owner, PO, SM, developer, viewer, client) proves the matrix. A keyboard-only pass of the new pages. First Load JS for the new routes recorded.
