# Supabase Local Development

This project supports local Supabase development so schema changes, migrations, seed data, and agent-driven backend work can be tested locally before touching the hosted Supabase project.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (or a compatible runtime like Podman)
- [Supabase CLI](https://supabase.com/docs/reference/cli) — run `npx supabase --version` or install globally

## Starting Local Supabase

```bash
pnpm supabase:start
```

This starts all local Supabase services (Postgres, API, Auth, Storage, Studio, etc.) via Docker.

## Stopping Local Supabase

```bash
pnpm supabase:stop
```

## Inspecting Local URLs and Keys

```bash
pnpm supabase:status
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
pnpm dev
```

## Resetting the Database

Drops the local database, re-runs all migrations, and applies seed data:

```bash
pnpm db:reset
```

This is the recommended way to get a clean state after schema changes.

## Creating a New Migration

```bash
pnpm db:migration:new <descriptive-name>
```

This creates a new timestamped `.sql` file in `supabase/migrations/`. Write your DDL changes there.

After writing the migration, test it locally:

```bash
pnpm db:reset
npm run db:types
npm run dev
```

## Generating Database Types

Generate TypeScript types from the **local** database schema:

```bash
pnpm db-types
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
pnpm db:reset
LOCAL_TEST_USER_PASSWORD=<your-local-test-password> pnpm db:seed:auth
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
pnpm supabase:status
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
pnpm supabase:start
pnpm db:reset
LOCAL_TEST_USER_PASSWORD=<your-local-test-password> pnpm db:seed:auth
pnpm dev
```

Then log in with any of the test credentials above.

## Manual UI Testing

Convenience scripts are available for common local development workflows.

### Fresh Setup

Start local Supabase, reset the database, and create auth test users — everything in one command:

```bash
pnpm local:setup
```

### Daily Development

Start local Supabase and the dev server without wiping data:

```bash
pnpm local:dev
```

Open the app at the Vite URL (usually `http://localhost:5173`) and log in with:

| Email                   | Password      | Role  |
| ----------------------- | ------------- | ----- |
| `admin@example.local`   | `password123` | admin |
| `player1@example.local` | `password123` | user  |
| `player2@example.local` | `password123` | user  |
| `viewer@example.local`  | `password123` | user  |

Use these local-only users to test:

- Login/logout flow
- Authenticated routes
- Admin-only actions
- Player permissions
- Read-only or restricted behaviour
- RLS rules
- Realtime updates with multiple browser sessions

### Reset Everything

Wipe and reseed the local database and recreate auth users:

```bash
pnpm local:reset
```

### Supabase Studio

Inspect local data via the Supabase Studio. Start local Supabase, then open the Studio URL shown by `supabase:status` (usually `http://127.0.0.1:54323`):

```bash
pnpm supabase:status
```

### Stop

```bash
pnpm supabase:stop
```

## Pushing Migrations to Remote

**This is a manual, dangerous operation.** Do not run it unless explicitly requested.

```bash
pnpm db:push:remote
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

| Task                       | Command                        |
| -------------------------- | ------------------------------ |
| Full local setup           | `pnpm local:setup`             |
| Local dev (no wipe)        | `pnpm local:dev`               |
| Reset DB + auth            | `pnpm local:reset`             |
| Start local Supabase       | `pnpm supabase:start`          |
| Stop local Supabase        | `pnpm supabase:stop`           |
| Show local URLs/keys       | `pnpm supabase:status`         |
| Reset local DB             | `pnpm db:reset`                |
| Seed local auth users      | `pnpm db:seed:auth`            |
| Create migration           | `pnpm db:migration:new <name>` |
| Generate DB types          | `pnpm db-types`                |
| Push to remote (dangerous) | `pnpm db:push:remote`          |
| Supabase Studio            | http://127.0.0.1:54323         |
| Email testing (Inbucket)   | http://127.0.0.1:54324         |
