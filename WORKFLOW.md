# Development Workflow

End-to-end guide for moving from a GitHub issue to a merged PR.

---

## 1. Pick an Issue

- Open issues are tracked in the [GitHub Issues](https://github.com/foosball-tracker/foosball-tracker/issues) tab.
- If unsure which issue to pick, check the open issues and ask the user for confirmation.

---

## 2. Create a Branch

Before creating a branch, update your local `main` from the remote so you do not start from a stale base:

```bash
git checkout main
git pull origin main
```

**Naming convention:** always include the GitHub issue number so the PR auto-links.

```bash
git checkout -b feat/16-team-management-crud
```

- `feat/` — feature
- `fix/` — bug fix
- `chore/` — tooling, config, or cleanup
- Number immediately after slash links to the issue automatically when a PR is opened.

---

## 3. Local Development

1. If you need schema changes or seed data, start local Supabase first:
   ```bash
   npx pnpm@10 supabase:start
   ```
   See [`docs/supabase-local-dev.md`](./docs/supabase-local-dev.md) for full details.
2. Ensure `.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
   For local development, use `http://127.0.0.1:54321` and the local anon key from `npx pnpm@10 supabase:status`.
3. Start the dev server:
   ```bash
   npx pnpm@10 dev
   ```
4. If the change touches UI, verify the browser workflow first:
   Follow [`docs/ai-ui-workflow.md`](./docs/ai-ui-workflow.md) from start to finish.
   This includes Playwright inspection, desktop/mobile verification, proof capture, and proof publication back to the PR.
5. Implement the feature. Follow the guidelines in `AGENTS.md` (SolidJS patterns, service/store split, etc.).

---

## 4. Supabase Schema Changes (if needed)

**Ask the user before making any schema change.**

When working on schema changes, **use the local Supabase instance by default**:

1. Start local Supabase:
   ```bash
   npx pnpm@10 supabase:start
   ```
2. Create a migration:
   ```bash
   npx pnpm@10 db:migration:new <descriptive-name>
   ```
3. Write the SQL migration in the generated file under `supabase/migrations/`.
4. Test the migration locally:
   ```bash
   npx pnpm@10 db:reset
   ```
5. Regenerate database types:
   ```bash
   npx pnpm@10 db-types
   ```
6. Verify the app works against the local instance.

**Do not run `npx pnpm@10 db:push:remote`** unless the user explicitly asks. The Supabase Git integration auto-deploys migrations to the PR preview branch on push.

For full details, see [`docs/supabase-local-dev.md`](./docs/supabase-local-dev.md).

---

## 5. Demo Data (if needed)

The local database is seeded automatically by `npx pnpm@10 db:reset` from `supabase/seed.sql`.

For UI testing on Netlify deploy previews, demo data must be inserted directly into the **preview branch** database (not production) so the preview shows real content:

```bash
# Use MCP execute_sql or Supabase dashboard
INSERT INTO public.players (name) VALUES ('Alice'), ('Bob');
```

The Supabase preview branch is auto-created for every PR and seeded from migration files.

---

## 6. Pre-Commit Checks

Run these **before every commit** (Husky runs them on staged files, but run them manually for safety):

```bash
npx pnpm@10 lint        # ESLint
npx pnpm@10 format:check # Prettier
npx pnpm@10 build       # TypeScript + Vite build
```

All three must pass before pushing.

If the change touches UI, also complete the proof flow before pushing or before marking the PR ready:

```bash
npx pnpm@10 proof:capture -- --name <descriptive-name> --route <route>
npx pnpm@10 proof:publish
```

Then verify the PR comment contains working screenshot previews and direct links.

---

## 7. Commit and Push

```bash
git add <files>
git commit -m "feat: add team edit with member display (#16)"
git push -u origin feat/16-team-management-crud
```

Keep commits focused. Use [Conventional Commits](https://www.conventionalcommits.org/).

---

## 8. Open a Pull Request

Use the GitHub CLI (`gh`) or the web UI.

```bash
gh pr create --title "feat: team management CRUD (#16)" --body "..."
```

The PR body should reference the issue:

```markdown
Closes #16
```

If later pushes introduce larger new behavior, migrations, workflow changes, or other meaningful scope changes, update the PR description so it still matches the actual contents of the branch.
Small follow-up fixes do not need a PR description update unless they materially change scope or rollout considerations.

For UI changes:

1. Open the PR as a draft first.
2. Publish local proof screenshots to the PR.
3. Verify the Netlify preview and the screenshot proof comment.
4. Only then mark the PR ready for review.

---

## 9. Automated Deploys & Checks

### Netlify Deploy Preview

- Netlify auto-builds a deploy preview for every PR.
- The preview URL is posted as a comment by the Netlify bot (e.g. `https://deploy-preview-28--foosly.netlify.app`).
- **Test the preview on mobile** — the deploy preview is the closest thing to production.
- For UI PRs, do not rely on Netlify alone. Local proof screenshots published from `proof:publish` are also required.

### Supabase Preview Branch

- Supabase Git integration creates a preview branch for the PR.
- Migrations from `supabase/migrations/` are auto-applied.
- The deploy preview connects to this preview database, **not** production.

---

## 10. Code Review

### Codex (AI Review)

- Codex automatically reviews every new PR within a few minutes.
- Review comments appear as threads on the PR diff.
- After fixing issues, push the changes and trigger a re-review:
  ```
  @codex review
  ```
  (Post this as a PR comment.)
- After pushing a fix for a specific review thread, check whether GitHub auto-resolved it.
- If the thread or comment is still open even though the fix is in the branch, manually resolve that specific thread so the PR reflects the real review state.
- Before marking the PR ready, confirm there are no unresolved Codex review threads that still apply.

### Human Review

- The PR should be reviewed by a human (e.g. Josh) before merging.
- Address review comments, push fixes, and re-request review.

---

## 11. SonarQube Quality Gate

SonarCloud runs automatically on every PR.

Check the results with the SonarQube MCP:

1. Find the PR key:
   ```
   sonarqube_list_pull_requests
   ```
2. Check new issues:
   ```
   sonarqube_search_sonar_issues_in_projects with pullRequestId
   ```
3. Check the quality gate:
   ```
   sonarqube_get_project_quality_gate_status with pullRequest
   ```
4. Check security hotspots:
   ```
   sonarqube_search_security_hotspots with pullRequest
   ```

Fix any issues that block the quality gate or are significant. Ignore issues in generated files (e.g. `src/types/database.ts`) unless the generation flow is broken.

Before marking the PR ready, confirm:

- Quality gate is passing.
- There are no meaningful open Sonar issues left unaddressed.
- There are no open security hotspots for the PR.

---

## 12. Merge

Once all checks pass (CI green, Codex comments resolved, human review approved, SonarQube quality gate passed):

```bash
gh pr merge 28 --squash
```

Or merge via the GitHub UI.

---

## 13. Post-Merge Cleanup

1. Delete the branch locally and on remote:
   ```bash
   git branch -d feat/16-team-management-crud
   git push origin --delete feat/16-team-management-crud
   ```
2. Close the linked issue if it wasn't auto-closed.
3. Verify the production deploy on [foosly.netlify.app](https://foosly.netlify.app).

---

## Quick Reference

| Step            | Command / Action                          |
| --------------- | ----------------------------------------- |
| Branch          | `git checkout -b feat/<nr>-description`   |
| Supabase start  | `npx pnpm@10 supabase:start`              |
| Supabase status | `npx pnpm@10 supabase:status`             |
| DB reset        | `npx pnpm@10 db:reset`                    |
| Migration new   | `npx pnpm@10 db:migration:new <name>`     |
| DB types        | `npx pnpm@10 db-types`                    |
| Dev             | `npx pnpm@10 dev`                         |
| Lint            | `npx pnpm@10 lint`                        |
| Format          | `npx pnpm@10 format`                      |
| Build           | `npx pnpm@10 build`                       |
| PR              | `gh pr create --title "..." --body "..."` |
| Preview         | Check Netlify bot comment on PR           |
| Codex re-review | `@codex review` PR comment                |
| Sonar           | Use MCP tools after CI finishes           |
| Merge           | `gh pr merge <nr> --squash`               |
