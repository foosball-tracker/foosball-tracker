import { chromium } from "playwright";
import readline from "node:readline";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import {
  DEFAULT_LOCAL_AUTH_EMAIL,
  DEFAULT_LOCAL_TEST_PASSWORD,
  createHostedViteEnv,
  createLocalViteEnv,
  getLocalSupabaseStatus,
} from "./lib/utils.mjs";
const LOCAL_AUTH_STATE_PATH = "playwright/.auth/user.json";
const HOSTED_AUTH_STATE_PATH = "playwright/.auth/user.hosted.json";
const LOCAL_INSPECT_PORT = 4174;
const HOSTED_INSPECT_PORT = 4175;

function parseArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) continue;

    const [flag, inlineValue] = value.split("=", 2);
    const key = flag.slice(2);

    if (inlineValue !== undefined) {
      options[key] = inlineValue;
      continue;
    }

    const nextValue = argv[index + 1];
    if (nextValue && !nextValue.startsWith("--")) {
      options[key] = nextValue;
      index += 1;
      continue;
    }

    options[key] = "true";
  }

  return options;
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function askPassword(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    let password = "";
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    const onData = (char) => {
      const c = char.toString();
      switch (c) {
        case "\n":
        case "\r":
        case "\u0004":
          stdin.setRawMode(wasRaw);
          stdin.pause();
          stdin.removeListener("data", onData);
          process.stdout.write("\n");
          resolve(password);
          break;
        case "\u0003":
          process.stdout.write("\n");
          process.exit(1);
          break;
        case "\u007F":
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write("\b \b");
          }
          break;
        default:
          password += c;
          process.stdout.write("*");
          break;
      }
    };

    stdin.on("data", onData);
  });
}

function normalizeMode(value) {
  return value === "hosted" ? "hosted" : "local";
}

function resolveInspectPort(mode) {
  const configuredPort = process.env.UI_INSPECT_PORT ?? process.env.PLAYWRIGHT_PORT;
  if (configuredPort) {
    return Number(configuredPort);
  }

  return mode === "hosted" ? HOSTED_INSPECT_PORT : LOCAL_INSPECT_PORT;
}

function resolveAuthStatePath(mode, options) {
  return (
    options.authFile ??
    process.env.AUTH_STATE_PATH ??
    (mode === "hosted" ? HOSTED_AUTH_STATE_PATH : LOCAL_AUTH_STATE_PATH)
  );
}

function resolveLocalCredentials(options) {
  return {
    email: options.email ?? process.env.LOCAL_TEST_USER_EMAIL ?? DEFAULT_LOCAL_AUTH_EMAIL,
    password:
      options.password ?? process.env.LOCAL_TEST_USER_PASSWORD ?? DEFAULT_LOCAL_TEST_PASSWORD,
  };
}

async function resolveHostedCredentials(options) {
  const email = options.email ?? process.env.AUTH_EMAIL ?? (await ask("Email: "));
  if (!email) {
    console.error("Email is required.");
    process.exit(1);
  }

  const password =
    options.password ?? process.env.AUTH_PASSWORD ?? (await askPassword("Password: "));
  if (!password) {
    console.error("Password is required.");
    process.exit(1);
  }

  return { email, password };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const mode = normalizeMode(args.mode ?? (args.hosted === "true" ? "hosted" : "local"));
  const authStatePath = resolveAuthStatePath(mode, args);
  const inspectPort = resolveInspectPort(mode);
  const inspectBaseUrl = `http://localhost:${inspectPort}`;
  const credentials =
    mode === "hosted" ? await resolveHostedCredentials(args) : resolveLocalCredentials(args);
  const viteEnv =
    mode === "hosted" ? createHostedViteEnv() : createLocalViteEnv(getLocalSupabaseStatus().status);

  process.env.UI_INSPECT_PORT = String(inspectPort);
  const { ensureInspectServer } = await import("./ui-inspect-server.mjs");
  await ensureInspectServer({
    env: { ...process.env, ...viteEnv, UI_INSPECT_PORT: String(inspectPort) },
  });

  console.log("Supabase Auth — Playwright login");
  console.log(`Mode: ${mode}`);
  console.log(`Target: ${inspectBaseUrl}`);
  if (viteEnv.VITE_SUPABASE_URL) {
    console.log(`Supabase: ${new URL(viteEnv.VITE_SUPABASE_URL).host}`);
  }
  console.log();

  if (mode === "local") {
    console.log(`Using local account: ${credentials.email}`);
  }

  const hasDisplay = !!(process.env.DISPLAY || process.env.WAYLAND_DISPLAY);
  const forceHeadless = process.argv.includes("--headless");
  const headless = forceHeadless || !hasDisplay;

  console.log(`Launching browser (${headless ? "headless" : "headed"})...`);
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();

  try {
    await page.goto(inspectBaseUrl);

    await page.getByRole("banner").getByRole("button", { name: "Sign in" }).click();

    const modal = page.locator("#login-modal");
    await modal.waitFor({ state: "visible", timeout: 5_000 });

    await modal.locator("#email").waitFor({ state: "visible", timeout: 5_000 });
    await modal.locator("#email").clear();
    await modal.locator("#email").pressSequentially(credentials.email, { delay: 10 });
    await modal.locator("#password").clear();
    await modal.locator("#password").pressSequentially(credentials.password, { delay: 10 });
    await modal.getByRole("button", { name: "Sign in" }).click();

    await page.getByRole("button", { name: "Logout" }).waitFor({ timeout: 30_000 });

    await mkdir(dirname(authStatePath), { recursive: true });
    await context.storageState({ path: authStatePath });

    console.log(`\nAuth state saved to ${authStatePath}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("\nLogin failed:", message);
    await page.screenshot({ path: "playwright-auth-error.png" });
    console.log("Screenshot saved to playwright-auth-error.png");
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

await main();
