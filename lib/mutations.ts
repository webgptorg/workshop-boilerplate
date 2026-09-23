import { DATABASE } from "./database";
import { AppError } from "../src/errors/app-error";
import type { User } from "./types";
function requiredText(value: unknown, label: string, maximum = 1000): string {
  if (typeof value !== "string" || !value.trim() || value.length > maximum)
    throw new AppError(
      `Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`,
    );
  return value.trim();
}
function identifier(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1)
    throw new AppError("Neplatný identifikátor záznamu.");
  return value;
}
export function mutate(user: User, body: Record<string, unknown>) {
  const ACTION = body.action;
  const IS_STAFF = user.role === "staff";
  if (
    ["edit", "resolve", "applyProposal"].includes(String(ACTION)) &&
    !IS_STAFF
  )
    throw new AppError("Tuto změnu může provést pouze **jídelna**.", 403);
  if (
    ["select", "feedback", "idea", "preferences"].includes(String(ACTION)) &&
    IS_STAFF
  )
    throw new AppError("Použijte účet žáka nebo rodiče.", 403);
  if (ACTION === "applyProposal") {
    const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id = ?").get(
      identifier(body.sourceId),
    );
    const TARGET = DATABASE.prepare("SELECT * FROM meals WHERE id = ?").get(
      identifier(body.mealId),
    );
    const IDEA_ID = identifier(body.ideaId);
    const RESPONSE = requiredText(body.response, "Odpověď rodiči");
    if (
      !SOURCE ||
      !TARGET ||
      !DATABASE.prepare("SELECT id FROM ideas WHERE id = ?").get(IDEA_ID)
    )
      throw new AppError("Návrh už není dostupný.", 404);
    DATABASE.exec("BEGIN IMMEDIATE");
    try {
      DATABASE.prepare(
        "UPDATE meals SET name=?, side=?, icon=?, category=?, allergens=?, ingredients=? WHERE id=?",
      ).run(
        SOURCE.name,
        SOURCE.side,
        SOURCE.icon,
        SOURCE.category,
        SOURCE.allergens,
        SOURCE.ingredients,
        Number(TARGET.id),
      );
      DATABASE.prepare("DELETE FROM selections WHERE meal_id = ?").run(
        Number(TARGET.id),
      );
      DATABASE.prepare("DELETE FROM feedback WHERE meal_id = ?").run(
        Number(TARGET.id),
      );
      DATABASE.prepare(
        "UPDATE ideas SET status = ?, response = ? WHERE id = ?",
      ).run("Upraveno", RESPONSE, IDEA_ID);
      DATABASE.exec("COMMIT");
    } catch (error) {
      DATABASE.exec("ROLLBACK");
      throw error;
    }
  } else if (
    ACTION === "select" ||
    ACTION === "feedback" ||
    ACTION === "edit"
  ) {
    const MEAL_ID = identifier(body.mealId);
    const MEAL = DATABASE.prepare("SELECT * FROM meals WHERE id = ?").get(
      MEAL_ID,
    );
    if (!MEAL) throw new AppError("Jídlo již není v jídelníčku.", 404);
    if (ACTION === "select") {
      DATABASE.prepare(
        "INSERT INTO selections VALUES (1, ?, ?) ON CONFLICT(child_id, date) DO UPDATE SET meal_id = excluded.meal_id",
      ).run(String(MEAL.date), MEAL_ID);
    } else if (ACTION === "feedback") {
      const RATING = identifier(body.rating);
      if (RATING > 5) throw new AppError("Hodnocení musí být od 1 do 5.");
      const COMMENT =
        typeof body.comment === "string" ? body.comment.trim() : "";
      if (COMMENT.length > 1000)
        throw new AppError("Komentář smí mít nejvýše 1000 znaků.");
      DATABASE.prepare(
        "INSERT INTO feedback (user_id, meal_id, rating, comment) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, meal_id) DO UPDATE SET rating = excluded.rating, comment = excluded.comment",
      ).run(user.id, MEAL_ID, RATING, COMMENT);
    } else {
      const CATEGORY = requiredText(body.category, "Kategorie");
      const ICON = requiredText(body.icon, "Ikona");
      const SOUP = requiredText(body.soup, "Polévka", 120);
      if (
        !["Ryba", "Drůbež", "Maso", "Bez masa", "Sladké"].includes(CATEGORY) ||
        ![
          "fish",
          "pasta",
          "chicken",
          "greens",
          "meatballs",
          "rice",
          "mushroom",
          "lentils",
          "salad",
          "sweet",
        ].includes(ICON)
      )
        throw new AppError("Vyberte platnou kategorii a ikonu.");
      DATABASE.prepare(
        "UPDATE meals SET name = ?, side = ?, ingredients = ?, allergens = ?, category = ?, icon = ? WHERE id = ?",
      ).run(
        requiredText(body.name, "Název", 120),
        requiredText(body.side, "Příloha", 120),
        requiredText(body.ingredients, "Suroviny"),
        requiredText(body.allergens, "Alergeny", 100),
        CATEGORY,
        ICON,
        MEAL_ID,
      );
      DATABASE.prepare("UPDATE meals SET soup = ? WHERE date = ?").run(
        SOUP,
        String(MEAL.date),
      );
    }
  } else if (ACTION === "idea") {
    DATABASE.prepare("INSERT INTO ideas (user_id, text) VALUES (?, ?)").run(
      user.id,
      requiredText(body.text, "Námět"),
    );
  } else if (ACTION === "resolve") {
    const STATUS = requiredText(body.status, "Stav");
    if (!["Přijato", "Upraveno", "Nezařazeno"].includes(STATUS))
      throw new AppError("Neplatný stav námětu.");
    const RESPONSE = requiredText(
      body.response,
      "Vysvětlení a případná alternativa",
    );
    const RESULT = DATABASE.prepare(
      "UPDATE ideas SET status = ?, response = ? WHERE id = ?",
    ).run(STATUS, RESPONSE, identifier(body.ideaId));
    if (!RESULT.changes) throw new AppError("Námět nebyl nalezen.", 404);
  } else if (ACTION === "preferences") {
    if (user.role !== "parent")
      throw new AppError("Preference spravuje rodič.", 403);
    const TEXT = typeof body.text === "string" ? body.text.trim() : "";
    if (TEXT.length > 1000)
      throw new AppError("Preference smí mít nejvýše 1000 znaků.");
    DATABASE.prepare(
      "INSERT INTO preferences VALUES (1, ?) ON CONFLICT(child_id) DO UPDATE SET text = excluded.text",
    ).run(TEXT);
  } else throw new AppError("Neznámá akce.");
}
