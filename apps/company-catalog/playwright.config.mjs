import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "test/browser",
  timeout: 30000,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4317",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    channel: process.env.PLAYWRIGHT_CHANNEL ?? "chromium",
  },
  webServer: {
    command: "node test/start.mjs",
    url: "http://127.0.0.1:4317",
    reuseExistingServer: false,
    timeout: 30000,
  },
  reporter: "list",
  outputDir: "test-results",
});
