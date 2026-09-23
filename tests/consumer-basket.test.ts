import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateConsumerBasket, getChoiceMenuItems } from "../lib/consumer-basket";
import { BASKET_RULE_SETS } from "../lib/basket-rules";
import type { BasketMenuItem, Meal, RecipeVersion } from "../lib/types";

const CHOICE_FIXTURE = [
  { day: "2026-09-21", slot: 1, name: "Bulgurové rizoto s červenou čočkou", ingredients: [{ ingredientId: "whole-grain", amountGrams: 30 }, { ingredientId: "legumes", amountGrams: 20 }, { ingredientId: "vegetables", amountGrams: 60 }] },
  { day: "2026-09-21", slot: 2, name: "Kuřecí stehno s bramborami", ingredients: [{ ingredientId: "meat", amountGrams: 55 }, { ingredientId: "potatoes", amountGrams: 100 }, { ingredientId: "vegetables", amountGrams: 30 }] },
  { day: "2026-09-22", slot: 1, name: "Zapečené těstoviny se špenátem", ingredients: [{ ingredientId: "dairy", amountGrams: 20 }, { ingredientId: "vegetables", amountGrams: 70 }] },
  { day: "2026-09-22", slot: 2, name: "Rybí filé s čočkou", ingredients: [{ ingredientId: "fish", amountGrams: 40 }, { ingredientId: "legumes", amountGrams: 30 }, { ingredientId: "potatoes", amountGrams: 50 }] },
].map((fixture, index): BasketMenuItem => {
  const meal = { id: index + 1, date: fixture.day, slot: fixture.slot, name: fixture.name, side: "", soup: "", icon: "", category: "", allergens: "", ingredients: "" } satisfies Meal;
  const recipeVersion: RecipeVersion = {
    id: `methodology-example-${index + 1}`, mealId: meal.id, validFrom: "2026-09-01",
    ingredients: fixture.ingredients.map((ingredient) => ({ ...ingredient, isEstimate: false })),
  };
  return { meal, recipeVersion, servings: 1, isOperatingDay: true };
});

test("methodology example choice menus expose both whole-offer and selected-meal readings", () => {
  const allOffered = getChoiceMenuItems(CHOICE_FIXTURE, "all-offered");
  const selectedMeals = getChoiceMenuItems(CHOICE_FIXTURE, "selected-meals");
  assert.equal(allOffered.length, 4);
  assert.equal(selectedMeals.length, 2);
  assert.equal(selectedMeals[0].meal.slot, 1);
  assert.equal(selectedMeals[1].meal.slot, 1);
});

test("2021 and 2025 rule sets use different, sourced targets", () => {
  const legacy = BASKET_RULE_SETS.find((ruleSet) => ruleSet.id === "decree-2021");
  const current = BASKET_RULE_SETS.find((ruleSet) => ruleSet.id === "decree-2025-regular");
  assert.ok(legacy && current);
  const legacyTarget = legacy.ageCategoryTargets["7-10"]?.meat?.amountGramsPerDinerDay;
  const currentTarget = current.ageCategoryTargets["7-10-lunch"]?.meat?.amountGramsPerDinerDay;
  assert.equal(legacyTarget, 64);
  assert.equal(currentTarget, 46);
  assert.equal(legacy.measureBasis, "purchased");
  assert.equal(current.measureBasis, "clean");
});

test("missing recipe groups or absent targets never report ok", () => {
  const current = BASKET_RULE_SETS.find((ruleSet) => ruleSet.id === "decree-2025-regular");
  assert.ok(current);
  const emptyResult = calculateConsumerBasket({ items: [], ageCategory: "7-10-lunch", ruleSet: current, period: "month", operatingDayCount: 20 });
  assert.equal(emptyResult.groups.find((group) => group.groupId === "meat")?.status, "under");
  const unsupportedAge = calculateConsumerBasket({ items: [], ageCategory: "not-in-decree", ruleSet: current, period: "month", operatingDayCount: 20 });
  assert.equal(unsupportedAge.groups.find((group) => group.groupId === "meat")?.status, "missingData");
});

test("free fat and free sugar have explicit, distinct lower bounds", () => {
  const legacy = BASKET_RULE_SETS.find((ruleSet) => ruleSet.id === "decree-2021");
  const current = BASKET_RULE_SETS.find((ruleSet) => ruleSet.id === "decree-2025-regular");
  assert.ok(legacy && current);
  assert.equal(legacy.ageCategoryTargets["7-10"]?.freeFat?.minimumPercent, 75);
  assert.equal(legacy.ageCategoryTargets["7-10"]?.freeSugar?.minimumPercent, 0);
  assert.equal(current.ageCategoryTargets["7-10-lunch"]?.freeFat?.minimumPercent, 75);
  assert.equal(current.ageCategoryTargets["7-10-lunch"]?.freeSugar?.minimumPercent, 0);
});
