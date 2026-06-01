# Foosball Tracker

## Introduction

A real-time [foosball](https://foosballplanet.com/cdn/shop/products/TornadoElite.jpg?v=1671815293) (table football) match tracking system with Solid.js frontend, Supabase backend, and MQTT integration for instant updates. Tracks player stats, match history, and provides live scoreboards.

## System Architecture

The system consists of:

1. **Goal Sensors** - Two Raspberry Pi Pico W devices with break-beam sensors detect goals
2. **Web Interface** - Solid.js frontend displays live scores and plays sound effects
3. **Supabase Backend** - Stores match data and handles real-time updates

**Sensor-to-Web Flow**:

1. Goal detected by Pico W sensor (debounced to prevent false positives)
2. Pico W sends POST request to Supabase `match_events` table via REST API
3. Solid.js frontend listens for real-time database changes via Supabase Realtime
4. UI updates scores and triggers sound effects through `soundService.ts`

Scoring uses an event-based model where sensors and the web UI submit events and the backend derives scores from valid events. See [docs/event-based-scoring.md](./docs/event-based-scoring.md) for the full architecture.

See companion sensor project: [Goal Tracker Hardware](https://github.com/joshua-lehmann/goal-tracker)

## Key Technologies

- **Frontend**: Solid.js v1.9.5 (Reactive UI Framework)
- **Routing**: Solid Router v1.10.2
- **Styling**: DaisyUI + Tailwind CSS
- **Backend**: Supabase (Auth/Database/Realtime)
- **State Management**: Solid.js signals/store
- **Styling**: DaisyUI v5.0.3 + Tailwind CSS v4.0.14
- **Backend Services**:
  - Supabase (Auth/DB) v2.49.1
  - **Solid Router** v1.10.2 (Client-side routing)
- **DaisyUI** v5.0.3 ([Component Library](https://daisyui.com/))
- **Tailwind CSS** v4.0.14 ([Utility Framework](https://tailwindcss.com/))
- **Supabase** v2.49.1 ([Backend Services](https://supabase.com/))
- **UI Components**: Lucide Solid icons v0.479.0

## Setup

This project pins its package manager via [Corepack](https://github.com/nodejs/corepack#readme) (included with Node.js 16+).
Enable it once, then use `pnpm` for all commands:

```bash
corepack enable
corepack prepare pnpm@10.33.4 --activate
pnpm install
```

After setup, run commands directly:

```bash
pnpm install
pnpm dev     # Starts Vite dev server
pnpm build   # Production build
pnpm lint    # ESLint checks
pnpm format  # Prettier formatting
pnpm db-types  # Generate Supabase types from database schema
```

## Authentication

Integrated with Supabase Auth for secure user management. Features include:

- Email/password authentication
- Social logins (Google/GitHub)
- Protected routes using Solid Router
- Session management via Solid.js signals

## Type Generation

Database types are automatically generated using:

```bash
pnpm db-types
```

## Design System

- Uses DaisyUI components with Tailwind utility classes
- Themed using DaisyUI's default color schemes
- Responsive layout patterns using Tailwind breakpoints
- Consistent component organization in `/src/components`

## Project Structure

```
src/
├── components/      # Reusable UI components
├── hooks/           # Custom Solid.js hooks
├── service/         # Supabase API clients
├── store/           # Global state management
├── routes/          # Solid-router configurations
├── types/           # TypeScript type definitions
├── assets/          # Static assets
└── lib/             # Utility functions
```

## Best Practices

1. **Type Safety**: Strict TypeScript configuration
2. **Linting**: ESLint with Solid.js rules
3. **Formatting**: Prettier with Tailwind plugin
4. **State Management**: Colocate state near components
5. **API Layer**: Service pattern for backend interactions
6. **Responsive Design**: Mobile-first Tailwind classes

## Deployment

Deployed on [Netlify](https://www.netlify.com/) with continuous deployment from the `main` branch.

- **Production**: [foosly.netlify.app](https://foosly.netlify.app)
- **Preview**: Automatic deploy previews for every pull request (e.g., `deploy-preview-{PR_NUMBER}--foosly.netlify.app`)

Build settings are configured in [`netlify.toml`](./netlify.toml). Environment variables for the live site are managed in the Netlify dashboard.

## Running Without Supabase

This app can run without Supabase environment variables configured. When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are missing, the app renders in **limited mode**: a banner warns that online features are unavailable, and the Players and Teams pages display disabled messages instead of attempting backend calls. Sign-in, match tracking, and realtime updates require the environment variables below.

## Environment Variables

Live site and preview environment variables stay in Netlify. Do not manage production values in a repo env file.

For local development:

- Put local Supabase values in `.env.local`
- Use [`/.env.local.example`](/home/josh/coding/foosball-tracker/.env.local.example) as the template
- Run `pnpm local:dev` for the normal local Supabase flow

For manual bug reproduction against the hosted Supabase project:

- Put the hosted Supabase values in `.env`
- Run `pnpm local:hosted`

The Supabase client in `src/service/supabaseService.ts` reads the `VITE_*` variables from the active environment, and the auth helpers use `VITE_CONTEXT` to determine the app origin for redirects. Make sure the local values match the types defined in `src/vite-env.d.ts`.

## E2E Testing

Playwright is split into a CI-safe anonymous smoke suite and a local authenticated integration suite, both against a dedicated test server on port `4174`.
Manual UI inspection uses that same dedicated port, while routine local development stays on `5173`.

### Setup (one-time)

1. Create a dedicated low-privilege Supabase test user in the Supabase Dashboard (Authentication > Users).
2. Start the inspection server: `pnpm ui:inspect:start`
3. Run the interactive auth script: `pnpm auth:local`
4. Enter the test user email and password when prompted.
5. The script saves the browser session to `playwright/.auth/user.json`.

The script auto-detects whether a display is available. In headless environments (SSH, CI, containers), it runs headless automatically. To force headless mode: `pnpm auth:local -- --headless`. For a headed browser in a headless environment, use `xvfb-run pnpm auth:local`.

## Local Login

For a fully local app session, run:

```bash
pnpm local:dev
```

This starts local Supabase, ensures the local auth users exist, and runs Vite with the local Supabase URL/key. Log in with `admin@example.local` and `password123` by default, or set `LOCAL_TEST_USER_PASSWORD` before `pnpm local:dev` to use a different local-only password.

If you need to reproduce the app against the hosted Supabase project while keeping the browser local, run:

```bash
pnpm local:hosted
```

That path is for manual debugging only. Keep automated tests, auth bootstrapping, and proof capture on the local Supabase path.

### Running tests

```bash
pnpm test:e2e
```

This runs the anonymous smoke suite that CI also uses. It verifies app boot, anonymous routing, and the login/reset auth surfaces in both configured and unconfigured Supabase environments.

For the authenticated local integration checks, run:

```bash
pnpm test:e2e:auth
```

To run both suites together, use:

```bash
pnpm test:e2e:all
```

Playwright starts its own strict-port server automatically on `4174`. The authenticated suite reuses the saved session when it exists and skips cleanly when it does not.

### Screenshots for PR proof

```bash
pnpm ui:inspect:start
pnpm proof:capture -- --name header-before --route /
pnpm proof:capture -- --name header-after --route /
pnpm proof:publish
```

Saves authenticated desktop and mobile screenshots to `e2e/screenshots/<branch-name>/` with descriptive names, then publishes them to the open PR as inline proof.

Local agent screenshots are the PR proof path. CI does not generate or publish proof screenshots.

### Troubleshooting

- If `pnpm test:e2e:auth` redirects to login or fails with auth errors, the session has expired. Rerun `pnpm auth:local`.
- If manual inspection fails to start, check whether port `4174` is occupied by another process.
- If e2e startup fails, check whether port `4174` is occupied by another process.
- Never store the test user password in `.env` or commit `playwright/.auth/user.json`.

### `pnpm` command asks to install pnpm

Do not use `npx pnpm@10` for normal project commands. Enable Corepack once instead:

```bash
corepack enable
corepack prepare pnpm@10.33.4 --activate
pnpm install
```

Then use `pnpm` directly. The `packageManager` field in `package.json` is the single source of truth for the pnpm version.
