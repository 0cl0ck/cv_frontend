import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html"], ["junit", { outputFile: "test-results/junit.xml" }]],
  webServer: {
    command: "pnpm dev",
    port: 3001,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  // See tests run visually by using --headed or --ui
  use: {
    baseURL: process.env.FRONT_BASE_URL || "http://localhost:3001",
    serviceWorkers: "block",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { serviceWorkers: "block" } }],
});

