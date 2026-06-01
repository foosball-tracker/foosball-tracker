# Supabase Local Development

This project supports local Supabase development so schema changes, migrations, seed data, and agent-driven backend work can be tested locally before touching the hosted Supabase project.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (or a compatible runtime like Podman)
- [Supabase CLI](https://supabase.com/docs/reference/cli) — run `npx supabase --version` or install globally

## Starting Local Supabase

```bash
npx pnpm@10 supabase:start
```

This starts all local Supabase services (Postgres, API, Auth, Storage, Studio, etc.) via Docker.

## Stopping Local Supabase

```bash
npx pnpm@10 supabase:stop
```

## Inspecting Local URLs and Keys

```bash
npx pnpm@10 supabase:status
```

This prints the local environment variables needed to connect:

- `API URL` — `http://127.0.0.1:54321`
- `GraphQL URL` — `http://127.0.0.1:54321/graphql/v1`
- `DB URL` — `postgresql://postgres:postgres@127.0.0.1:<port>/postgres`
- `Studio URL` — `http://127.0.0.1:54323`
- `Inbucket URL` — `http://127.0.0.1:54324`
- `JWT secret` — used for signing tokens
- `anon key` — the publishable API key; use this in `.env`

## Connecting the App to Local Supabase

Update your `.env` file with the local values:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<local-anon-key-from-supabase-status>
VITE_SUPABASE_PROJECT_ID=foosball-tracker
VITE_CONTEXT=local
```

Then start the dev server as usual:

```bash
npx pnpm@10 dev
```

## Resetting the Database

Drops the local database, re-runs all migrations, and applies seed data:

```bash
npx pnpm@10 db:reset
```

This is the recommended way to get a clean state after schema changes.

## Creating a New Migration

```bash
npx pnpm@10 db:migration:new <descriptive-name>
```

This creates a new timestamped `.sql` file in `supabase/migrations/`. Write your DDL changes there.

After writing the migration, test it locally:

```bash
npx pnpm@10 db:reset
npm run db:types
npm run dev
```

## Generating Database Types

Generate TypeScript types from the **local** database schema:

```bash
npx pnpm@10 db-types
```

This writes the types to `src/types/database.ts`. Run this after any schema change.

## Seed Data

`supabase/seed.sql` contains sample data for local development. It runs automatically after `db reset`.

The seed includes:

- 4 sample players (Alice, Bob, Charlie, Diana)
- 2 custom multi-player teams (Dream Team, Underdogs)
- 2 completed matches with goals
- 1 in-progress match

## Local Auth Test Users

The local database ships with no auth users (the app schema seed covers players, teams, and matches). To test authentication, RLS policies, and permission behaviour locally, run the auth seed script after `db:reset`:

```bash
npx pnpm@10 db:reset
npx pnpm@10 db:seed:auth
```

This creates four confirmed test users via the Supabase Auth Admin API (using the **local service role key only**). The script is idempotent and safe to run repeatedly.

### Test Credentials

| Email                   | Password      | Role  |
| ----------------------- | ------------- | ----- |
| `admin@example.local`   | `password123` | admin |
| `player1@example.local` | `password123` | user  |
| `player2@example.local` | `password123` | user  |
| `viewer@example.local`  | `password123` | user  |

### How It Works

The script:

1. Refuses to run unless `SUPABASE_URL` points to `127.0.0.1` or `localhost`.
2. Reads the local service role key from `SUPABASE_SERVICE_ROLE_KEY`.
3. Creates confirmed users with fixed deterministic credentials via `supabase.auth.admin.createUser`.
4. Upserts matching `profiles` rows (including `is_admin` for the admin user).
5. Is idempotent — repeated runs skip already-existing users.

### Environment Setup

The script needs the local service role key. Get it from `supabase status`:

```bash
npx pnpm@10 supabase:status
```

Then export it before running the auth seed:

```bash
export SUPABASE_SERVICE_ROLE_KEY=<service_role-key-from-status>
```

Or create a `.env` file (which must not be committed) with:

```env
SUPABASE_SERVICE_ROLE_KEY=<local-service-role-key>
```

### Testing Workflow

```bash
npx pnpm@10 supabase:start
npx pnpm@10 db:reset
npx pnpm@10 db:seed:auth
npx pnpm@10 dev
```

Then log in with any of the test credentials above.

## Pushing Migrations to Remote

**This is a manual, dangerous operation.** Do not run it unless explicitly requested.

```bash
npx pnpm@10 db:push:remote
```

For normal development, migrations are applied to the Supabase preview branch automatically when a PR is opened (via Supabase Git integration). A direct push should only be used when:

1. The migration has been thoroughly tested locally.
2. There is no active PR (which would conflict).
3. The user has explicitly asked for a remote push.

## Security Rules

- **Never commit** `.env` files or service role keys.
- The `.env.example` file provides templates only (no real secrets).
- Production service role keys must never be exposed to the coding agent.
- The local service role key (`supabase_service_role_key` from `supabase status`) may only be used for local scripts and testing.
- All Supabase MCP queries should target the local instance when it is running.

## Quick Reference

| Task                       | Command                               |
| -------------------------- | ------------------------------------- |
| Start local Supabase       | `npx pnpm@10 supabase:start`          |
| Stop local Supabase        | `npx pnpm@10 supabase:stop`           |
| Show local URLs/keys       | `npx pnpm@10 supabase:status`         |
| Reset local DB             | `npx pnpm@10 db:reset`                |
| Seed local auth users      | `npx pnpm@10 db:seed:auth`            |
| Create migration           | `npx pnpm@10 db:migration:new <name>` |
| Generate DB types          | `npx pnpm@10 db-types`                |
| Push to remote (dangerous) | `npx pnpm@10 db:push:remote`          |
| Supabase Studio            | http://127.0.0.1:54323                |
| Email testing (Inbucket)   | http://127.0.0.1:54324                |
