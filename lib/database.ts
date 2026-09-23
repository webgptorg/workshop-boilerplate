import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { seedDemo } from "./seed";
import type { AppData, Meal, User, Role } from "./types";
import { hashToken } from "./security";
const DIRECTORY = process.env.DATABASE_DIRECTORY || join(process.cwd(), "data");
mkdirSync(DIRECTORY, { recursive: true });
export const DATABASE = new DatabaseSync(join(DIRECTORY, "spolecny-stul.sqlite"));
DATABASE.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;");
function migrate() {
  const VERSION = Number(DATABASE.prepare("PRAGMA user_version").get()?.user_version || 0);
  if (VERSION < 1) {
  DATABASE.exec(`
    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, role TEXT, username TEXT UNIQUE, email TEXT, password_hash TEXT, created_at INTEGER NOT NULL DEFAULT 0, deleted_at INTEGER);
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER REFERENCES users(id), expires INTEGER);
    CREATE TABLE IF NOT EXISTS meals (id INTEGER PRIMARY KEY, date TEXT, slot INTEGER, name TEXT, side TEXT, icon TEXT, category TEXT, allergens TEXT, ingredients TEXT, soup TEXT, UNIQUE(date, slot));
    CREATE TABLE IF NOT EXISTS selections (child_id INTEGER, date TEXT, meal_id INTEGER REFERENCES meals(id), PRIMARY KEY(child_id, date));
    CREATE TABLE IF NOT EXISTS feedback (id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id), meal_id INTEGER REFERENCES meals(id), rating INTEGER, comment TEXT, UNIQUE(user_id, meal_id));
    CREATE TABLE IF NOT EXISTS ideas (id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id), text TEXT, status TEXT DEFAULT 'Čeká na vyřízení', response TEXT DEFAULT '');
    CREATE TABLE IF NOT EXISTS preferences (child_id INTEGER PRIMARY KEY, text TEXT);
  `);
  DATABASE.exec("BEGIN IMMEDIATE");
  try {
    DATABASE.exec(`
      CREATE TABLE IF NOT EXISTS canteens (id INTEGER PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL);
      INSERT OR IGNORE INTO canteens VALUES (1, 'Školní jídelna', unixepoch()*1000);
      CREATE TABLE IF NOT EXISTS user_roles (user_id INTEGER NOT NULL REFERENCES users(id), canteen_id INTEGER NOT NULL REFERENCES canteens(id), role TEXT NOT NULL, PRIMARY KEY(user_id,canteen_id,role));
      CREATE TABLE IF NOT EXISTS diners (id INTEGER PRIMARY KEY, canteen_id INTEGER NOT NULL REFERENCES canteens(id), name TEXT NOT NULL, class_name TEXT, diner_number TEXT NOT NULL, type TEXT NOT NULL CHECK(type IN ('pupil','adult')), archived_at INTEGER, UNIQUE(canteen_id,diner_number));
      CREATE TABLE IF NOT EXISTS diner_links (diner_id INTEGER NOT NULL REFERENCES diners(id), user_id INTEGER NOT NULL REFERENCES users(id), canteen_id INTEGER NOT NULL REFERENCES canteens(id), relationship TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY(diner_id,user_id));
      CREATE TABLE IF NOT EXISTS pairing_codes (id INTEGER PRIMARY KEY, diner_id INTEGER NOT NULL REFERENCES diners(id), canteen_id INTEGER NOT NULL REFERENCES canteens(id), code_hash TEXT NOT NULL UNIQUE, uses INTEGER NOT NULL DEFAULT 0, revoked_at INTEGER, created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS invitations (id INTEGER PRIMARY KEY, canteen_id INTEGER NOT NULL REFERENCES canteens(id), email TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE, role TEXT NOT NULL, expires_at INTEGER NOT NULL, used_at INTEGER);
      CREATE TABLE IF NOT EXISTS password_resets (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), token_hash TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL, used_at INTEGER);
      CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY, canteen_id INTEGER NOT NULL REFERENCES canteens(id), actor_user_id INTEGER, action TEXT NOT NULL, subject_id INTEGER, reason TEXT, created_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS rate_limits (key_hash TEXT PRIMARY KEY, attempts INTEGER NOT NULL, window_started INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS selections_v2 (diner_id INTEGER NOT NULL REFERENCES diners(id), canteen_id INTEGER NOT NULL REFERENCES canteens(id), date TEXT NOT NULL, meal_id INTEGER NOT NULL REFERENCES meals(id), PRIMARY KEY(diner_id,date));
      CREATE TABLE IF NOT EXISTS preferences_v2 (diner_id INTEGER PRIMARY KEY REFERENCES diners(id), canteen_id INTEGER NOT NULL REFERENCES canteens(id), text TEXT NOT NULL DEFAULT '');
    `);
    const USER_COLUMNS = DATABASE.prepare("PRAGMA table_info(users)").all() as {name:string}[];
    if (!USER_COLUMNS.some((column) => column.name === "email")) DATABASE.exec("ALTER TABLE users ADD COLUMN email TEXT");
    if (!USER_COLUMNS.some((column) => column.name === "password_hash")) DATABASE.exec("ALTER TABLE users ADD COLUMN password_hash TEXT");
    if (!USER_COLUMNS.some((column) => column.name === "created_at")) DATABASE.exec("ALTER TABLE users ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0");
    if (!USER_COLUMNS.some((column) => column.name === "deleted_at")) DATABASE.exec("ALTER TABLE users ADD COLUMN deleted_at INTEGER");
    const COLUMNS = DATABASE.prepare("PRAGMA table_info(meals)").all() as {name:string}[];
    if (!COLUMNS.some((column) => column.name === "canteen_id")) DATABASE.exec("ALTER TABLE meals ADD COLUMN canteen_id INTEGER NOT NULL DEFAULT 1");
    for (const table of ["feedback", "ideas", "selections", "preferences"]) {
      const TABLE_COLUMNS = DATABASE.prepare(`PRAGMA table_info(${table})`).all() as {name:string}[];
      if (!TABLE_COLUMNS.some((column) => column.name === "canteen_id")) DATABASE.exec(`ALTER TABLE ${table} ADD COLUMN canteen_id INTEGER NOT NULL DEFAULT 1`);
    }
    for (const table of ["diner_links", "pairing_codes"]) {
      const TABLE_COLUMNS = DATABASE.prepare(`PRAGMA table_info(${table})`).all() as {name:string}[];
      if (!TABLE_COLUMNS.some((column) => column.name === "canteen_id")) DATABASE.exec(`ALTER TABLE ${table} ADD COLUMN canteen_id INTEGER NOT NULL DEFAULT 1`);
    }
    const INVITATION_COLUMNS = DATABASE.prepare("PRAGMA table_info(invitations)").all() as {name:string}[];
    if (!INVITATION_COLUMNS.some((column) => column.name === "email")) DATABASE.exec("ALTER TABLE invitations ADD COLUMN email TEXT NOT NULL DEFAULT ''");
    DATABASE.exec("INSERT OR IGNORE INTO user_roles(user_id,canteen_id,role) SELECT id,1,role FROM users WHERE role IN ('pupil','parent','staff','manager')");
    DATABASE.exec("CREATE TABLE IF NOT EXISTS sessions_v2 (token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), expires INTEGER NOT NULL, active_role TEXT NOT NULL DEFAULT 'parent', diner_id INTEGER REFERENCES diners(id), canteen_id INTEGER NOT NULL REFERENCES canteens(id))");
    DATABASE.exec("DROP TABLE sessions; ALTER TABLE sessions_v2 RENAME TO sessions;");
    DATABASE.exec("INSERT OR IGNORE INTO diners(id,canteen_id,name,class_name,diner_number,type) SELECT 1,1,'Adam Novák','6. B','legacy-1','pupil' WHERE EXISTS (SELECT 1 FROM users LIMIT 1)");
    DATABASE.exec("INSERT OR IGNORE INTO diner_links(diner_id,user_id,canteen_id,relationship,created_at) SELECT 1,id,1,'self',unixepoch()*1000 FROM users WHERE role='pupil'; INSERT OR IGNORE INTO diner_links(diner_id,user_id,canteen_id,relationship,created_at) SELECT 1,id,1,'parent',unixepoch()*1000 FROM users WHERE role='parent'");
    DATABASE.exec("INSERT OR IGNORE INTO selections_v2(diner_id,canteen_id,date,meal_id) SELECT child_id,1,date,meal_id FROM selections WHERE child_id=1; INSERT OR IGNORE INTO preferences_v2(diner_id,canteen_id,text) SELECT child_id,1,text FROM preferences");
    DATABASE.exec("PRAGMA user_version=1");
    DATABASE.exec("CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(lower(email)) WHERE email IS NOT NULL");
    DATABASE.exec("COMMIT");
  } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
  }
  if (VERSION < 2) {
    DATABASE.exec("PRAGMA foreign_keys=OFF; PRAGMA legacy_alter_table=ON; BEGIN IMMEDIATE");
    try {
      DATABASE.exec(`ALTER TABLE meals RENAME TO meals_before_tenant_key;
        CREATE TABLE meals (id INTEGER PRIMARY KEY, date TEXT, slot INTEGER, name TEXT, side TEXT, icon TEXT, category TEXT, allergens TEXT, ingredients TEXT, soup TEXT, canteen_id INTEGER NOT NULL REFERENCES canteens(id), UNIQUE(canteen_id,date,slot));
        INSERT INTO meals(id,date,slot,name,side,icon,category,allergens,ingredients,soup,canteen_id) SELECT id,date,slot,name,side,icon,category,allergens,ingredients,soup,canteen_id FROM meals_before_tenant_key;
        DROP TABLE meals_before_tenant_key; PRAGMA user_version=2; COMMIT;`);
    } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
    finally { DATABASE.exec("PRAGMA legacy_alter_table=OFF; PRAGMA foreign_keys=ON"); }
  }
  if (VERSION < 3) {
    const IDEA_COLUMNS = DATABASE.prepare("PRAGMA table_info(ideas)").all() as { name: string }[];
    if (!IDEA_COLUMNS.some((column) => column.name === "proposal_metadata")) DATABASE.exec("ALTER TABLE ideas ADD COLUMN proposal_metadata TEXT");
    DATABASE.exec("PRAGMA user_version=3");
  }
  if (VERSION < 4) {
    DATABASE.exec(`CREATE TABLE IF NOT EXISTS menu_weeks (canteen_id INTEGER NOT NULL REFERENCES canteens(id), week_start TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','ready','approved','published')), updated_at INTEGER NOT NULL, PRIMARY KEY(canteen_id,week_start));
      CREATE TABLE IF NOT EXISTS menu_revisions (id INTEGER PRIMARY KEY, canteen_id INTEGER NOT NULL REFERENCES canteens(id), week_start TEXT NOT NULL, revision_number INTEGER NOT NULL, snapshot TEXT NOT NULL, rule_set_id TEXT NOT NULL, author_id INTEGER REFERENCES users(id), reason TEXT, created_at INTEGER NOT NULL, UNIQUE(canteen_id,week_start,revision_number));
      PRAGMA user_version=4`);
  }
}
migrate();
if (process.env.IS_DEMO_MODE === "true") seedDemo(DATABASE);
export type SessionUser = User & { role: Role; canteenId: number; dinerId: number | null; roles: Role[] };
export function getUser(token?: string): SessionUser | null {
  if (!token) return null;
  const ROW = DATABASE.prepare(`SELECT u.id,u.name,u.username,u.email,s.active_role AS role,s.canteen_id AS canteenId,s.diner_id AS dinerId,
    (SELECT group_concat(role, ',') FROM user_roles WHERE user_id=u.id AND canteen_id=s.canteen_id) AS roleList
    FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=? AND s.expires>? AND u.deleted_at IS NULL
    AND EXISTS (SELECT 1 FROM user_roles r WHERE r.user_id=u.id AND r.canteen_id=s.canteen_id AND r.role=s.active_role)
    AND (s.active_role NOT IN ('parent','pupil','adult') OR EXISTS (SELECT 1 FROM diner_links l JOIN diners d ON d.id=l.diner_id WHERE l.user_id=u.id AND l.canteen_id=s.canteen_id AND d.id=s.diner_id AND d.canteen_id=s.canteen_id AND (d.archived_at IS NULL OR d.archived_at>?)))`).get(hashToken(token), Date.now(), Date.now()-30*86400000) as {id:number;name:string;username:string|null;email:string|null;role:Role;canteenId:number;dinerId:number|null;roleList:string}|undefined;
  if (!ROW) return null;
  return { id:ROW.id,name:ROW.name,username:ROW.username || "",email:ROW.email,role:ROW.role,canteenId:ROW.canteenId,dinerId:ROW.dinerId,roles:ROW.roleList?.split(",") as Role[] || [] };
}
export function getData(user: SessionUser | null): AppData {
  const CANteen_ID = user?.canteenId || 1;
  const ALL_WEEK_STARTS = [...new Set((DATABASE.prepare("SELECT date FROM meals WHERE canteen_id=? ORDER BY date").all(CANteen_ID) as {date:string}[]).map(({date}) => { const DATE = new Date(`${date}T12:00:00Z`); DATE.setUTCDate(DATE.getUTCDate() - ((DATE.getUTCDay() + 6) % 7)); return DATE.toISOString().slice(0,10); }))];
  for (const WEEK_START of ALL_WEEK_STARTS) DATABASE.prepare("INSERT OR IGNORE INTO menu_weeks(canteen_id,week_start,status,updated_at) VALUES(?,?,'draft',?)").run(CANteen_ID,WEEK_START,Date.now());
  const DINER_ID = user?.dinerId;
  const SELECTIONS = user && DINER_ID ? DATABASE.prepare("SELECT date,meal_id FROM selections_v2 WHERE diner_id=? AND canteen_id=?").all(DINER_ID,CANteen_ID) as {date:string;meal_id:number}[] : [];
  const IS_STAFF = user?.roles.some((role) => role === "staff" || role === "manager");
  const FEEDBACK = DATABASE.prepare(`SELECT f.id,CASE WHEN f.rating IS NOT NULL THEN 'Anonymní strávník' ELSE COALESCE(u.name,'Smazaný uživatel') END AS name,m.name AS meal,f.rating,f.comment FROM feedback f LEFT JOIN users u ON u.id=f.user_id JOIN meals m ON m.id=f.meal_id WHERE f.canteen_id=? ${IS_STAFF ? "" : "AND f.user_id=?"} ORDER BY f.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0])).map((row)=>({...row}));
  const IDEAS = DATABASE.prepare(`SELECT i.*,i.proposal_metadata AS proposalMetadata,COALESCE(u.name,'Smazaný uživatel') AS name FROM ideas i LEFT JOIN users u ON u.id=i.user_id WHERE i.canteen_id=? ${IS_STAFF ? "" : "AND i.user_id=?"} ORDER BY i.id DESC`).all(...(IS_STAFF ? [CANteen_ID] : [CANteen_ID,user?.id || 0]));
  const ROLES = user ? DATABASE.prepare("SELECT role FROM user_roles WHERE user_id=? AND canteen_id=? ORDER BY role").all(user.id,CANteen_ID).map((row)=>String((row as {role:string}).role) as Role) : [];
  const USER_CANTEENS = user ? DATABASE.prepare("SELECT c.id,c.name,group_concat(r.role, ',') AS role_list FROM user_roles r JOIN canteens c ON c.id=r.canteen_id WHERE r.user_id=? GROUP BY c.id,c.name ORDER BY c.name").all(user.id).map((row)=>{const ITEM=row as {id:number;name:string;role_list:string};return {id:ITEM.id,name:ITEM.name,roles:ITEM.role_list.split(",") as Role[]};}) : [];
  const DINERS = user ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.type,(SELECT u.username FROM diner_links own JOIN users u ON u.id=own.user_id JOIN user_roles r ON r.user_id=u.id AND r.canteen_id=d.canteen_id AND r.role='pupil' WHERE own.diner_id=d.id AND own.relationship='self' LIMIT 1) AS pupilUsername FROM diners d JOIN diner_links l ON l.diner_id=d.id WHERE l.user_id=? AND l.canteen_id=? AND d.canteen_id=? AND (d.archived_at IS NULL OR d.archived_at>?) ORDER BY d.name").all(user.id,CANteen_ID,CANteen_ID,Date.now()-30*86400000).map((row)=>({...row})) as AppData["diners"] : [];
  const AUDIT_LOG = user?.roles.includes("manager") ? DATABASE.prepare("SELECT id,action,reason,created_at AS createdAt FROM audit_log WHERE canteen_id=? ORDER BY id DESC LIMIT 100").all(CANteen_ID) as AppData["auditLog"] : [];
  const MANAGED_DINERS = user?.roles.includes("manager") ? DATABASE.prepare("SELECT d.id,d.name,d.class_name AS className,d.diner_number AS dinerNumber,d.type,d.archived_at AS archivedAt,COALESCE((SELECT group_concat(u.id||':'||u.name,'|') FROM diner_links l JOIN users u ON u.id=l.user_id WHERE l.diner_id=d.id AND l.canteen_id=d.canteen_id AND l.relationship='parent'),'') AS parentLinks FROM diners d WHERE d.canteen_id=? ORDER BY d.name").all(CANteen_ID) as AppData["managedDiners"] : [];
  const MANAGED_PEOPLE = user?.roles.includes("manager") ? DATABASE.prepare("SELECT u.id,u.name,u.email,group_concat(r.role, ',') AS role_list FROM users u JOIN user_roles r ON r.user_id=u.id WHERE r.canteen_id=? AND u.deleted_at IS NULL GROUP BY u.id,u.name,u.email ORDER BY u.name").all(CANteen_ID).map((row)=>{const ITEM=row as {id:number;name:string;email:string|null;role_list:string};return {id:ITEM.id,name:ITEM.name,email:ITEM.email,roles:ITEM.role_list.split(",") as Role[]};}) : [];
  const PREFERENCES_LIST = user?.roles.some((role)=>role === "staff" || role === "manager") ? DATABASE.prepare("SELECT d.name AS dinerName,p.text FROM preferences_v2 p JOIN diners d ON d.id=p.diner_id WHERE p.canteen_id=? AND p.text<>'' ORDER BY d.name").all(CANteen_ID) as AppData["preferencesList"] : [];
  const IS_PRIVILEGED = Boolean(user?.roles.some((role) => role === "staff" || role === "manager"));
  const WEEKS = DATABASE.prepare("SELECT week_start AS weekStart,status FROM menu_weeks WHERE canteen_id=? ORDER BY week_start").all(CANteen_ID) as { weekStart: string; status: "draft" | "ready" | "approved" | "published" }[];
  const DISPLAY_WEEKS = WEEKS.length ? WEEKS : ["2026-09-21","2026-09-28","2026-10-05"].map((weekStart)=>({weekStart,status:"draft" as const}));
  const MENU_REVISIONS = DATABASE.prepare("SELECT id,week_start AS weekStart,revision_number AS revisionNumber,snapshot,rule_set_id AS ruleSetId,author_id AS authorId,reason,created_at AS createdAt FROM menu_revisions WHERE canteen_id=? ORDER BY revision_number DESC").all(CANteen_ID) as {id:number;weekStart:string;revisionNumber:number;snapshot:string;ruleSetId:string;authorId:number|null;reason:string|null;createdAt:number}[];
  let MEALS: Meal[];
  if (IS_PRIVILEGED) MEALS = DATABASE.prepare("SELECT * FROM meals WHERE canteen_id=? ORDER BY date,slot").all(CANteen_ID).map((row)=>({...row})) as Meal[];
  else {
    const PUBLISHED_WEEKS = WEEKS.filter((week) => week.status === "published");
    MEALS = PUBLISHED_WEEKS.flatMap((week) => {
      const REVISION = MENU_REVISIONS.find((revision) => revision.weekStart === week.weekStart);
      return REVISION ? (JSON.parse(REVISION.snapshot) as { meals: Meal[] }).meals : [];
    });
  }
  const MEAL_AVAILABILITY_ROWS = DATABASE.prepare(`SELECT date,COUNT(*) AS mealCount FROM meals WHERE canteen_id=? ${user && !IS_PRIVILEGED ? "AND date IN (SELECT DISTINCT date FROM meals published_meals JOIN menu_weeks mw ON mw.canteen_id=published_meals.canteen_id WHERE mw.status='published' AND published_meals.canteen_id=meals.canteen_id AND date(published_meals.date,'-' || ((CAST(strftime('%w',published_meals.date)+6 AS INTEGER) % 7)) || ' days')=mw.week_start)" : ""} GROUP BY date`).all(CANteen_ID) as {date:string;mealCount:number}[];
  const MEAL_AVAILABILITY = Object.fromEntries(MEAL_AVAILABILITY_ROWS.map(({date,mealCount})=>[date,mealCount>0]));
  const OPERATING_DATES = Object.keys(MEAL_AVAILABILITY).filter((date)=>MEAL_AVAILABILITY[date]);
  const IS_ANONYMOUS = !user;
  return { isDemoMode:process.env.IS_DEMO_MODE === "true", user: user ? {id:user.id,name:user.name,role:user.role,username:user.username,email:user.email} : null, roles:ROLES, activeDinerId:DINER_ID || null, canteens:USER_CANTEENS, activeCanteenId:user?.canteenId || null, auditLog:AUDIT_LOG, managedDiners:MANAGED_DINERS, managedPeople:MANAGED_PEOPLE, diners:DINERS, meals:IS_ANONYMOUS ? [] : MEALS, mealAvailability:MEAL_AVAILABILITY, recipeVersions:[], selections:Object.fromEntries(SELECTIONS.map((row)=>[row.date,row.meal_id])), feedback:FEEDBACK as AppData["feedback"], ideas:IDEAS as AppData["ideas"], preferences:user && DINER_ID ? String((DATABASE.prepare("SELECT text FROM preferences_v2 WHERE diner_id=? AND canteen_id=?").get(DINER_ID,CANteen_ID) as {text?:string}|undefined)?.text || "") : "", preferencesList:PREFERENCES_LIST, weeks:DISPLAY_WEEKS.map((week)=>week.weekStart), operatingDates: OPERATING_DATES, menuWeeks: DISPLAY_WEEKS.map((week)=>({...week,revisions:MENU_REVISIONS.filter((revision)=>revision.weekStart===week.weekStart).map(({id,reason,createdAt,snapshot})=>({id,reason,createdAt,snapshot}))})) };
}
