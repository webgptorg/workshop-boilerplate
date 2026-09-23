import { LUNCH_BASKET_NORMS_7_10, LUNCH_COST_LIMIT_CZK_7_10, type FoodGroupNorm } from "@/data/basketNorms";
import type { DayMenu, FoodGroup, Meal, WeekPlan } from "@/model/types";

export type BasketStatus = "ok" | "low" | "high" | "unknown";

export interface FoodGroupResult {
  readonly norm: FoodGroupNorm;
  /** Estimated average grams per diner and day */
  readonly averageGrams: number;
  /** Ratio of the average to the norm, 1 = exactly the norm */
  readonly ratio: number;
  readonly status: BasketStatus;
}

export interface CostResult {
  readonly averageCostCzk: number;
  readonly status: BasketStatus;
}

export interface WeekBasketCheck {
  readonly cookedDaysCount: number;
  readonly groups: readonly FoodGroupResult[];
  readonly cost: CostResult;
}

type MealLookup = (mealId: string | null) => Meal | undefined;

function getMealsOfDay(day: DayMenu, findMeal: MealLookup): Meal[] {
  // Only the primary meal is counted: the alternative is chosen by a minority of diners.
  return [day.soupId, day.primaryMealId, day.supplementId]
    .map((mealId) => findMeal(mealId))
    .filter((meal): meal is Meal => meal !== undefined);
}

function sumGroup(meals: readonly Meal[], group: FoodGroup): number {
  return meals.reduce((total, meal) => total + (meal.basket[group] ?? 0), 0);
}

function evaluateRatio(ratio: number, norm: FoodGroupNorm): BasketStatus {
  if (ratio < norm.minimumRatio) {
    return "low";
  }

  if (norm.maximumRatio !== null && ratio > norm.maximumRatio) {
    return "high";
  }

  return "ok";
}

function evaluateCost(averageCostCzk: number): BasketStatus {
  if (averageCostCzk < LUNCH_COST_LIMIT_CZK_7_10.minimum) {
    return "low";
  }

  if (averageCostCzk > LUNCH_COST_LIMIT_CZK_7_10.maximum) {
    return "high";
  }

  return "ok";
}

/**
 * Compares the estimated consumption of the week with the norms for lunch.
 * All numbers are estimates, the meals do not carry weighed recipes yet.
 */
export function checkWeekBasket(weekPlan: WeekPlan, findMeal: MealLookup): WeekBasketCheck {
  const cookedDays = weekPlan.days.filter((day) => day.primaryMealId !== null);
  const cookedDaysCount = cookedDays.length;
  const mealsOfWeek = cookedDays.flatMap((day) => getMealsOfDay(day, findMeal));

  const groups = LUNCH_BASKET_NORMS_7_10.map((norm): FoodGroupResult => {
    if (cookedDaysCount === 0) {
      return { norm, averageGrams: 0, ratio: 0, status: "unknown" };
    }

    const averageGrams = sumGroup(mealsOfWeek, norm.group) / cookedDaysCount;
    const ratio = averageGrams / norm.gramsPerDay;
    return { norm, averageGrams, ratio, status: evaluateRatio(ratio, norm) };
  });

  const totalCost = mealsOfWeek.reduce((total, meal) => total + meal.estimatedCostCzk, 0);
  const averageCostCzk = cookedDaysCount === 0 ? 0 : totalCost / cookedDaysCount;

  return {
    cookedDaysCount,
    groups,
    cost: { averageCostCzk, status: cookedDaysCount === 0 ? "unknown" : evaluateCost(averageCostCzk) },
  };
}
