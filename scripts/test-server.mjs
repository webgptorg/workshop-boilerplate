import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
const DIRECTORY = mkdtempSync(join(tmpdir(), "stul-browser-"));
const SERVER = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--port", "3101"],
  { stdio: "inherit", env: { ...process.env, DATABASE_DIRECTORY: DIRECTORY } },
);
function cleanup() {
  SERVER.kill("SIGTERM");
  rmSync(DIRECTORY, { recursive: true, force: true });
}
process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);
SERVER.on("exit", (code) => {
  rmSync(DIRECTORY, { recursive: true, force: true });
  process.exit(code || 0);
});
