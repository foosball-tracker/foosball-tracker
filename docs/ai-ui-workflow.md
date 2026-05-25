# AI UI Inspection Workflow

## Starting the app

```sh
npx pnpm@10 dev --host 0.0.0.0
```

The dev server runs at **http://localhost:5173**.

## Playwright MCP

Playwright MCP is configured in `opencode.jsonc` and `.codex/config.toml`. It runs headless in isolated mode so each session starts clean.

- **Desktop viewport**: 1280×720 (default)
- **Mobile viewport**: use `--viewport` flag or resize via tool commands to 375×812

Agent must inspect both desktop and mobile layouts for every UI change.

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

Screenshots, browser caches, and test artifacts are excluded via `.gitignore`. Never commit `*.png`, `*.webm`, `test-results/`, or `.playwright-mcp/`.
