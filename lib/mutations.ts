import { DATABASE, type SessionUser } from "./database";
import { AppError } from "../src/errors/app-error";
function requiredText(value: unknown, label: string, maximum = 1000): string {
  if (typeof value !== "string" || !value.trim() || value.length > maximum) throw new AppError(`Pole **${label}** musí obsahovat 1 až ${maximum} znaků.`);
  return value.trim();
}
function identifier(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) throw new AppError("Neplatný identifikátor záznamu.");
  return value;
}
function assertOwnedDiner(user: SessionUser, dinerId: number): void {
  if (!DATABASE.prepare("SELECT 1 FROM diner_links WHERE diner_id=? AND user_id=? AND canteen_id=?").get(dinerId,user.id,user.canteenId)) throw new AppError("Strávník nebyl nalezen.",404);
}
export function mutate(user: SessionUser, body: Record<string, unknown>) {
  const ACTION = String(body.action || "");
  const IS_STAFF = user.roles.includes("staff") || user.roles.includes("manager");
  const IS_MANAGER = user.roles.includes("manager");
  if (["edit","resolve","applyProposal"].includes(ACTION) && !IS_STAFF) throw new AppError("Tuto změnu může provést pouze jídelna.",403);
  if (ACTION === "applyProposal" && !IS_MANAGER) throw new AppError("Náměty může schvalovat pouze vedoucí jídelny.",403);
  if (["select","feedback","idea","preferences"].includes(ACTION) && !["parent","pupil","adult"].includes(user.role)) throw new AppError("Použijte účet žáka nebo rodiče.",403);
  if (ACTION === "applyProposal") {
    const SOURCE = DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.sourceId),user.canteenId) as Record<string,unknown>|undefined;
    const TARGET = DATABASE.prepare("SELECT id FROM meals WHERE id=? AND canteen_id=?").get(identifier(body.mealId),user.canteenId);
    const IDEA_ID = identifier(body.ideaId);
    const RESPONSE = requiredText(body.response,"Odpověď");
    if (!SOURCE || !TARGET || !DATABASE.prepare("SELECT id FROM ideas WHERE id=? AND canteen_id=?").get(IDEA_ID,user.canteenId)) throw new AppError("Návrh už není dostupný.",404);
    DATABASE.exec("BEGIN IMMEDIATE");
    try {
      DATABASE.prepare("UPDATE meals SET name=?,side=?,icon=?,category=?,allergens=?,ingredients=? WHERE id=? AND canteen_id=?").run(String(SOURCE.name),String(SOURCE.side),String(SOURCE.icon),String(SOURCE.category),String(SOURCE.allergens),String(SOURCE.ingredients),Number(TARGET.id),user.canteenId);
      DATABASE.prepare("DELETE FROM selections_v2 WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
      DATABASE.prepare("DELETE FROM feedback WHERE meal_id=? AND canteen_id=?").run(Number(TARGET.id),user.canteenId);
      DATABASE.prepare("UPDATE ideas SET status='Upraveno',response=? WHERE id=? AND canteen_id=?").run(RESPONSE,IDEA_ID,user.canteenId);
      DATABASE.exec("COMMIT");
    } catch (error) { DATABASE.exec("ROLLBACK"); throw error; }
    return;
  }
  if (["select","feedback","edit"].includes(ACTION)) {
    const MEAL_ID=identifier(body.mealId);
    const MEAL=DATABASE.prepare("SELECT * FROM meals WHERE id=? AND canteen_id=?").get(MEAL_ID,user.canteenId) as {date:string}|undefined;
    if (!MEAL) throw new AppError("Jídlo již není v jídelníčku.",404);
    if (ACTION === "select") {
      const DINER_ID=user.dinerId;
      if (!DINER_ID || !["parent","pupil","adult"].includes(user.role)) throw new AppError("Vyberte strávníka.",403);
      assertOwnedDiner(user,DINER_ID);
      DATABASE.prepare("INSERT INTO selections_v2(diner_id,canteen_id,date,meal_id) VALUES(?,?,?,?) ON CONFLICT(diner_id,date) DO UPDATE SET meal_id=excluded.meal_id").run(DINER_ID,user.canteenId,MEAL.date,MEAL_ID);
    } else if (ACTION === "feedback") {
      if (!user.roles.some((role)=>role === "pupil" || role === "parent" || role === "adult")) throw new AppError("Hodnocení není pro tuto roli dostupné.",403);
      const RATING=identifier(body.rating); if (RATING>5) throw new AppError("Hodnocení musí být od 1 do 5.");
      const COMMENT=typeof body.comment === "string" ? body.comment.trim() : ""; if (COMMENT.length>1000) throw new AppError("Komentář smí mít nejvýše 1000 znaků.");
      DATABASE.prepare("INSERT INTO feedback(user_id,meal_id,rating,comment,canteen_id) VALUES(?,?,?,?,?) ON CONFLICT(user_id,meal_id) DO UPDATE SET rating=excluded.rating,comment=excluded.comment").run(user.id,MEAL_ID,RATING,COMMENT,user.canteenId);
    } else {
      const CATEGORY=requiredText(body.category,"Kategorie"), ICON=requiredText(body.icon,"Ikona"), SOUP=requiredText(body.soup,"Polévka",120);
      if (!IS_STAFF) throw new AppError("Jídelníček může upravovat pouze personál jídelny.",403);
      if (!["Ryba","Drůbež","Maso","Bez masa","Sladké"].includes(CATEGORY) || !["fish","pasta","chicken","greens","meatballs","rice","mushroom","lentils","salad","sweet"].includes(ICON)) throw new AppError("Vyberte platnou kategorii a ikonu.");
      DATABASE.prepare("UPDATE meals SET name=?,side=?,ingredients=?,allergens=?,category=?,icon=? WHERE id=? AND canteen_id=?").run(requiredText(body.name,"Název",120),requiredText(body.side,"Příloha",120),requiredText(body.ingredients,"Suroviny"),requiredText(body.allergens,"Alergeny",100),CATEGORY,ICON,MEAL_ID,user.canteenId);
      DATABASE.prepare("UPDATE meals SET soup=? WHERE date=? AND canteen_id=?").run(SOUP,MEAL.date,user.canteenId);
    }
    return;
  }
  if (ACTION === "idea") {
    DATABASE.prepare("INSERT INTO ideas(user_id,text,canteen_id) VALUES(?,?,?)").run(user.id,requiredText(body.text,"Námět"),user.canteenId); return;
  }
  if (ACTION === "resolve") {
    const STATUS=requiredText(body.status,"Stav"), RESPONSE=requiredText(body.response,"Vysvětlení a případná alternativa");
    if (!IS_STAFF || !["Přijato","Upraveno","Nezařazeno"].includes(STATUS)) throw new AppError("Neplatný stav námětu nebo oprávnění.",403);
    const RESULT=DATABASE.prepare("UPDATE ideas SET status=?,response=? WHERE id=? AND canteen_id=?").run(STATUS,RESPONSE,identifier(body.ideaId),user.canteenId);
    if (!RESULT.changes) throw new AppError("Námět nebyl nalezen.",404); return;
  }
  if (ACTION === "preferences") {
    const DINER_ID=body.dinerId === undefined ? user.dinerId : identifier(body.dinerId);
    if (!DINER_ID) throw new AppError("Vyberte strávníka.",404);
    assertOwnedDiner(user,DINER_ID);
    if (user.role !== "parent") throw new AppError("Preference spravuje rodič.",403);
    const TEXT=typeof body.text === "string" ? body.text.trim() : ""; if (TEXT.length>1000) throw new AppError("Preference smí mít nejvýše 1000 znaků.");
    DATABASE.prepare("INSERT INTO preferences_v2(diner_id,canteen_id,text) VALUES(?,?,?) ON CONFLICT(diner_id) DO UPDATE SET text=excluded.text,canteen_id=excluded.canteen_id").run(DINER_ID,user.canteenId,TEXT); return;
  }
  throw new AppError("Neznámá akce.");
}
