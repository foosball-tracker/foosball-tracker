# AI UI Workflow

Use this exact flow for every UI change.

## Happy Path

1. Run automated UI coverage first:
   ```sh
   npx pnpm@10 test:e2e
   ```
2. Start the dedicated inspection server:
   ```sh
   npx pnpm@10 ui:inspect:start
   ```
3. Inspect the changed route in Playwright MCP at both viewports:
   - Desktop: `1280x720`
   - Mobile: `375x812`
4. Capture proof screenshots with descriptive names:
   ```sh
   npx pnpm@10 proof:capture -- --name header-before --route /
   npx pnpm@10 proof:capture -- --name header-after --route /
   ```
5. Publish the proof set back to the open PR:
   ```sh
   npx pnpm@10 proof:publish
   ```
6. Open the PR comment and confirm the screenshot previews and direct links work.
7. Run the final checks:
   ```sh
   npx pnpm@10 format:check
   npx pnpm@10 lint
   npx pnpm@10 build
   ```
8. Stop the inspection server when done:
   ```sh
   npx pnpm@10 ui:inspect:stop
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
npx pnpm@10 ui:inspect:start
npx pnpm@10 ui:inspect:status
npx pnpm@10 ui:inspect:stop
```

Proof capture and publish:

```sh
npx pnpm@10 proof:capture -- --name <name> --route <route>
npx pnpm@10 proof:publish
```

Authenticated local browser state:

```sh
npx pnpm@10 auth:local
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

- If Playwright auth state is missing, run `npx pnpm@10 auth:local`.
- If the inspection server port is occupied, fix the port conflict instead of changing the port.
- If published screenshot links are broken, rerun `proof:publish` and verify `pr-proof-assets` contains `pr-<number>/local/latest/*.png`.
