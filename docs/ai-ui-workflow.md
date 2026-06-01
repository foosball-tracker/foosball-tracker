# AI UI Workflow

Use this exact flow for every UI change.

## Happy Path

1. Run automated UI coverage first:
   ```sh
   pnpm test:e2e
   ```
   Run `pnpm test:e2e:auth` as well when your change depends on authenticated behavior or a configured Supabase auth surface.
2. Start the dedicated inspection server:
   ```sh
   pnpm ui:inspect:start
   ```
3. Inspect the changed route in Playwright MCP at both viewports:
   - Desktop: `1280x720`
   - Mobile: `375x812`
4. Capture proof screenshots with descriptive names:
   ```sh
   pnpm proof:capture -- --name header-before --route /
   pnpm proof:capture -- --name header-after --route /
   ```
5. Publish the proof set back to the open PR:
   ```sh
   pnpm proof:publish
   ```
6. Open the PR comment and confirm the screenshot previews and direct links work.
7. Run the final checks:
   ```sh
   pnpm format:check
   pnpm lint
   pnpm build
   ```
8. Stop the inspection server when done:
   ```sh
   pnpm ui:inspect:stop
   ```

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

Proof capture and publish:

```sh
pnpm proof:capture -- --name <name> --route <route>
pnpm proof:publish
```

Authenticated local browser state:

```sh
pnpm auth:local
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

## Troubleshooting

- If Playwright auth state is missing, run `pnpm auth:local`.
- Use `pnpm test:e2e` for the CI-safe anonymous smoke suite and `pnpm test:e2e:auth` for local authenticated integration coverage.
- If the inspection server port is occupied, fix the port conflict instead of changing the port.
- If published screenshot links are broken, rerun `proof:publish` and verify `pr-proof-assets` contains `pr-<number>/local/latest/*.png`.
