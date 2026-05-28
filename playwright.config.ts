import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    colorScheme: "dark",
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        storageState: "playwright/.auth/user.json",
      },
    },
  ],
  webServer: {
    command: "npx pnpm@10 dev",
    port: 5173,
    reuseExistingServer: true,
  },
});
