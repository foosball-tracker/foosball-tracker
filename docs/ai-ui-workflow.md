# AI UI Workflow

Use this exact flow for every UI change.

## Local-First Flow

1. Prepare the local backend:
   ```sh
   pnpm local:setup
   ```
   If Supabase is already running and you do not want a reset, use `pnpm supabase:start` instead.
2. Keep the local app available while you work:
   ```sh
   pnpm local:dev
   ```
   This boots the app against local Supabase and seeds the local auth users.
3. Refresh local browser auth when the change touches logged-in behavior:
   ```sh
   pnpm auth:local
   ```
   Use `pnpm auth:local -- --headless` when you need a non-interactive login flow.
4. Run E2E coverage against the local app and local Supabase:
   ```sh
   pnpm test:e2e
   pnpm test:e2e:auth
   ```
   The auth suite expects `playwright/.auth/user.json` from `pnpm auth:local`.
5. Start the inspection server for Playwright screenshots:
   ```sh
   pnpm ui:inspect:start
   ```
6. Inspect the changed route at both viewports:
   - Desktop: `1280x720`
   - Mobile: `375x812`
7. Capture proof from the authenticated local session:
   ```sh
   pnpm proof:capture -- --name header-before --route /
   pnpm proof:capture -- --name header-after --route /
   ```
8. Publish the proof set back to the open PR:
   ```sh
   pnpm proof:publish
   ```
9. Run the final checks:
   ```sh
   pnpm format:check
   pnpm lint
   pnpm build
   ```
10. Stop the inspection server when you are done:
    ```sh
    pnpm ui:inspect:stop
    ```

## Manual Hosted Repro

If you need to reproduce a bug against the hosted Supabase project from a local browser, use:

```sh
pnpm local:hosted
```

This path is for manual debugging only. Do not use it for `test:e2e`, `test:e2e:auth`, `auth:local`, `ui:inspect:start`, or proof capture.

## Required Checks

Every UI change must be checked for:

1. Before/after screenshots
2. Desktop layout
3. Mobile layout
4. Console errors
5. Failed network requests
6. Horizontal overflow or clipping
7. Loading states
8. Empty states
9. Error states

## Commands

Inspection server:

```sh
pnpm ui:inspect:start
pnpm ui:inspect:status
pnpm ui:inspect:stop
```

Local auth state:

```sh
pnpm auth:local
```

Proof capture and publish:

```sh
pnpm proof:capture -- --name <name> --route <route>
pnpm proof:publish
```

## Output Locations

- Local screenshots: `e2e/screenshots/<branch-name>/`
- Published proof branch: `pr-proof-assets`
- PR proof comment: updated by `proof:publish`

## Rules

- Do not skip proof publishing for UI PRs.
- Do not mark a UI PR ready for review until the screenshot comment is published and verified.
- Do not use ad hoc screenshot scripts when `proof:capture` and `proof:publish` are available.
- Do not use `pnpm dev` as the inspection server. Use `ui:inspect:start`.
- Do not capture proof from a remote or preview environment when local Supabase is available.
- Do not use `pnpm local:hosted` for automated testing or screenshot proofing.

## Troubleshooting

- If Playwright auth state is missing, rerun `pnpm auth:local` against the local app.
- If the inspection server cannot start, confirm local Supabase is running and then rerun `pnpm ui:inspect:start`.
- If published screenshot links are broken, rerun `pnpm proof:publish` and verify `pr-proof-assets` contains `pr-<number>/local/latest/*.png`.
