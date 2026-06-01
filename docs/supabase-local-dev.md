# Supabase Local Development

Use the local Supabase stack for day-to-day development, schema work, E2E tests, and UI proof capture. The local environment is temporary and safe to mutate, so it is the right place for resets, seed data, auth users, and test-only cleanup.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) or a compatible runtime such as Podman
- [Supabase CLI](https://supabase.com/docs/reference/cli)

## Core Commands

| Task                     | Command                | Notes                                                      |
| ------------------------ | ---------------------- | ---------------------------------------------------------- |
| Start local Supabase     | `pnpm supabase:start`  | Starts Postgres, Auth, Storage, Studio, and API locally    |
| Stop local Supabase      | `pnpm supabase:stop`   | Stops the local stack                                      |
| Show local URLs and keys | `pnpm supabase:status` | Prints the local env values for `.env.local` or shell use  |
| Reset local DB           | `pnpm db:reset`        | Reapplies migrations and seed data                         |
| Fresh local setup        | `pnpm local:setup`     | Starts Supabase, resets the DB, and seeds local auth users |
| Daily local app dev      | `pnpm local:dev`       | Boots the app against the local Supabase stack             |
| Reset data and auth      | `pnpm local:reset`     | Re-seeds auth users after a DB reset                       |

## Local App Environment

`pnpm local:dev` resolves the local Supabase URL and anon key automatically, then launches Vite against the local stack. That means you do not need to edit `.env` to work locally.

If you want to run `pnpm dev` manually, first start local Supabase and copy the values from `pnpm supabase:status` into your shell or a temporary local env file:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<local-anon-key-from-supabase-status>
VITE_SUPABASE_PROJECT_ID=foosball-tracker
VITE_CONTEXT=local
```

## Auth Test Users

The local database ships without auth users. Seed the local test users after a reset:

```bash
pnpm local:setup
```

If the stack is already running and you only need to refresh auth users:

```bash
pnpm local:reset
```

You can override the default password with `LOCAL_TEST_USER_PASSWORD=...`. If omitted, the helper scripts use `password123`.

### Test Accounts

| Email                   | Password      | Role  |
| ----------------------- | ------------- | ----- |
| `admin@example.local`   | `password123` | admin |
| `player1@example.local` | `password123` | user  |
| `player2@example.local` | `password123` | user  |
| `viewer@example.local`  | `password123` | user  |

## Migration Workflow

1. Ask the user before any schema change, migration, RLS policy change, or data mutation that is not clearly local-only.
2. Start or confirm the local Supabase stack:
   ```bash
   pnpm supabase:start
   ```
3. Create a migration:
   ```bash
   pnpm db:migration:new <descriptive-name>
   ```
4. Write the SQL migration in `supabase/migrations/`.
5. Test the migration locally:
   ```bash
   pnpm db:reset
   pnpm db-types
   ```
6. Verify the app against the local stack:
   ```bash
   pnpm local:dev
   ```

## Database Types

Generate TypeScript database types from the local schema:

```bash
pnpm db-types
```

This writes `src/types/database.ts`. Regenerate types after any schema change.

## Local Testing Workflow

- Use `pnpm local:dev` for day-to-day manual testing.
- Use `pnpm test:e2e` and `pnpm test:e2e:auth` against the local stack for automated UI coverage.
- Use `pnpm auth:local` to create local Playwright browser auth state before authenticated E2E or proof capture.
- Use `pnpm proof:capture` and `pnpm proof:publish` to capture and publish screenshots from the local authenticated session.

The local auth state lives in `playwright/.auth/user.json`. Regenerate it whenever the local auth users or local origin change.

## Supabase Studio

Open the Studio URL shown by `pnpm supabase:status` if you want to inspect local tables, auth users, or storage records.

## Pushing Migrations to Remote

Do not run this unless the user explicitly asks:

```bash
pnpm db:push:remote
```

For normal development, migrations are applied to the preview branch automatically when a PR is opened via Supabase Git integration. A direct push is only appropriate when the migration has been tested locally and there is no active PR conflict.

## Security Rules

- Never commit `.env` files or service role keys.
- Never expose production service role keys to the coding agent.
- The local service role key from `pnpm supabase:status` may only be used for local scripts and testing.
- All Supabase MCP queries should target the local instance when it is running.

## Quick Reference

| Task                      | Command                                               |
| ------------------------- | ----------------------------------------------------- |
| Full local setup          | `pnpm local:setup`                                    |
| Local dev                 | `pnpm local:dev`                                      |
| Reset DB + auth           | `pnpm local:reset`                                    |
| Start local Supabase      | `pnpm supabase:start`                                 |
| Stop local Supabase       | `pnpm supabase:stop`                                  |
| Show local URLs/keys      | `pnpm supabase:status`                                |
| Reset local DB            | `pnpm db:reset`                                       |
| Create auth browser state | `pnpm auth:local`                                     |
| Capture UI proof          | `pnpm proof:capture -- --name <name> --route <route>` |
