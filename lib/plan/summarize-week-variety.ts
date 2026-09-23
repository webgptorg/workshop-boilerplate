import { findMealById, isMeatlessCategory, isRedMeatCategory, type Meal } from "../meals";
import type { LunchChoice, WeekPlan } from "./types";

export type WeekVarietySummary = {
  readonly cookingDayCount: number;
  /**
   * Days on which at least one of the two options is meatless.
   */
  readonly daysWithMeatlessOptionCount: number;
  readonly fishMealCount: number;
  readonly sweetMealCount: number;
  readonly redMeatCountByChoice: Readonly<Record<LunchChoice, number>>;
  /**
   * Days where a soup, primary or alternative meal is still missing.
   */
  readonly incompleteDayCount: number;
};

/**
 * Counts what the vyhláška 107/2005 Sb. (příloha 1) watches for menus with a choice.
 *
 * The counts are informative only: the two-week rules (fish, sweet main course) cannot be
 * judged from a single week and the consumption basket is evaluated as a monthly average.
 */
export function summarizeWeekVariety(weekPlan: WeekPlan, meals: readonly Meal[]): WeekVarietySummary {
  let cookingDayCount = 0;
  let daysWithMeatlessOptionCount = 0;
  let fishMealCount = 0;
  let sweetMealCount = 0;
  let incompleteDayCount = 0;
  const redMeatCountByChoice = { PRIMARY: 0, ALTERNATIVE: 0 };

  for (const dayPlan of weekPlan.days) {
    if (dayPlan.closedNote !== null) {
      continue;
    }

    cookingDayCount += 1;

    const soup = findMealById(meals, dayPlan.soupMealId);
    const primaryMeal = findMealById(meals, dayPlan.primaryMealId);
    const alternativeMeal = findMealById(meals, dayPlan.alternativeMealId);

    if (soup === null || primaryMeal === null || alternativeMeal === null) {
      incompleteDayCount += 1;
    }

    const mainMeals = [primaryMeal, alternativeMeal].filter((meal): meal is Meal => meal !== null);

    if (mainMeals.some((meal) => isMeatlessCategory(meal.category))) {
      daysWithMeatlessOptionCount += 1;
    }

    fishMealCount += mainMeals.filter((meal) => meal.category === "FISH").length;
    sweetMealCount += mainMeals.filter((meal) => meal.category === "SWEET").length;

    if (primaryMeal !== null && isRedMeatCategory(primaryMeal.category)) {
      redMeatCountByChoice.PRIMARY += 1;
    }

    if (alternativeMeal !== null && isRedMeatCategory(alternativeMeal.category)) {
      redMeatCountByChoice.ALTERNATIVE += 1;
    }
  }

  return {
    cookingDayCount,
    daysWithMeatlessOptionCount,
    fishMealCount,
    sweetMealCount,
    redMeatCountByChoice,
    incompleteDayCount,
  };
}
