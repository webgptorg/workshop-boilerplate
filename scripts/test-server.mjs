import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";
const DIRECTORY = process.env.DATABASE_DIRECTORY || mkdtempSync(join(tmpdir(), "stul-browser-"));
mkdirSync(DIRECTORY, { recursive: true });
const ENVIRONMENT = { ...process.env, DATABASE_DIRECTORY: DIRECTORY, IS_DEMO_MODE: "false" };
function runAdmin(...args) {
  const RESULT = spawnSync("node_modules/.bin/tsx", ["scripts/admin.ts", ...args], { cwd: process.cwd(), env: ENVIRONMENT, encoding: "utf8" });
  if (RESULT.status !== 0) throw new Error(RESULT.stderr || RESULT.stdout);
}
runAdmin("create-canteen", "Testovací jídelna", "Vedoucí testu", "manager@example.test", "TestPassword-2026!");
const CSV = join(DIRECTORY, "diners.csv");
writeFileSync(CSV, "cislo_stravnika;jmeno;trida;typ\nTEST-001;Adam Novák;6. B;pupil\nTEST-002;Eva Nováková;2. A;pupil\n");
runAdmin("import-diners", CSV, "--canteen=1", "--confirm");
const SERVER = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", "3101"], { stdio: "inherit", env: ENVIRONMENT });
function cleanup() { SERVER.kill("SIGTERM"); rmSync(DIRECTORY, { recursive: true, force: true }); }
process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);
SERVER.on("exit", (code) => { rmSync(DIRECTORY, { recursive: true, force: true }); process.exit(code || 0); });
