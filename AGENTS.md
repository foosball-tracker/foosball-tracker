# AGENTS.md

## Stack

- Solid.js SPA built with Vite
- Supabase for auth, database, and realtime updates
- Tailwind CSS + DaisyUI for styling
- TypeScript, ESLint, Prettier, Husky

## Common Commands

- Install: `npx pnpm@10 install`
- Dev server: `npx pnpm@10 dev`
- Build: `npx pnpm@10 build`
- Lint: `npx pnpm@10 lint`
- Format check: `npx pnpm@10 format:check`
- Format: `npx pnpm@10 format`
- Regenerate Supabase DB types: `npx pnpm@10 db-types`

## Figma Design

- Design file: https://www.figma.com/design/FNBuLTXbRtAAweZuF1nrxi/FoosBall-Tracker

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

**USE SOLIDJS AS IMPLEMENTED IN THIS EXISTING PROJECT.**

Before changing SolidJS code, consult the official Solid docs via:
https://docs.solidjs.com/llms.txt

Prefer official Solid patterns over React-like patterns.

Important rules:

- Do not use React dependency arrays with `createEffect`/`createMemo`.
- Access signals as functions, for example `count()`, not `count`.
- Use `onCleanup` for subscriptions, timers, event listeners, and WebSocket cleanup.
- Prefer `createMemo` for derived reactive values.
- Avoid destructuring props in a way that loses reactivity.
- Follow the existing project style, folder structure, routing setup, and component patterns.
- Do not introduce a new UI library or state library unless the project already uses it.
- If unsure, search the Solid docs first and cite the relevant doc section in your reasoning.

## Working Rules

- Prefer small focused changes over broad refactors.
- Keep Supabase-related changes typed and centralized in `src/service`.
- Preserve the existing service/store split instead of moving data access into components.
- For UI changes, follow [`docs/ai-ui-workflow.md`](./docs/ai-ui-workflow.md) exactly.
- For UI changes, verify both desktop and mobile layouts.
- For UI changes, publish PR proof screenshots with `npx pnpm@10 proof:capture` and `npx pnpm@10 proof:publish`, then verify the PR comment links render correctly before the PR is ready for review.
- Run lint and build before opening a PR.
- Avoid editing generated types manually unless the generation flow is broken.

## Workflow

For the full end-to-end guide (branch naming, PR creation, preview deploys, Codex review, SonarQube checks, merge), see [`WORKFLOW.md`](./WORKFLOW.md).

## Environment Notes

- The app expects Supabase environment variables in local development.
- The `db-types` command depends on Supabase CLI access and project credentials.
- If dependency upgrades require a newer Node runtime than the host default, use a transient newer Node for verification instead of changing project code to match the old runtime.
- `SONARQUBE_TOKEN` is loaded from `~/.secrets/sonarqube_token` via the T3 systemd env file (`~/.config/t3-code/env`). Never hardcode it in the repo.

## SonarQube MCP

- Connected via the remote MCP server at `https://api.sonarcloud.io/mcp`.
- Auth uses `Bearer {env:SONARQUBE_TOKEN}` through OpenCode env expansion.
- Default project key: `foosball-tracker_foosball-tracker` (set via `SONARQUBE_PROJECT_KEY` header).
- Organization: `foosball-tracker`.
- Read-only mode is enabled (`SONARQUBE_READ_ONLY: true`).

### Workflow after pushing / creating a PR

1. Push your branch and open (or update) a PR on GitHub.
2. Wait a few minutes for the SonarCloud CI analysis to complete.
3. Use the SonarQube MCP tools to check the PR:
   - `sonarqube_list_pull_requests` to find the PR key.
   - `sonarqube_search_sonar_issues_in_projects` with `pullRequestId` to see new issues introduced by the PR.
   - `sonarqube_get_project_quality_gate_status` with `pullRequest` to verify the quality gate passes.
   - `sonarqube_search_security_hotspots` with `pullRequest` to review any security hotspots on the PR.
4. Fix any issues that block the quality gate or are significant, then push again.
5. Ignore issues in generated files (e.g. `src/types/database.ts`) unless the generation flow is broken.

## MCP & Skills

- A Supabase MCP server is configured in `opencode.json` and a [Supabase skill](./.agents/skills/supabase/SKILL.md) is available locally.
- You can use these to inspect, query, or check the project's Supabase instance directly (database, docs, debugging, development, functions, branching, storage).
- **For any real changes or modifications to the Supabase project** (schema changes, migrations, data mutations, RLS policies, etc.), ask the user first before making the change.
- A [DaisyUI skill](./.agents/skills/daisyui/SKILL.md) is available locally for component design guidance.
- Playwright MCP is configured for both Codex and OpenCode through `.codex/playwright-mcp-launcher.mjs`. If you change MCP config, restart the session before retesting because local MCP servers do not reliably hot-reload.
