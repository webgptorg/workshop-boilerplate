import type { DatabaseSync } from "node:sqlite";
import { randomBytes, scryptSync } from "node:crypto";
const MENU = [
  [
    "Pečená ryba na zelenině",
    "Vařené brambory",
    "fish",
    "Ryba",
    "4, 7, 9",
    "Ryba, mrkev, celer, máslo, brambory",
  ],
  [
    "Špagety s rajčatovou omáčkou",
    "Sypané parmazánem",
    "pasta",
    "Bez masa",
    "1, 7",
    "Špagety, rajčata, cibule, parmazán",
  ],
  [
    "Kuřecí kousky na kari",
    "Rýže basmati",
    "chicken",
    "Drůbež",
    "1, 7",
    "Kuřecí maso, rýže, smetana, mouka, kari",
  ],
  [
    "Kapustové placičky",
    "Bramborová kaše",
    "greens",
    "Bez masa",
    "1, 3, 7",
    "Kapusta, mouka, vejce, mléko, brambory",
  ],
  [
    "Rajská s masovými kuličkami",
    "Těstoviny",
    "meatballs",
    "Maso",
    "1, 3, 7",
    "Mleté maso, vejce, mléko, rajčata, těstoviny",
  ],
  [
    "Zeleninové rizoto",
    "Sypané sýrem",
    "rice",
    "Bez masa",
    "7",
    "Rýže, hrášek, mrkev, kukuřice, sýr",
  ],
  [
    "Kuřecí maso na žampionech",
    "Dvoubarevná rýže",
    "mushroom",
    "Drůbež",
    "1, 7",
    "Kuřecí maso, žampiony, rýže, smetana, mouka",
  ],
  [
    "Čočka na kyselo",
    "Vejce a kyselá okurka",
    "lentils",
    "Bez masa",
    "1, 3",
    "Čočka, cibule, mouka, vejce, okurka",
  ],
  [
    "Kuskus s tuňákem",
    "Čerstvá zelenina",
    "salad",
    "Ryba",
    "1, 4, 7",
    "Kuskus, tuňák, rajčata, okurka, sýr",
  ],
  [
    "Bramborové dukátky s mákem",
    "Máslo a ovoce",
    "sweet",
    "Sladké",
    "1, 3, 7",
    "Brambory, mouka, vejce, mák, máslo, jablko",
  ],
];
const SOUPS = [
  "Brokolicový krém",
  "Bramborová s pohankou",
  "Polévka z červené řepy",
  "Zeleninová s knedlíčky",
  "Hrachová polévka",
];
export function seedDemo(database: DatabaseSync) {
  const PASSWORD = (value: string) => { const SALT=randomBytes(16).toString("hex"); return `scrypt$${SALT}$${scryptSync(value,SALT,64).toString("hex")}`; };
  const EXISTING = database.prepare("SELECT id FROM users WHERE username='adam'").get() as {id:number}|undefined;
  if (!EXISTING) database.prepare("INSERT INTO users(name,role,username,password_hash,created_at) VALUES (?, 'pupil','adam',?,?), (?, 'manager','jidelna',?,?), (?, 'parent','petra',?,?)")
    .run("Adam Novák",PASSWORD("adam123"),Date.now(),"Jana Veselá",PASSWORD("jidelna123"),Date.now(),"Petra Nováková",PASSWORD("petra123"),Date.now());
  const EXISTING_DEMO_MANAGER=database.prepare("SELECT id FROM users WHERE username='admin'").get();
  if (!EXISTING_DEMO_MANAGER) database.prepare("INSERT INTO users(name,role,username,password_hash,created_at) VALUES('Vedoucí jídelny','manager','admin',?,?)").run(PASSWORD("admin"),Date.now());
  for (const [USERNAME,PLAIN] of [["adam","adam123"],["jidelna","jidelna123"],["petra","petra123"]]) {
    const USER = database.prepare("SELECT id FROM users WHERE username=?").get(USERNAME) as {id:number}|undefined;
    if (USER) database.prepare("UPDATE users SET password_hash=COALESCE(password_hash,?) WHERE id=?").run(PASSWORD(PLAIN),USER.id);
  }
  const USER_IDS = Object.fromEntries(["adam","jidelna","petra","admin"].map((name) => [name,(database.prepare("SELECT id FROM users WHERE username=?").get(name) as {id:number}|undefined)?.id]));
  for (const [NAME,ROLE] of [["adam","pupil"],["jidelna","manager"],["jidelna","staff"],["petra","parent"],["admin","manager"],["admin","staff"]]) if (USER_IDS[NAME] && (NAME !== "admin" || !EXISTING_DEMO_MANAGER)) database.prepare("INSERT OR IGNORE INTO user_roles(user_id,canteen_id,role) VALUES(?,1,?)").run(USER_IDS[NAME],ROLE);
  database.prepare("INSERT OR IGNORE INTO diners(id,canteen_id,name,class_name,diner_number,type) VALUES(1,1,'Adam Novák','6. B','demo-1','pupil')").run();
  database.prepare("INSERT OR IGNORE INTO diner_links(diner_id,user_id,canteen_id,relationship,created_at) VALUES(1,?,1,'self',?),(1,?,1,'parent',?)").run(Number(USER_IDS.adam),Date.now(),Number(USER_IDS.petra),Date.now());
  if (database.prepare("SELECT id FROM meals LIMIT 1").get()) return;
  const INSERT = database.prepare(
    "INSERT INTO meals (date, slot, name, side, icon, category, allergens, ingredients, soup, canteen_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)",
  );
  for (let week = 0; week < 3; week++) {
    for (let day = 0; day < 5; day++) {
      const DATE = new Date(Date.UTC(2026, 8, 21 + week * 7 + day))
        .toISOString()
        .slice(0, 10);
      if (DATE === "2026-09-28") continue;
      for (let slot = 0; slot < 2; slot++) {
        const MEAL = MENU[((day + week) % 5) * 2 + slot];
        INSERT.run(DATE, slot + 1, ...MEAL, SOUPS[day]);
      }
    }
  }
  database
    .prepare(
      "INSERT INTO ideas (user_id, text, status, response, canteen_id) VALUES (3, ?, ?, ?, 1)",
    )
    .run(
      "Mohly by být špagety s rajčatovou omáčkou?",
      "Přijato",
      "Zařadili jsme je v pondělí 21. září jako alternativu. Parmazán podáváme zvlášť.",
    );
  database
    .prepare(
      "INSERT INTO feedback (user_id, meal_id, rating, comment, canteen_id) VALUES (1, 1, 4, ?, 1)",
    )
    .run("Brambory byly dobré, příště bych si dal víc zeleniny.");
}
