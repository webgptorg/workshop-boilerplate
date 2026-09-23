import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig } from "@playwright/test";
process.env.DATABASE_DIRECTORY ||= mkdtempSync(join(tmpdir(), "stul-browser-config-"));
export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  use: { baseURL: "http://localhost:3101", viewport: { width: 1440, height: 1000 } },
  webServer: { command: "node scripts/test-server.mjs", url: "http://localhost:3101", reuseExistingServer: false, timeout: 60000 },
});
