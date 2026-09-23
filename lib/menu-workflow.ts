import { DATABASE, type SessionUser } from "./database";
import { AppError } from "../src/errors/app-error";
import { getDefaultRuleSet } from "./basket-rules";
import type { Meal } from "./types";

export type MenuWeekStatus = "draft" | "ready" | "approved" | "published";

function requireWeekStart(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new AppError("Vyberte platný týden.");
  return value;
}

export function updateMenuWeek(user: SessionUser, body: Record<string, unknown>): void {
  const WEEK_START = requireWeekStart(body.weekStart);
  const ACTION = body.action;
  const CURRENT = DATABASE.prepare("SELECT status FROM menu_weeks WHERE canteen_id=? AND week_start=?").get(user.canteenId,WEEK_START) as {status:MenuWeekStatus}|undefined;
  if (!CURRENT) throw new AppError("Týden nebyl nalezen.",404);
  const IS_MANAGER = user.roles.includes("manager");
  let NEXT_STATUS: MenuWeekStatus;
  if (ACTION === "submitWeek" && (user.roles.includes("staff") || IS_MANAGER)) {
    if (CURRENT.status !== "draft") throw new AppError("Ke schválení lze odeslat pouze rozpracovaný týden.");
    NEXT_STATUS = "ready";
  } else if (ACTION === "approveWeek" && IS_MANAGER) {
    if (CURRENT.status !== "ready") throw new AppError("Schválit lze pouze týden čekající na schválení.");
    NEXT_STATUS = "approved";
  } else if (ACTION === "publishWeek" && IS_MANAGER) {
    if (CURRENT.status !== "approved") throw new AppError("Publikovat lze pouze schválený týden.");
    NEXT_STATUS = "published";
    createMenuRevision(user,WEEK_START,null);
  } else {
    throw new AppError("Tuto změnu stavu může provést pouze oprávněný pracovník jídelny.",403);
  }
  DATABASE.prepare("UPDATE menu_weeks SET status=?,updated_at=? WHERE canteen_id=? AND week_start=?").run(NEXT_STATUS,Date.now(),user.canteenId,WEEK_START);
}

export function createMenuRevision(user: SessionUser, weekStart: string, reason: string | null, change?: { mealId: number; previousName: string; currentName: string; idea?: { id: number; text: string } }): void {
  const MEALS = DATABASE.prepare("SELECT * FROM meals WHERE canteen_id=? AND date>=? AND date<? ORDER BY date,slot").all(user.canteenId,weekStart,nextWeek(weekStart)) as Meal[];
  if (!MEALS.length) throw new AppError("Týden nemá žádná jídla.");
  const RULE_SET = getDefaultRuleSet(weekStart);
  const REVISION_NUMBER = Number((DATABASE.prepare("SELECT COALESCE(MAX(revision_number),0)+1 AS next FROM menu_revisions WHERE canteen_id=? AND week_start=?").get(user.canteenId,weekStart) as {next:number}).next);
  const SNAPSHOT = JSON.stringify({
    meals: MEALS,
    recipeVersions: MEALS.map((meal) => ({ mealId: meal.id, recipeVersionId: meal.recipeVersionId ?? null, ingredients: meal.ingredients })),
    ruleSet: RULE_SET,
    basketResults: { status: "missingData", message: "Receptury s gramážemi nejsou pro tato jídla uložené.", groups: [] },
    variety: summarizeVariety(MEALS),
    costResults: { status: "missingData", message: "Ceny surovin nejsou pro tato jídla uložené." },
    ideas: change?.idea ? [change.idea] : [],
    changes: change ? [{ mealId: change.mealId, previousName: change.previousName, currentName: change.currentName }] : [],
  });
  DATABASE.prepare("INSERT INTO menu_revisions(canteen_id,week_start,revision_number,snapshot,rule_set_id,author_id,reason,created_at) VALUES(?,?,?,?,?,?,?,?)").run(user.canteenId,weekStart,REVISION_NUMBER,SNAPSHOT,RULE_SET.id,user.id,reason,Date.now());
}

export function nextWeek(weekStart: string): string {
  const DATE = new Date(`${weekStart}T12:00:00Z`);
  DATE.setUTCDate(DATE.getUTCDate()+7);
  return DATE.toISOString().slice(0,10);
}

function summarizeVariety(meals: Meal[]) {
  return Object.fromEntries(["Ryba","Bez masa","Sladké","Luštěniny"].map((category)=>[category,new Set(meals.filter((meal)=>meal.category===category).map((meal)=>meal.date)).size]));
}
