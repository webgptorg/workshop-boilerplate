import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { seed } from "./seed";
import type { AppData, Meal, User, Feedback, Idea } from "./types";
const DIRECTORY = process.env.DATABASE_DIRECTORY || join(process.cwd(), "data");
mkdirSync(DIRECTORY, { recursive: true });
export const DATABASE = new DatabaseSync(
  join(DIRECTORY, "spolecny-stul.sqlite"),
);
DATABASE.exec(`
 PRAGMA journal_mode = WAL;
 PRAGMA foreign_keys = ON;
 PRAGMA busy_timeout = 5000;
 CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, role TEXT, username TEXT UNIQUE);
 CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER REFERENCES users(id), expires INTEGER);
 CREATE TABLE IF NOT EXISTS meals (id INTEGER PRIMARY KEY, date TEXT, slot INTEGER, name TEXT, side TEXT, icon TEXT, category TEXT, allergens TEXT, ingredients TEXT, soup TEXT, UNIQUE(date, slot));
 CREATE TABLE IF NOT EXISTS selections (child_id INTEGER, date TEXT, meal_id INTEGER REFERENCES meals(id), PRIMARY KEY(child_id, date));
 CREATE TABLE IF NOT EXISTS feedback (id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id), meal_id INTEGER REFERENCES meals(id), rating INTEGER, comment TEXT, UNIQUE(user_id, meal_id));
 CREATE TABLE IF NOT EXISTS ideas (id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id), text TEXT, status TEXT DEFAULT 'Čeká na vyřízení', response TEXT DEFAULT '');
 CREATE TABLE IF NOT EXISTS preferences (child_id INTEGER PRIMARY KEY, text TEXT);
`);
seed(DATABASE);
export function getUser(token?: string): User | null {
  if (!token) return null;
  return (
    (DATABASE.prepare(
      "SELECT users.* FROM users JOIN sessions ON users.id = sessions.user_id WHERE token = ? AND expires > ?",
    ).get(token, Date.now()) as User | undefined) || null
  );
}
export function getData(user: User | null): AppData {
  const SELECTIONS = user
    ? DATABASE.prepare(
        "SELECT date, meal_id FROM selections WHERE child_id = 1",
      ).all()
    : [];
  return {
    user: user ? { ...user } : null,
    meals: DATABASE.prepare("SELECT * FROM meals ORDER BY date, slot")
      .all()
      .map((row) => ({ ...row })) as Meal[],
    selections: Object.fromEntries(
      SELECTIONS.map((row) => [row.date, row.meal_id]),
    ),
    feedback: DATABASE.prepare(
      `SELECT feedback.id, users.name, meals.name AS meal, rating, comment FROM feedback JOIN users ON users.id = user_id JOIN meals ON meals.id = meal_id ${user?.role === "staff" ? "" : "WHERE user_id = ?"} ORDER BY feedback.id DESC`,
    )
      .all(...(user?.role === "staff" ? [] : [user?.id || 0]))
      .map((row) => ({ ...row })) as Feedback[],
    ideas: DATABASE.prepare(
      `SELECT ideas.*, users.name FROM ideas JOIN users ON users.id = user_id ${user?.role === "staff" ? "" : "WHERE user_id = ?"} ORDER BY ideas.id DESC`,
    )
      .all(...(user?.role === "staff" ? [] : [user?.id || 0]))
      .map((row) => ({ ...row })) as Idea[],
    preferences: user
      ? String(
          DATABASE.prepare(
            "SELECT text FROM preferences WHERE child_id = 1",
          ).get()?.text || "",
        )
      : "",
    weeks: ["2026-09-21", "2026-09-28", "2026-10-05"],
  };
}
