# AI UI Workflow

Use this flow for every UI change.

## Required Path

1. Prepare the local stack:
   ```sh
   pnpm local:setup
   ```
   If Supabase is already running and you do not want a reset, use `pnpm supabase:start`.
2. Run the local app:
   ```sh
   pnpm local:dev
   ```
3. Refresh local auth state when the UI change touches signed-in behavior:
   ```sh
   pnpm auth:local
   ```
   Use `pnpm auth:local -- --headless` when needed.
4. Run E2E against the local stack:
   ```sh
   pnpm test:e2e
   pnpm test:e2e:auth
   ```
5. Start the inspection server:
   ```sh
   pnpm ui:inspect:start
   ```
6. Inspect the changed route at:
   - desktop `1280x720`
   - mobile `375x812`
7. Capture proof:
   ```sh
   pnpm proof:capture -- --name <name> --route <route>
   ```
8. Publish proof:
   ```sh
   pnpm proof:publish
   ```
9. Finish with:
   ```sh
   pnpm lint
   ```
10. Stop the inspection server:

```sh
pnpm ui:inspect:stop
```

The authenticated local flow uses `playwright/.auth/user.json`.

## Hosted Repro

If you need to reproduce a hosted Supabase issue from a local browser:

```sh
pnpm local:hosted
```

If you also need Playwright auth state for that hosted path:

```sh
pnpm auth:prod
```

That writes `playwright/.auth/user.hosted.json` and uses port `4175` so it stays isolated from the normal local inspect and proof flow on `4174`.

Use the hosted path for manual debugging only.

## Required Checks

Every UI change must be checked for:

1. Before or after screenshots as appropriate
2. Desktop layout
3. Mobile layout
4. Console errors
5. Failed network requests
6. Horizontal overflow or clipping
7. Loading states
8. Empty states
9. Error states

## Rules

- Do not skip proof publishing for UI PRs.
- Do not mark a UI PR ready until the proof comment is published and verified.
- Do not use `pnpm dev` as the inspection server.
- Do not capture proof from a remote or preview environment when local Supabase is available.
- Do not use `pnpm local:hosted` or `pnpm auth:prod` for normal local UI signoff.

## Output Locations

- Local screenshots: `e2e/screenshots/<branch-name>/`
- Published proof branch: `pr-proof-assets`
- PR proof comment: updated by `pnpm proof:publish`

## Troubleshooting

- If local auth state is missing or stale, rerun `pnpm auth:local`.
- If hosted auth state is missing, rerun `pnpm auth:prod`.
- If the inspection server cannot start, confirm local Supabase is running, then rerun `pnpm ui:inspect:start`.
- If published screenshot links are broken, rerun `pnpm proof:publish`.
