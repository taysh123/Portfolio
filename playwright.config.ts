import { defineConfig, devices } from "playwright/test";

const executablePath = process.env.PW_CHROMIUM || undefined;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  use: { baseURL: "http://localhost:3400", launchOptions: { executablePath } },
  webServer: {
    command: "npx next start --port 3400",
    url: "http://localhost:3400",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
  ],
});
