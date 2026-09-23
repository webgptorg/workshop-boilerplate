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
import { hashToken } from '${process.cwd()}/lib/security.ts';
import { updateMenuWeek } from '${process.cwd()}/lib/menu-workflow.ts';
const INSERT = DATABASE.prepare("INSERT INTO meals(date,slot,name,side,icon,category,allergens,ingredients,soup,canteen_id) VALUES(?,?,?,?,?,?,?,?,?,1)");
for (const [date,slot,name] of [['2026-09-21',1,'Testovací oběd'],['2026-09-21',2,'Testovací alternativa'],['2026-09-22',1,'Úterní oběd'],['2026-09-22',2,'Úterní alternativa'],['2026-09-28',1,'Oběd po svátku'],['2026-09-28',2,'Alternativa po svátku']]) INSERT.run(date,slot,name,'Brambory','fish','Ryba','4','Ryba, brambory','Zeleninová polévka');
for (const weekStart of ['2026-09-21','2026-09-28']) DATABASE.prepare("INSERT OR IGNORE INTO menu_weeks(canteen_id,week_start,status,updated_at) VALUES(?,?, 'draft',?)").run(1,weekStart,Date.now());
const USER = {id:Number(DATABASE.prepare("SELECT id FROM users WHERE email='manager@example.test'").get().id),role:'manager',canteenId:1,roles:['manager','staff']};
const DINERS = DATABASE.prepare("SELECT id,diner_number FROM diners WHERE canteen_id=1").all();
const PUPIL_RESULT = DATABASE.prepare("INSERT INTO users(name,username,password_hash,created_at) VALUES('Žák testu','pupil-test','scrypt$test$invalid',?)").run(Date.now());
const PUPIL_ID = Number(PUPIL_RESULT.lastInsertRowid);
DATABASE.prepare("INSERT INTO user_roles(user_id,canteen_id,role) VALUES(?,1,'pupil')").run(PUPIL_ID);
DATABASE.prepare("INSERT INTO sessions(token_hash,user_id,expires,active_role,diner_id,canteen_id) SELECT ?,?,?,'pupil',id,1 FROM diners WHERE diner_number='TEST-001'").run(hashToken('pupil-test-session'),PUPIL_ID,Date.now()+86400000);
DATABASE.prepare("INSERT INTO diner_links(diner_id,user_id,canteen_id,relationship,created_at) VALUES(?,?,1,'self',?),(?, ?,1,'self',?)").run(DINERS.find((diner)=>diner.diner_number==='TEST-001').id,PUPIL_ID,Date.now(),DINERS.find((diner)=>diner.diner_number==='TEST-002').id,PUPIL_ID,Date.now());
for (const weekStart of ['2026-09-21','2026-09-28']) { updateMenuWeek(USER,{action:'submitWeek',weekStart}); updateMenuWeek(USER,{action:'approveWeek',weekStart}); updateMenuWeek(USER,{action:'publishWeek',weekStart}); }
const PUPIL_MENU = DATABASE.prepare("SELECT * FROM meals WHERE canteen_id=1 AND date>='2026-09-21' AND date<'2026-09-28' ORDER BY date,slot").all();
DATABASE.prepare("UPDATE menu_revisions SET snapshot=json_set(snapshot,'$.meals',json(?)) WHERE canteen_id=1 AND week_start='2026-09-21'").run(JSON.stringify(PUPIL_MENU));
DATABASE.prepare("INSERT INTO meals(date,slot,name,side,icon,category,allergens,ingredients,soup,canteen_id) VALUES('2026-10-12',1,'Budoucí testovací oběd','Brambory','fish','Ryba','4','Ryba, brambory','Zeleninová polévka',1),('2026-10-12',2,'Budoucí alternativa','Rýže','rice','Bez masa','7','Rýže, zelenina','Zeleninová polévka',1)").run();
DATABASE.prepare("INSERT INTO menu_weeks(canteen_id,week_start,status,updated_at) VALUES(1,'2026-10-12','draft',?)").run(Date.now());
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
