# AI UI Inspection Workflow

## Starting the app

```sh
npx pnpm@10 ui:inspect:start
```

The inspection server runs at **http://localhost:4174**.

For routine local development, `npx pnpm@10 dev` still uses Vite's default port (`5173`).
Keep that separate from UI inspection so agent tooling does not collide with a manually started dev server.

## Playwright MCP

Playwright MCP is configured in `opencode.jsonc` and `.codex/config.toml`. Both Codex and OpenCode use `.codex/playwright-mcp-launcher.mjs`, which resolves the locally installed Chromium path from the `playwright` package at runtime instead of hardcoding a cache version.

The MCP runs headless in isolated mode so each session starts clean.

- **Desktop viewport**: 1280×720 (default)
- **Mobile viewport**: use `--viewport` flag or resize via tool commands to 375×812

Agent must inspect both desktop and mobile layouts for every UI change.

## Authenticated browser inspection

The MCP browser starts each session clean. To inspect pages that require authentication:

1. Ensure `playwright/.auth/user.json` exists (run `pnpm auth:local` if not).
2. Use `scripts/screenshot-auth.mjs` to capture authenticated screenshots:
   ```sh
   node scripts/screenshot-auth.mjs
   ```
   Screenshots are saved to `e2e/screenshots/<branch-name>/`.
3. Or run `pnpm test:e2e` to execute authenticated tests. Playwright uses the same dedicated fixed port, `4174`, so the saved auth state and manual inspection stay on the same origin.

## Preferred order

1. Run `npx pnpm@10 test:e2e` first.
2. If you need manual browser inspection, start `npx pnpm@10 ui:inspect:start`.
3. When finished with manual inspection, stop it with:
   ```sh
   npx pnpm@10 ui:inspect:stop
   ```

Do not start `pnpm dev` in the background with `&` from an agent shell tool. Shell timeouts can tear down the parent process and leave the port state ambiguous.

## Verify the MCP before UI work

1. Confirm Chromium is installed locally:

```sh
npx playwright install chromium
```

2. Confirm OpenCode sees the server:

```sh
opencode mcp list
```

You should see `playwright` with status `connected`.

3. If you changed `opencode.jsonc` or `.codex/config.toml`, restart the agent session before testing again. Local MCP server config is not hot-reloaded reliably mid-session.

## Troubleshooting

- If Playwright fails with a missing Chrome or Chromium binary, rerun `npx playwright install chromium`.
- If the configured browser path changed after a Playwright browser update, do not hardcode the new cache directory. Keep using `.codex/playwright-mcp-launcher.mjs`.
- If the MCP was broken in a previous session, restart the session after fixing config instead of trying to revive stale server processes manually.
- Prefer MCP browser tools over ad hoc root-level helper scripts for routine UI inspection.
- `pnpm ui:inspect:start` fails fast if port `4174` is occupied by some other process. Resolve that conflict instead of letting Vite drift to another port.
- `pnpm test:e2e` uses strict port `4174`. If that port is occupied, fix the conflict rather than reusing an unknown server.
- CI does not provide `playwright/.auth/user.json`. Authenticated tests should skip cleanly there, while anonymous smoke coverage still runs.

## Checklist for every UI change

1. **Screenshots** — take before/after screenshots at desktop and mobile widths
2. **Console errors** — verify no JS errors in the browser console
3. **Network errors** — check for failed requests (4xx/5xx)
4. **Overflow** — look for horizontal scroll or clipped content
5. **Spacing** — verify padding, margins, and alignment match the Figma design
6. **Loading states** — confirm skeleton/spinner renders while data loads
7. **Empty states** — confirm friendly message when no data exists
8. **Error states** — confirm graceful handling of failed API calls

## Before finishing

```sh
npx pnpm@10 lint
npx pnpm@10 build
```

Fix any lint or type errors before submitting.

## Gitignore

Screenshots, browser caches, auth state, and test artifacts are excluded via `.gitignore`. Never commit `*.png`, `*.webm`, `test-results/`, `.playwright-mcp/`, or `playwright-auth.json`.
