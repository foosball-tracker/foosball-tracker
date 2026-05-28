import { existsSync } from "node:fs";

import { defineConfig } from "@playwright/test";

const authStatePath = "playwright/.auth/user.json";
const hasAuthState = existsSync(authStatePath);
const e2ePort = Number(globalThis.process?.env.PLAYWRIGHT_PORT ?? 4174);
const baseURL = `http://localhost:${e2ePort}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL,
    trace: "on-first-retry",
    colorScheme: "dark",
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        storageState: hasAuthState ? authStatePath : undefined,
      },
    },
  ],
  webServer: {
    command: `npx pnpm@10 dev --host 0.0.0.0 --port ${e2ePort} --strictPort`,
    port: e2ePort,
    reuseExistingServer: !globalThis.process?.env.CI,
  },
});
