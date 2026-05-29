import { chromium } from "playwright";
import readline from "node:readline";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { INSPECT_BASE_URL, ensureInspectServer } from "./ui-inspect-server.mjs";

const AUTH_STATE_PATH = "playwright/.auth/user.json";
const BASE_URL = INSPECT_BASE_URL;

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

async function main() {
  await ensureInspectServer();

  console.log("Supabase Auth — interactive login for Playwright");
  console.log(`Target: ${BASE_URL}\n`);

  const email = await ask("Email: ");
  if (!email) {
    console.error("Email is required.");
    process.exit(1);
  }

  const password = await askPassword("Password: ");
  if (!password) {
    console.error("Password is required.");
    process.exit(1);
  }

  const hasDisplay = !!(process.env.DISPLAY || process.env.WAYLAND_DISPLAY);
  const forceHeadless = process.argv.includes("--headless");
  const headless = forceHeadless || !hasDisplay;

  console.log(`\nLaunching browser (${headless ? "headless" : "headed"})...`);
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();

  try {
    await page.goto(BASE_URL);

    await page.getByRole("button", { name: "Sign in" }).click();

    const modal = page.locator("#login-modal");
    await modal.waitFor({ state: "visible", timeout: 5000 });

    await modal.locator("#email").waitFor({ state: "visible", timeout: 5000 });
    await modal.locator("#email").clear();
    await modal.locator("#email").pressSequentially(email, { delay: 10 });
    await modal.locator("#password").clear();
    await modal.locator("#password").pressSequentially(password, { delay: 10 });
    await modal.getByRole("button", { name: "Sign in" }).click();

    await page.getByRole("button", { name: "Logout" }).waitFor({ timeout: 30_000 });

    await mkdir(dirname(AUTH_STATE_PATH), { recursive: true });
    await context.storageState({ path: AUTH_STATE_PATH });

    console.log(`\nAuth state saved to ${AUTH_STATE_PATH}`);
  } catch (err) {
    console.error("\nLogin failed:", err.message);
    await page.screenshot({ path: "playwright-auth-error.png" });
    console.log("Screenshot saved to playwright-auth-error.png");
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

await main();
