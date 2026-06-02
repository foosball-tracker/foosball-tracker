# Supabase Local Development

Use the local Supabase stack by default for development, schema work, E2E, and UI proof capture. Use the hosted Supabase path only when you need to reproduce a hosted bug locally.

## Environment Split

| Mode     | App origin | Supabase backend   | Main command        | Intended use                             |
| -------- | ---------- | ------------------ | ------------------- | ---------------------------------------- |
| `local`  | localhost  | local              | `pnpm local:dev`    | normal development, tests, proof, schema |
| `hosted` | localhost  | hosted from `.env` | `pnpm local:hosted` | manual repro against the real project    |

The app stays local in both modes. Only the Supabase backend changes.

## Core Commands

| Task                               | Command                |
| ---------------------------------- | ---------------------- |
| Start local Supabase               | `pnpm supabase:start`  |
| Stop local Supabase                | `pnpm supabase:stop`   |
| Show local URLs and keys           | `pnpm supabase:status` |
| Reset local DB                     | `pnpm db:reset`        |
| Full local setup                   | `pnpm local:setup`     |
| Reset local DB and auth            | `pnpm local:reset`     |
| Run local app                      | `pnpm local:dev`       |
| Run local app with hosted Supabase | `pnpm local:hosted`    |
| Local Playwright auth              | `pnpm auth:local`      |
| Hosted Playwright auth             | `pnpm auth:prod`       |

`pnpm auth:hosted` is kept as an alias of `pnpm auth:prod`.

## Local Mode

`pnpm local:dev` resolves the local Supabase URL and anon key automatically and runs Vite on localhost. You do not need to edit `.env.local` for the normal local workflow.

If you want to run `pnpm dev` manually instead, first provide local values in `.env.local`. Use:

- [`/.env.example`](/home/josh/coding/foosball-tracker/.env.example)
- [`/.env.local.example`](/home/josh/coding/foosball-tracker/.env.local.example)

If you need LAN access instead of localhost-only behavior, run `LOCAL_UI_HOST=0.0.0.0 pnpm local:dev`.

## Hosted Repro Mode

`pnpm local:hosted` runs the app locally but injects hosted Supabase values from `.env`.

Use this only for manual debugging when you need the real hosted auth or data behavior in a local browser.

Do not use `local:hosted` for:

- `pnpm test:e2e`
- `pnpm test:e2e:auth`
- `pnpm auth:local`
- `pnpm ui:inspect:start`
- `pnpm proof:capture`
- `pnpm proof:publish`

## Identity Model

The project separates identity into three layers:

| Layer    | Table        | Purpose                                                                   |
| -------- | ------------ | ------------------------------------------------------------------------- |
| Auth     | `auth.users` | Supabase Auth — source of truth for email, password, sessions             |
| Account  | `profiles`   | Account metadata — `is_admin` flag                                        |
| Gameplay | `players`    | Game identity — public display name, linked to `auth.users` via `user_id` |

- Every new `auth.users` row automatically creates a `profiles` row and a `players` row (via `insert_profile_on_user_creation` trigger).
- `profiles.user_id` is the primary key, referencing `auth.users(id) ON DELETE CASCADE`.
- `players.user_id` is nullable — `NULL` for guest/anonymous players.
- Use `SELECT public.current_player_id()` in RLS policies to resolve `auth.uid()` → `players.id`.

## Local Auth Users

Seed local auth users with:

```bash
pnpm local:setup
```

If Supabase is already running and you only need the auth users refreshed:

```bash
pnpm local:reset
```

Default local users:

| Email                   | Password      | Role  |
| ----------------------- | ------------- | ----- |
| `admin@example.local`   | `password123` | admin |
| `player1@example.local` | `password123` | user  |
| `player2@example.local` | `password123` | user  |
| `viewer@example.local`  | `password123` | user  |

Override the password with `LOCAL_TEST_USER_PASSWORD=...` when needed.

## Playwright Auth State

There are two separate saved browser sessions:

| Command           | Backend | Default port | Output file                         |
| ----------------- | ------- | ------------ | ----------------------------------- |
| `pnpm auth:local` | local   | `4174`       | `playwright/.auth/user.json`        |
| `pnpm auth:prod`  | hosted  | `4175`       | `playwright/.auth/user.hosted.json` |

`pnpm auth:local` signs in with the seeded local admin account automatically.

`pnpm auth:prod` signs in through a local app that is connected to hosted Supabase. It uses a different port so it cannot accidentally reuse the local inspect app used for E2E and proofing.

If you need the hosted flow, `pnpm auth:hosted` behaves the same as `pnpm auth:prod`.

## CLI Link State — Local by Default

The Supabase CLI is **not linked to production** during normal development. All migration work, testing, and type generation happen against the local Supabase instance.

**How migrations reach production:**

1. You write and test migrations locally (`pnpm db:reset`, `pnpm db-types`).
2. You commit the migration files and open a PR.
3. Supabase GitHub integration auto-creates a preview branch for the PR and applies the migrations there.
4. When the PR is merged to `main`, Supabase GitHub integration auto-applies the migrations to the production database.

You never need to `supabase link` or `supabase db push` for normal migration work.

**Temporarily connecting to production for debugging:**

```bash
# Link to production (stored in supabase/.temp/, gitignored)
supabase link --project-ref eucjxbcicejyinubzgwh

# Run read-only queries against production
supabase db dump --linked --schema public --data-only > /tmp/prod-dump.sql
psql "$(supabase status -o env | grep ^SUPABASE_DB_URL | cut -d= -f2 | tr -d '"')" -c "SELECT ..."

# When done, go back to local-only
supabase unlink
```

The link state is stored in `supabase/.temp/` which is gitignored, so each developer controls their own link state independently.

Never leave the CLI linked to production as the default. Always `supabase unlink` after debugging.

## Migration Workflow

1. Ask before any schema change, migration, RLS change, or non-local data mutation.
2. Start local Supabase:
   ```bash
   pnpm supabase:start
   ```
3. Create a migration:
   ```bash
   pnpm db:migration:new <descriptive-name>
   ```
4. Write the SQL in `supabase/migrations/`.
5. Test locally:
   ```bash
   pnpm db:reset
   pnpm db-types
   ```
6. Verify the app with:
   ```bash
   pnpm local:dev
   ```
7. Commit the migration files. The Supabase GitHub integration handles deploying to the PR preview branch and, on merge to main, to production automatically.

## Database Types

```bash
pnpm db-types
```

This regenerates `src/types/database.ts` from the local schema.

## Manual Remote Pushes (emergency only)

You should never need `supabase db push`. The Supabase GitHub integration auto-deploys migrations when PRs are merged to `main`.

Only run `pnpm db:push:remote` if the user explicitly asks and the GitHub integration is broken or unavailable. This requires the CLI to be linked to production first.

## Security Rules

- Never commit `.env` files or service role keys.
- Never expose production service role keys to the agent.
- Keep Supabase MCP work on the local instance whenever it is running.
