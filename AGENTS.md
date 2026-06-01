# AGENTS.md

## For Every Feature or Change

**ALWAYS follow [`WORKFLOW.md`](./WORKFLOW.md)** from start to finish. It covers branch naming, commits, pre-commit checks, PR creation, Codex review, SonarQube checks, and merge. Do not skip steps or invent your own workflow.

For UI changes, also follow [`docs/ai-ui-workflow.md`](./docs/ai-ui-workflow.md) exactly — including Playwright inspection at both viewports, proof capture, and proof publication.

## Stack

- Solid.js SPA built with Vite
- Supabase for auth, database, and realtime updates
- Tailwind CSS + DaisyUI for styling
- TypeScript, ESLint, Prettier, Husky

## Common Commands

- Install: `pnpm install`
- Dev server: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Format check: `pnpm format:check`
- Format: `pnpm format`
- Regenerate Supabase DB types: `pnpm db-types`
- Start local Supabase: `pnpm supabase:start`
- Reset local DB (re-runs migrations + seed): `pnpm db:reset`
- UI proof capture: `pnpm proof:capture -- --name <name> --route <route>`
- UI proof publish: `pnpm proof:publish`

The project uses pnpm via Corepack (see `packageManager` in `package.json`). Run `corepack enable` once if `pnpm` is not found. Do not use `npx pnpm@10` — use `pnpm` directly.

## Repo Structure

- `src/routes`: route definitions and page entry points
- `src/components`: UI components, auth, players, teams, and shared widgets
- `src/service`: Supabase client setup and service-layer API calls
- `src/store`: local application/game state
- `src/types`: shared types, including generated database types
- `.github/workflows`: CI configuration

## Design System

For all UI/design work, read DESIGN.md first. Use Impeccable for planning, critique, polish, and design quality checks. Preserve the existing DaisyUI/Tailwind design system. Do not introduce new visual styles, colours, spacing, shadows, fonts, or UI libraries unless explicitly requested.

When implementing a new screen, component, layout, or visual design, use the Impeccable workflow together with DESIGN.md. Start by inspecting similar existing UI, then plan the UI, implement it with existing components and DaisyUI semantic classes, critique it, polish it, and check desktop/mobile screenshots where possible.

Impeccable skills are installed at `.agents/skills/impeccable/` (for OpenCode/local agents) and `.github/skills/impeccable/` (for Codex). Run `node .agents/skills/impeccable/scripts/context.mjs` at the start of any design session to load PRODUCT.md and DESIGN.md context.

## SolidJS Guidelines

**Use SolidJS as implemented in this existing project.** Consult https://docs.solidjs.com/llms.txt before changing SolidJS code.

- Do not use React dependency arrays with `createEffect`/`createMemo`.
- Access signals as functions: `count()`, not `count`.
- Use `onCleanup` for subscriptions, timers, event listeners, and WebSocket cleanup.
- Prefer `createMemo` for derived reactive values.
- Avoid destructuring props in a way that loses reactivity.
- Follow existing project style, folder structure, routing setup, and component patterns.
- Do not introduce a new UI library or state library unless the project already uses it.

## Supabase Local-First Workflow

- Use the local Supabase instance by default (start with `pnpm supabase:start`).
- Connect to `http://127.0.0.1:54321` with the local anon key from `pnpm supabase:status`.
- Never use production service role keys.
- Test migration changes with `pnpm db:reset`.
- Regenerate types after schema changes with `pnpm db-types`.
- Avoid remote writes unless explicitly requested by the user.
- Do not run `supabase db push` unless the user explicitly asks.
- All Supabase MCP queries should target the local instance when it is running.

## Working Rules

- Prefer small focused changes over broad refactors.
- Keep Supabase changes typed and centralized in `src/service`.
- Preserve the existing service/store split.
- Avoid editing generated types manually unless the generation flow is broken.
- **Ask the user before any Supabase schema change, migration, data mutation, or RLS policy change.**
- Run lint and build before pushing.
- Never hardcode secrets or tokens. `SONARQUBE_TOKEN` is loaded from `~/.secrets/sonarqube_token`.

## MCP & Skills

- **Supabase MCP**: inspect, query, or check the Supabase instance. A [skill](./.agents/skills/supabase/SKILL.md) is available.
- **DaisyUI skill**: available at [.agents/skills/daisyui/SKILL.md](./.agents/skills/daisyui/SKILL.md).
- **SonarQube MCP**: connected to `https://api.sonarcloud.io/mcp`. Project key: `foosball-tracker_foosball-tracker`. Usage steps are in WORKFLOW.md step 11.
- **Playwright MCP**: configured via `.codex/playwright-mcp-launcher.mjs`. Restart session after MCP config changes.
