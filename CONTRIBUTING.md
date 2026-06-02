## Contributing

Use [WORKFLOW.md](./WORKFLOW.md) as the authoritative contribution process. It covers:

- branching from `main`
- branch naming
- local-first Supabase development
- required checks
- PR creation
- UI proof publication
- Codex and human review
- SonarQube checks
- merge expectations

## Short Version

1. Start from an issue.
2. Branch from `main`.
3. Build and verify locally.
4. Run `pnpm lint` and let the existing pre-commit hooks handle staged formatting and fixups.
5. For UI changes, follow [docs/ai-ui-workflow.md](./docs/ai-ui-workflow.md) and publish screenshot proof.
6. Open a PR targeting `main`.
7. Fix review and SonarQube findings before merge.

## Local Supabase Rule

Use the local Supabase stack by default. Only use the hosted Supabase path for manual reproduction from a local browser.

See [docs/supabase-local-dev.md](./docs/supabase-local-dev.md) for the environment split and auth commands.
