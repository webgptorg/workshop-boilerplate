import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const DIRECTORY = mkdtempSync(join(tmpdir(), "stul-test-"));
process.env.DATABASE_DIRECTORY = DIRECTORY;
process.env.IS_DEMO_MODE = "true";
const { DATABASE, getData } = await import("../lib/database");
const { mutate } = await import("../lib/mutations");
const { proposeMeal } = await import("../lib/planner");
const { verifyPassword } = await import("../lib/security");
const PUPIL = { id: 1, role: "pupil" as const, name: "Adam", username: "adam", canteenId: 1, dinerId: 1, roles: ["pupil"] as ("pupil"|"adult"|"parent"|"staff"|"manager")[] };
const STAFF = {
  id: 2,
  role: "staff" as const,
  name: "Jana",
  username: "jidelna",
  canteenId: 1, dinerId: null, roles: ["manager", "staff"] as ("pupil"|"adult"|"parent"|"staff"|"manager")[],
};
const PARENT = {
  id: 3,
  role: "parent" as const,
  name: "Petra",
  username: "petra",
  canteenId: 1, dinerId: 1, roles: ["parent"] as ("pupil"|"adult"|"parent"|"staff"|"manager")[],
};
after(() => {
  DATABASE.close();
  rmSync(DIRECTORY, { recursive: true, force: true });
});
test("Demo manager exists only in demo mode and has a scrypt password hash", async () => {
  const ADMIN = DATABASE.prepare("SELECT id,password_hash FROM users WHERE username='admin'").get() as { id: number; password_hash: string } | undefined;
  assert.ok(ADMIN);
  assert.match(ADMIN.password_hash, /^scrypt\$/);
  assert.equal(await verifyPassword("admin", ADMIN.password_hash), true);
  assert.ok(DATABASE.prepare("SELECT 1 FROM user_roles WHERE user_id=? AND role='manager'").get(ADMIN.id));
});
test("Each operating day has exactly two meals; the holiday has none", () => {
  const DATA = getData(null);
  for (const DATE of new Set(DATA.meals.map((meal) => meal.date)))
    assert.deepEqual(
      DATA.meals.filter((meal) => meal.date === DATE).map((meal) => meal.slot),
      [1, 2],
    );
  assert.equal(
    DATA.meals.filter((meal) => meal.date === "2026-09-28").length,
    0,
  );
});
test("Pupil selection is shared with parent and replaced atomically", () => {
  getData(STAFF);
  assert.equal(getData(null).meals.length, 0, "anonymous visitors cannot read a draft");
  mutate(STAFF, { action: "submitWeek", weekStart: "2026-09-21" });
  mutate(STAFF, { action: "approveWeek", weekStart: "2026-09-21" });
  mutate(STAFF, { action: "publishWeek", weekStart: "2026-09-21" });
  const PUBLISHED_DATA = getData(null);
  const PUBLISHED_WEEK = PUBLISHED_DATA.menuWeeks.find((week) => week.weekStart === "2026-09-21");
  assert.equal(PUBLISHED_DATA.meals.length, 10);
  assert.equal(JSON.parse(PUBLISHED_WEEK?.revisions[0].snapshot || "{}").basketResults.status, "missingData");
  mutate(PUPIL, { action: "select", mealId: 1 });
  assert.equal(getData(PARENT).selections["2026-09-21"], 1);
  mutate(PARENT, { action: "select", mealId: 2 });
  assert.equal(getData(PUPIL).selections["2026-09-21"], 2);
});
test("Roles cannot change meals or preferences without permission", () => {
  assert.throws(() => mutate(PUPIL, { action: "edit", mealId: 1 }), /jídelna/);
  assert.throws(
    () => mutate(PUPIL, { action: "preferences", text: "x" }),
    /rodič/,
  );
  assert.throws(() => mutate(STAFF, { action: "select", mealId: 1 }), /žáka/);
  assert.throws(() => mutate(PARENT, { action: "applyProposal" }), /jídelna/);
});
test("Ratings are bounded, editable, and visible to staff", () => {
  assert.throws(() =>
    mutate(PUPIL, { action: "feedback", mealId: 1, rating: 6 }),
  );
  mutate(PUPIL, {
    action: "feedback",
    mealId: 1,
    rating: 5,
    comment: "Chutnalo.",
  });
  assert.equal(
    getData(STAFF).feedback.filter((item) => item.comment === "Chutnalo.")
      .length,
    1,
  );
  mutate(PUPIL, {
    action: "feedback",
    mealId: 1,
    rating: 3,
    comment: "Změna.",
  });
  assert.equal(getData(PUPIL).feedback.length, 1);
});
test("An idea gets a preview and is applied only by staff, with a response", () => {
  mutate(PARENT, { action: "idea", text: "Špagety carbonara" });
  const DATA = getData(STAFF);
  const IDEA = DATA.ideas[0];
  const PROPOSAL = proposeMeal(IDEA.text, DATA.meals);
  assert.equal(PROPOSAL.meal.icon, "pasta");
  assert.throws(() =>
    mutate(STAFF, {
      action: "resolve",
      ideaId: IDEA.id,
      status: "Nezařazeno",
      response: "",
    }),
  );
  mutate(STAFF, {
    action: "applyProposal",
    ideaId: IDEA.id,
    sourceId: PROPOSAL.meal.id,
    mealId: 3,
    response: "Místo slaniny nabízíme rajčatovou omáčku.",
    reason: "Návrh rodičů nahradil původní recepturu.",
  });
  assert.equal(
    getData(PARENT).ideas[0].response,
    "Místo slaniny nabízíme rajčatovou omáčku.",
  );
  assert.equal(
    getData(PUPIL).meals.find((meal) => meal.id === 3)?.name,
    PROPOSAL.meal.name,
  );
  assert.equal(proposeMeal("Neznámá receptura", DATA.meals).isMatch, false);
});
test("Invalid IDs and oversized input do not write changes", () => {
  assert.throws(() => mutate(PUPIL, { action: "select", mealId: 99999 }));
  assert.throws(() =>
    mutate(PARENT, { action: "idea", text: "x".repeat(1001) }),
  );
  assert.throws(() =>
    mutate(STAFF, {
      action: "resolve",
      ideaId: 9999,
      status: "Přijato",
      response: "Ano",
    }),
  );
});
