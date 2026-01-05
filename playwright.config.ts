import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration for Chanvre Vert E2E Tests
 * 
 * Usage:
 *   Local:   npx playwright test --project=local
 *   Staging: PLAYWRIGHT_NO_WEBSERVER=1 npx playwright test --project=staging
 * 
 * The PLAYWRIGHT_NO_WEBSERVER env var disables the local dev server
 * (required when testing against remote staging environment)
 */

// Staging environment URLs
const STAGING_FRONTEND = "https://chanvre-vert-front-git-staging-hughsaweds-projects.vercel.app";
const STAGING_BACKEND = "https://cv-backend-1-5nru.onrender.com";

// Disable webServer for staging/CI runs
const useWebServer = !process.env.CI && !process.env.PLAYWRIGHT_NO_WEBSERVER;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html"], ["junit", { outputFile: "test-results/junit.xml" }]],
  
  // Local dev server (disabled for staging/CI)
  webServer: useWebServer ? {
    command: "pnpm dev",
    port: 3001,
    reuseExistingServer: true,
    timeout: 120_000,
  } : undefined,
  
  // Global settings
  use: {
    serviceWorkers: "block",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  
  projects: [
    // Local development testing
    {
      name: "local",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.FRONT_BASE_URL || "http://localhost:3001",
        extraHTTPHeaders: {
          "x-backend-url": process.env.BACKEND_BASE_URL || "http://localhost:3000",
        },
      },
    },
    // Staging environment testing
    {
      name: "staging",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: STAGING_FRONTEND,
        extraHTTPHeaders: {
          "x-backend-url": STAGING_BACKEND,
        },
      },
      // Limit parallel tests for staging (avoid overloading Render/Vercel)
      fullyParallel: false,
    },
    // Staging with Firefox (secondary)
    {
      name: "staging-firefox",
      use: {
        ...devices["Desktop Firefox"],
        baseURL: STAGING_FRONTEND,
        extraHTTPHeaders: {
          "x-backend-url": STAGING_BACKEND,
        },
      },
    },
  ],
});

