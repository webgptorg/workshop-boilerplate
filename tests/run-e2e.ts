import { spawnSync } from "node:child_process";

const RESULT = spawnSync(
  process.execPath,
  [require.resolve("@playwright/test/cli"), "test", ...process.argv.slice(2)],
  { stdio: "inherit" },
);

if (RESULT.error) throw RESULT.error;
process.exitCode = RESULT.status ?? 1;
