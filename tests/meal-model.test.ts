import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  getWeekDays,
  INITIAL_DATA,
  isAppData,
  USERS,
  WEEK_STARTS,
  weekLabel,
} from "../lib/meal-model";

test("all six imported weeks have two distinct meals per school day", () => {
  assert.equal(INITIAL_DATA.days.length, 29);
  const identifiers = INITIAL_DATA.days.flatMap((day) =>
    day.meals.map((meal) => meal.id),
  );
  assert.equal(new Set(identifiers).size, 58);
  WEEK_STARTS.forEach((_, index) => {
    const days = getWeekDays(INITIAL_DATA.days, index);
    assert.equal(days.length, index === 3 ? 4 : 5);
    days.forEach((day) => {
      assert.equal(day.meals.length, 2);
      assert.ok(day.soup.trim());
      day.meals.forEach((meal) => {
        assert.ok(meal.name.trim());
        assert.ok(meal.icon);
        assert.ok(meal.source);
        assert.ok(!meal.name.includes("pečivo"));
      });
    });
  });
});
test("week navigation crosses the month boundary and excludes the holiday", () => {
  assert.deepEqual(
    getWeekDays(INITIAL_DATA.days, 3).map((day) => day.date),
    ["2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02"],
  );
  assert.match(weekLabel(3), /října 2026/);
});
test("local storage accepts complete data and rejects malformed nested records", () => {
  assert.equal(isAppData(JSON.parse(JSON.stringify(INITIAL_DATA))), true);
  for (const value of [
    null,
    {},
    { ...INITIAL_DATA, version: 2 },
    { ...INITIAL_DATA, choices: [] },
    { ...INITIAL_DATA, days: [{ date: "wrong" }] },
    { ...INITIAL_DATA, ideas: [null] },
    { ...INITIAL_DATA, preferences: [4] },
    { ...INITIAL_DATA, feedback: [{ rating: 99 }] },
  ])
    assert.equal(isAppData(value), false);
});
test("all three fake accounts have distinct credentials", () => {
  assert.equal(
    new Set(Object.values(USERS).map((user) => user.username)).size,
    3,
  );
  for (const user of Object.values(USERS)) assert.ok(user.password.length >= 8);
});

test("storage rejects invalid dates and cross-day meal choices", () => {
  const invalidDate = structuredClone(INITIAL_DATA);
  invalidDate.days[0].date = "not-a-date";
  assert.equal(isAppData(invalidDate), false);
  assert.equal(
    isAppData({ ...INITIAL_DATA, choices: { "2026-09-21": "2026-09-22-1" } }),
    false,
  );
  assert.equal(
    isAppData({ ...INITIAL_DATA, choices: { "2026-09-21": "2026-09-21-2" } }),
    true,
  );
});
