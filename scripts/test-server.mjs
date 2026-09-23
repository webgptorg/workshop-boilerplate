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
const FIXTURE = `import { DATABASE } from '${process.cwd()}/lib/database.ts';
import { updateMenuWeek } from '${process.cwd()}/lib/menu-workflow.ts';
const INSERT = DATABASE.prepare("INSERT INTO meals(date,slot,name,side,icon,category,allergens,ingredients,soup,canteen_id) VALUES(?,?,?,?,?,?,?,?,?,1)");
for (const [date,slot,name] of [['2026-09-21',1,'Testovací oběd'],['2026-09-22',1,'Úterní oběd'],['2026-09-28',1,'Oběd po svátku']]) INSERT.run(date,slot,name,'Brambory','fish','Ryba','4','Ryba, brambory','Zeleninová polévka');
for (const weekStart of ['2026-09-21','2026-09-28']) DATABASE.prepare("INSERT OR IGNORE INTO menu_weeks(canteen_id,week_start,status,updated_at) VALUES(?,?, 'draft',?)").run(1,weekStart,Date.now());
const USER = {id:Number(DATABASE.prepare("SELECT id FROM users WHERE email='manager@example.test'").get().id),role:'manager',canteenId:1,roles:['manager','staff']};
for (const weekStart of ['2026-09-21','2026-09-28']) { updateMenuWeek(USER,{action:'submitWeek',weekStart}); updateMenuWeek(USER,{action:'approveWeek',weekStart}); updateMenuWeek(USER,{action:'publishWeek',weekStart}); }
`;
const FIXTURE_FILE = join(DIRECTORY, "browser-fixture.mts");
writeFileSync(FIXTURE_FILE, FIXTURE);
const FIXTURE_RESULT = spawnSync("node_modules/.bin/tsx", [FIXTURE_FILE], { cwd: process.cwd(), env: ENVIRONMENT, encoding: "utf8" });
if (FIXTURE_RESULT.status !== 0) throw new Error(FIXTURE_RESULT.stderr || FIXTURE_RESULT.stdout);
const SERVER = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", "3101"], { stdio: "inherit", env: ENVIRONMENT });
function cleanup() { SERVER.kill("SIGTERM"); rmSync(DIRECTORY, { recursive: true, force: true }); }
process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);
SERVER.on("exit", (code) => { rmSync(DIRECTORY, { recursive: true, force: true }); process.exit(code || 0); });
