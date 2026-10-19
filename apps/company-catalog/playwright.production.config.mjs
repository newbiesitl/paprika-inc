import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "test/production",
  timeout: 30000,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4318",
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL ?? "chromium",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node server.mjs",
    env: { PORT: "4318" },
    url: "http://127.0.0.1:4318",
    reuseExistingServer: false,
  },
  reporter: "list",
  outputDir: "test-results",
});
