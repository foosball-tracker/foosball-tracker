import { mkdir, readFile, readlink, rm, writeFile } from "node:fs/promises";
import { openSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";

export const INSPECT_PORT = Number(process.env.UI_INSPECT_PORT ?? 4174);
export const INSPECT_BASE_URL = `http://localhost:${INSPECT_PORT}`;

const SERVER_DIR = ".playwright-mcp";
const PID_PATH = `${SERVER_DIR}/ui-inspect.pid`;
const META_PATH = `${SERVER_DIR}/ui-inspect.json`;
const LOG_PATH = `${SERVER_DIR}/ui-inspect.log`;
const APP_MARKER = "<title>Foosball Tracker</title>";
const LSOF_BIN = "/usr/bin/lsof";

async function delay(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHtml(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    return { ok: response.ok, text };
  } catch {
    return null;
  }
}

async function readPid() {
  try {
    const raw = await readFile(PID_PATH, "utf8");
    const pid = Number(raw.trim());
    return Number.isInteger(pid) ? pid : null;
  } catch {
    return null;
  }
}

async function readMeta() {
  try {
    const raw = await readFile(META_PATH, "utf8");
    const meta = JSON.parse(raw);
    return typeof meta === "object" && meta ? meta : null;
  } catch {
    return null;
  }
}

function isPidRunning(pid) {
  if (!pid) {
    return false;
  }

  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function cleanupPidFile() {
  await rm(PID_PATH, { force: true });
}

async function cleanupMetaFile() {
  await rm(META_PATH, { force: true });
}

function getListeningPids(port) {
  try {
    const output = execFileSync(LSOF_BIN, ["-tiTCP:" + String(port), "-sTCP:LISTEN"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });

    return output
      .split("\n")
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isInteger(value) && value > 0);
  } catch {
    return [];
  }
}

async function getProcessCwd(pid) {
  try {
    return await readlink(`/proc/${pid}/cwd`);
  } catch {
    return null;
  }
}

async function getProcessCommand(pid) {
  try {
    const raw = await readFile(`/proc/${pid}/cmdline`);
    return raw.toString("utf8").replaceAll("\u0000", " ").trim();
  } catch {
    return "";
  }
}

async function getProcessDetails(pid) {
  const [cwd, command] = await Promise.all([getProcessCwd(pid), getProcessCommand(pid)]);
  return {
    cwd: cwd ?? "",
    command,
  };
}

async function isFoosballInspectProcess(pid) {
  const { cwd, command } = await getProcessDetails(pid);

  return (
    (cwd.includes("/foosball-tracker") || cwd.includes("(deleted)")) &&
    (command.includes("scripts/local-ui-server.mjs") || command.includes("/vite/bin/vite.js"))
  );
}

async function isStaleFoosballInspectProcess(pid) {
  const { cwd, command } = await getProcessDetails(pid);

  return (
    (cwd.includes("/foosball-tracker") || cwd.includes("(deleted)")) &&
    (command.includes("scripts/local-ui-server.mjs") || command.includes("/vite/bin/vite.js")) &&
    (cwd.includes("(deleted)") || command.includes("(deleted)"))
  );
}

function stopPids(pids) {
  for (const pid of pids) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // Process may have already exited.
    }
  }
}

function buildEnvSignature(env) {
  const source = {
    VITE_CONTEXT: env.VITE_CONTEXT ?? "",
    VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY ?? "",
    VITE_SUPABASE_PROJECT_ID: env.VITE_SUPABASE_PROJECT_ID ?? "",
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL ?? "",
  };

  return createHash("sha256").update(JSON.stringify(source)).digest("hex");
}

async function stopMatchingPids(pids, predicate) {
  const matchingPids = [];

  for (const pid of pids) {
    if (await predicate(pid)) {
      matchingPids.push(pid);
    }
  }

  if (matchingPids.length > 0) {
    stopPids(matchingPids);
    await delay(500);
  }

  return matchingPids;
}

async function clearStaleInspectProcesses(status, listeningPids) {
  if (status.reachable || listeningPids.length === 0) return;
  await stopMatchingPids(listeningPids, isStaleFoosballInspectProcess);
}

async function replaceManagedInspectServerIfNeeded(status, listeningPids, envSignature) {
  if (!status.reachable) return;

  const managedPids = [];

  for (const pid of listeningPids) {
    if (await isFoosballInspectProcess(pid)) {
      managedPids.push(pid);
    }
  }

  const shouldReplaceManagedServer =
    managedPids.length > 0 &&
    (!status.pidRunning || !status.meta?.envSignature || status.meta.envSignature !== envSignature);

  if (!shouldReplaceManagedServer) {
    throw new Error(
      `Port ${INSPECT_PORT} is already in use by another process. Stop it or change UI_INSPECT_PORT.`
    );
  }

  stopPids(managedPids);
  await stopInspectServer();
  await delay(500);
}

export async function getInspectServerStatus() {
  const page = await fetchHtml(INSPECT_BASE_URL);
  const pid = await readPid();
  const meta = await readMeta();
  const reachable = !!page?.ok;
  const isFoosballApp = reachable && page.text.includes(APP_MARKER);
  const pidRunning = isPidRunning(pid);

  if (pid && !pidRunning) {
    await cleanupPidFile();
  }

  return {
    pid: pidRunning ? pid : null,
    pidRunning,
    reachable,
    isFoosballApp,
    meta,
    logPath: LOG_PATH,
    pidPath: PID_PATH,
    metaPath: META_PATH,
    url: INSPECT_BASE_URL,
  };
}

export async function ensureInspectServer({ timeoutMs = 20_000, env = process.env } = {}) {
  await mkdir(SERVER_DIR, { recursive: true });
  const envSignature = buildEnvSignature(env);

  const status = await getInspectServerStatus();
  const listeningPids = getListeningPids(INSPECT_PORT);
  if (status.isFoosballApp && status.meta?.envSignature === envSignature) {
    if (!status.pidRunning && status.pid) {
      await cleanupPidFile();
    }
    return status;
  }

  await clearStaleInspectProcesses(status, listeningPids);
  await replaceManagedInspectServerIfNeeded(status, listeningPids, envSignature);

  const logFd = openSync(LOG_PATH, "a");
  const child = spawn("node", ["scripts/local-ui-server.mjs", "--port", String(INSPECT_PORT)], {
    detached: true,
    stdio: ["ignore", logFd, logFd],
    env,
  });

  child.unref();
  await writeFile(PID_PATH, `${child.pid}\n`, "utf8");
  await writeFile(META_PATH, JSON.stringify({ envSignature }, null, 2) + "\n", "utf8");

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const nextStatus = await getInspectServerStatus();
    if (nextStatus.isFoosballApp && nextStatus.meta?.envSignature === envSignature) {
      return nextStatus;
    }

    if (!nextStatus.pidRunning) {
      break;
    }

    await delay(250);
  }

  throw new Error(
    `UI inspect server did not become ready on ${INSPECT_BASE_URL}. Check ${LOG_PATH}.`
  );
}

export async function stopInspectServer() {
  const pid = await readPid();
  if (pid && isPidRunning(pid)) {
    process.kill(pid, "SIGTERM");
  }

  await cleanupPidFile();
  await cleanupMetaFile();
}
