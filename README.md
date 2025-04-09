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
2. Pico W sends POST request to Supabase `goals` table via REST API
3. Solid.js frontend listens for real-time database changes via Supabase Realtime
4. UI updates scores and triggers sound effects through `soundService.ts`

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

```bash
pnpm install
pnpm run dev  # Starts Vite dev server
pnpm run build  # Production build
pnpm run lint  # ESLint checks
pnpm run format  # Prettier formatting
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
pnpm run db-types
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

Built using Vite's optimized production build. Environment variables should be configured on the production deployment

## Environment Variables

This project requires the following environment variables set in a `.env` file:

- `VITE_SUPABASE_URL`: Your Supabase project URL \
  (Found in Supabase Dashboard > Project Settings > General)
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous/public key \
  (Found in Supabase Dashboard > Project Settings > API)
- `VITE_SUPABASE_PROJECT_ID`: Your Supabase project ID \
  (Found in Supabase Dashboard > Project Settings > General)

These are used in:

- `src/service/supabaseService.ts` - Initializing the Supabase client
- Authentication flows - For secure API interactions
- Database operations - Managing match data and player statistics

Make sure these match the types defined in `src/vite-env.d.ts`.
