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

## Repo Structure

- `src/routes`: route definitions and page entry points
- `src/components`: UI components, auth, players, teams, and shared widgets
- `src/service`: Supabase client setup and service-layer API calls
- `src/store`: local application/game state
- `src/types`: shared types, including generated database types
- `.github/workflows`: CI configuration

## Working Rules

- Prefer small focused changes over broad refactors.
- Keep Supabase-related changes typed and centralized in `src/service`.
- Preserve the existing service/store split instead of moving data access into components.
- Run lint and build before opening a PR.
- Avoid editing generated types manually unless the generation flow is broken.

## Environment Notes

- The app expects Supabase environment variables in local development.
- The `db-types` command depends on Supabase CLI access and project credentials.
- If dependency upgrades require a newer Node runtime than the host default, use a transient newer Node for verification instead of changing project code to match the old runtime.
