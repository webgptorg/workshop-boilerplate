import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  use: {
    baseURL: "http://localhost:3101",
    viewport: { width: 1440, height: 1000 },
  },
  webServer: {
    command: "node scripts/test-server.mjs",
    url: "http://localhost:3101",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
