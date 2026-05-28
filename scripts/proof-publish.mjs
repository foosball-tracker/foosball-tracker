import { mkdtempSync, cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const COMMENT_MARKER = "<!-- pr-proof-local-screenshots -->";
const PROOF_BRANCH = "pr-proof-assets";

const SAFE_ENV = { ...process.env, PATH: "/usr/bin:/usr/local/bin:/bin" };

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: SAFE_ENV,
    ...options,
  }).trim();
}

function sanitizeBranchName(value) {
  return value.replace(/[^a-zA-Z0-9-_]+/g, "-");
}

function collectScreenshots(branch) {
  const rootDir = "e2e/screenshots";
  const branchDir = join(rootDir, branch);
  const entries = [];

  if (existsSync(branchDir)) {
    for (const fileName of readdirSync(branchDir, { withFileTypes: true })) {
      if (!fileName.isFile() || !fileName.name.endsWith(".png")) continue;
      entries.push({
        sourcePath: join(branchDir, fileName.name),
        destName: fileName.name,
        label: fileName.name.replace(/\.png$/i, ""),
      });
    }
  }

  return entries.sort((left, right) => left.destName.localeCompare(right.destName));
}

function upsertComment({ repo, prNumber, body }) {
  const comments = JSON.parse(run("gh", ["api", `repos/${repo}/issues/${prNumber}/comments`]));
  const existing = comments.find((comment) => comment.body?.includes(COMMENT_MARKER));

  if (existing) {
    run("gh", [
      "api",
      `repos/${repo}/issues/comments/${existing.id}`,
      "--method",
      "PATCH",
      "--field",
      `body=${body}`,
    ]);
    return existing.html_url;
  }

  const created = JSON.parse(
    run("gh", [
      "api",
      `repos/${repo}/issues/${prNumber}/comments`,
      "--method",
      "POST",
      "--field",
      `body=${body}`,
    ])
  );
  return created.html_url;
}

const branch = run("git", ["branch", "--show-current"]);
const branchSafe = sanitizeBranchName(branch);
const pr = JSON.parse(run("gh", ["pr", "view", "--json", "number,url"]));
const repo = run("gh", ["repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"]);
const screenshots = collectScreenshots(branch);

if (screenshots.length === 0) {
  console.error(`No local screenshots found for branch ${branch}.`);
  console.error(`Capture proof into e2e/screenshots/${branch}/ before publishing.`);
  process.exit(1);
}

const publishDir = `pr-${pr.number}/local/latest`;
const worktreeDir = mkdtempSync(join(tmpdir(), "foosball-proof-"));
let commentUrl = "";

try {
  let hasRemoteBranch = true;
  try {
    run("git", ["ls-remote", "--exit-code", "--heads", "origin", PROOF_BRANCH], {
      stdio: "ignore",
    });
  } catch {
    hasRemoteBranch = false;
  }

  if (hasRemoteBranch) {
    run("git", ["fetch", "--no-tags", "origin", PROOF_BRANCH]);
    run("git", ["worktree", "add", worktreeDir, `origin/${PROOF_BRANCH}`]);
    run("git", ["checkout", "-B", PROOF_BRANCH, `origin/${PROOF_BRANCH}`], { cwd: worktreeDir });
  } else {
    run("git", ["worktree", "add", "--detach", worktreeDir]);
    run("git", ["checkout", "--orphan", PROOF_BRANCH], { cwd: worktreeDir });
  }

  const targetDir = join(worktreeDir, publishDir);
  mkdirSync(targetDir, { recursive: true });

  for (const entry of readdirSync(targetDir, { withFileTypes: true })) {
    rmSync(join(targetDir, entry.name), { recursive: true, force: true });
  }

  for (const screenshot of screenshots) {
    cpSync(screenshot.sourcePath, join(targetDir, screenshot.destName));
  }

  run("git", ["config", "user.name", "Joshua Lehmann"], { cwd: worktreeDir });
  run("git", ["config", "user.email", "joshua.le1999@gmail.com"], { cwd: worktreeDir });
  run("git", ["add", publishDir], { cwd: worktreeDir });

  let worktreeHasChanges = false;
  try {
    run("git", ["diff", "--cached", "--quiet"], { cwd: worktreeDir, stdio: "ignore" });
  } catch {
    worktreeHasChanges = true;
  }

  if (worktreeHasChanges) {
    run("git", ["commit", "-m", `chore: update PR ${pr.number} local proof screenshots`], {
      cwd: worktreeDir,
    });
    run("git", ["push", "origin", `HEAD:${PROOF_BRANCH}`], { cwd: worktreeDir });
  }

  const rawBase = `https://raw.githubusercontent.com/${repo}/${PROOF_BRANCH}/${publishDir}`;
  const blobBase = `https://github.com/${repo}/blob/${PROOF_BRANCH}/${publishDir}`;
  const previewLines = screenshots.map(
    ({ label, destName }) => `- [${label}](${blobBase}/${destName})`
  );
  const imageLines = screenshots.map(
    ({ label, destName }) =>
      `<a href="${blobBase}/${destName}"><img src="${rawBase}/${destName}" alt="${label}" width="320"></a>`
  );

  const body = [
    COMMENT_MARKER,
    `Local UI proof screenshots for \`${branchSafe}\`:`,
    "",
    ...imageLines,
    "",
    "Direct screenshot links:",
    ...previewLines,
    "",
    `Source folder: \`e2e/screenshots/${branch}\``,
  ].join("\n");

  commentUrl = upsertComment({ repo, prNumber: pr.number, body });

  console.log(`Published ${screenshots.length} local screenshot(s) to ${blobBase}`);
  console.log(`Updated PR comment: ${commentUrl}`);
} finally {
  try {
    run("git", ["worktree", "remove", worktreeDir, "--force"], { stdio: "ignore" });
  } catch {
    // Ignore cleanup failures.
  }
}
