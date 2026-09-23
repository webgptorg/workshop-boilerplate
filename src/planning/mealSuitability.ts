import { ALLERGEN_NAMES } from "@/data/allergens";
import type { Meal, PupilPreferences } from "@/model/types";
import { DIET_LABELS } from "./dietLabels";

export interface MealSuitability {
  readonly isSuitable: boolean;
  /** Human readable reasons why the meal does not match the preferences */
  readonly reasons: readonly string[];
}

function findAllergenReasons(meal: Meal, preferences: PupilPreferences): string[] {
  return meal.allergens
    .filter((allergen) => preferences.excludedAllergens.includes(allergen))
    .map((allergen) => `obsahuje ${ALLERGEN_NAMES[allergen].toLowerCase()}`);
}

function findDietReasons(meal: Meal, preferences: PupilPreferences): string[] {
  if (!preferences.excludedDiets.includes(meal.diet)) {
    return [];
  }

  return [`jídlo je ${DIET_LABELS[meal.diet].toLowerCase()}`];
}

function findIngredientReasons(meal: Meal, preferences: PupilPreferences): string[] {
  const searchedText = `${meal.name} ${meal.description}`.toLowerCase();

  return preferences.dislikedIngredients
    .map((ingredient) => ingredient.trim().toLowerCase())
    .filter((ingredient) => ingredient !== "" && searchedText.includes(ingredient))
    .map((ingredient) => `obsahuje ${ingredient}`);
}

export function evaluateMealSuitability(meal: Meal, preferences: PupilPreferences): MealSuitability {
  const reasons = [
    ...findAllergenReasons(meal, preferences),
    ...findDietReasons(meal, preferences),
    ...findIngredientReasons(meal, preferences),
  ];

  return { isSuitable: reasons.length === 0, reasons };
}
