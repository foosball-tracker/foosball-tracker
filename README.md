# Foosball Tracker

Real-time foosball match tracking built with Solid.js, Supabase, and Playwright.

## What It Does

- Tracks matches, players, teams, and score events
- Syncs live updates through Supabase Realtime
- Supports local-first development with a disposable Supabase stack
- Includes Playwright flows for local auth, UI proof capture, and hosted repro

Scoring is event-based: sensors and the web UI submit events, and the backend derives the valid score from those events. See [docs/event-based-scoring.md](./docs/event-based-scoring.md).

## Stack

- Solid.js + Vite
- TypeScript
- Tailwind CSS + DaisyUI
- Supabase Auth, Database, and Realtime
- Playwright

## Setup

This repo uses the Node version in [`.nvmrc`](./.nvmrc) and the `pnpm` version pinned in [`package.json`](./package.json).

```bash
nvm use
corepack enable
pnpm install
```

Common commands:

```bash
pnpm local:setup
pnpm local:dev
pnpm auth:local
pnpm test:e2e
pnpm test:e2e:auth
pnpm lint
pnpm build
```

## Environment Model

There are two supported app environments:

1. `local`
   Runs the app on localhost against the local Supabase stack. This is the default for development, schema work, Playwright auth, E2E, and proof capture.
2. `hosted`
   Runs the app on localhost but injects hosted Supabase values from `.env`. This is only for manual reproduction against the real hosted project.

Use the committed env templates as references:

- [`/.env.example`](/home/josh/coding/foosball-tracker/.env.example)
- [`/.env.local.example`](/home/josh/coding/foosball-tracker/.env.local.example)

Details live in [docs/supabase-local-dev.md](./docs/supabase-local-dev.md).

## Local Development

For the normal local-first flow:

```bash
pnpm local:setup
pnpm local:dev
```

That starts local Supabase, resets and seeds the database, creates local auth users, and serves the app locally.

Default local auth users live in [docs/supabase-local-dev.md](./docs/supabase-local-dev.md).

## Hosted Reproduction

To reproduce a bug locally against hosted Supabase:

```bash
pnpm local:hosted
```

This still serves the app locally. Only the Supabase backend changes.

Use this path for manual debugging only. Do not use it for normal E2E, proof capture, or local UI signoff.

## Playwright Auth Files

There are two saved browser auth states:

- `pnpm auth:local` -> `playwright/.auth/user.json`
- `pnpm auth:prod` or `pnpm auth:hosted` -> `playwright/.auth/user.hosted.json`

`auth:local` signs in with the seeded local account on port `4174`.

`auth:prod` signs in to hosted Supabase through a local app on port `4175`, so it cannot accidentally reuse the local inspect server.

## Testing And UI Proof

Anonymous and authenticated E2E:

```bash
pnpm test:e2e
pnpm test:e2e:auth
```

UI proof flow:

```bash
pnpm ui:inspect:start
pnpm proof:capture -- --name <name> --route <route>
pnpm proof:publish
```

For the exact required UI workflow, use [docs/ai-ui-workflow.md](./docs/ai-ui-workflow.md).

## Schema Work

Use the local Supabase stack by default:

```bash
pnpm supabase:start
pnpm db:migration:new <name>
pnpm db:reset
pnpm db-types
```

Migrations are deployed to production automatically via Supabase GitHub integration when PRs are merged to `main`. No manual `supabase db push` is needed.

Ask before any schema, migration, RLS, or non-local data change. Full guidance lives in [docs/supabase-local-dev.md](./docs/supabase-local-dev.md) and [AGENTS.md](./AGENTS.md).

## Deployment

Netlify deploys the app from `main` and opens deploy previews for pull requests. Supabase preview branches are created automatically for PRs.

## Contributing

Follow [WORKFLOW.md](./WORKFLOW.md) for the full branch, PR, review, SonarQube, and merge process.
