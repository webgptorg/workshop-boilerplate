import { findMealById, getAllergenName, getMealCategoryLabel, type Meal } from "../meals";
import type { DayPlan, LunchChoice } from "../plan";
import type { MealPreferences } from "./types";

export type MealSuitability = {
  readonly isSuitable: boolean;
  /**
   * Short reasons a parent understands, for example "obsahuje vepřové" or "alergen 7 (Mléko)".
   */
  readonly reasons: readonly string[];
};

const SUITABLE: MealSuitability = { isSuitable: true, reasons: [] };

export function evaluateMealSuitability(meal: Meal | null, preferences: MealPreferences): MealSuitability {
  if (meal === null) {
    return SUITABLE;
  }

  const reasons: string[] = [];

  if (preferences.excludedCategories.includes(meal.category)) {
    reasons.push(`${getMealCategoryLabel(meal.category).toLowerCase()} jídlo`);
  }

  for (const allergenCode of meal.allergenCodes) {
    if (preferences.excludedAllergenCodes.includes(allergenCode)) {
      reasons.push(`alergen ${allergenCode} (${getAllergenName(allergenCode)})`);
    }
  }

  return reasons.length === 0 ? SUITABLE : { isSuitable: false, reasons };
}

export type DayRecommendation = {
  readonly soup: MealSuitability;
  readonly primary: MealSuitability;
  readonly alternative: MealSuitability;
  /**
   * `null` when both options are fine (no recommendation needed) or when neither fits.
   */
  readonly recommendedChoice: LunchChoice | null;
  readonly isNoOptionSuitable: boolean;
};

export function recommendDayChoice(
  dayPlan: DayPlan,
  meals: readonly Meal[],
  preferences: MealPreferences,
): DayRecommendation {
  const soup = evaluateMealSuitability(findMealById(meals, dayPlan.soupMealId), preferences);
  const primary = evaluateMealSuitability(findMealById(meals, dayPlan.primaryMealId), preferences);
  const alternative = evaluateMealSuitability(findMealById(meals, dayPlan.alternativeMealId), preferences);

  let recommendedChoice: LunchChoice | null = null;

  if (!primary.isSuitable && alternative.isSuitable) {
    recommendedChoice = "ALTERNATIVE";
  } else if (primary.isSuitable && !alternative.isSuitable) {
    recommendedChoice = "PRIMARY";
  }

  return {
    soup,
    primary,
    alternative,
    recommendedChoice,
    isNoOptionSuitable: !primary.isSuitable && !alternative.isSuitable,
  };
}
