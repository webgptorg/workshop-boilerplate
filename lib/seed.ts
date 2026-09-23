import type { DatabaseSync } from "node:sqlite";
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
export function seed(database: DatabaseSync) {
  if (database.prepare("SELECT id FROM users LIMIT 1").get()) return;
  database
    .prepare(
      "INSERT INTO users VALUES (1, ?, ?, ?), (2, ?, ?, ?), (3, ?, ?, ?)",
    )
    .run(
      "Adam Novák",
      "pupil",
      "adam",
      "Jana Veselá",
      "staff",
      "jidelna",
      "Petra Nováková",
      "parent",
      "petra",
    );
  const INSERT = database.prepare(
    "INSERT INTO meals (date, slot, name, side, icon, category, allergens, ingredients, soup) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
      "INSERT INTO ideas (user_id, text, status, response) VALUES (3, ?, ?, ?)",
    )
    .run(
      "Mohly by být špagety s rajčatovou omáčkou?",
      "Přijato",
      "Zařadili jsme je v pondělí 21. září jako alternativu. Parmazán podáváme zvlášť.",
    );
  database
    .prepare(
      "INSERT INTO feedback (user_id, meal_id, rating, comment) VALUES (1, 1, 4, ?)",
    )
    .run("Brambory byly dobré, příště bych si dal víc zeleniny.");
}
