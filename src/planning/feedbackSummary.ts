import type { Meal, MealFeedback } from "@/model/types";

export interface MealFeedbackSummary {
  readonly meal: Meal;
  readonly items: readonly MealFeedback[];
  /** Average rating 1–3 */
  readonly averageRating: number;
}

/**
 * Groups feedback by meal, meals with the worst rating first.
 */
export function summarizeFeedbackByMeal(
  feedback: readonly MealFeedback[],
  findMeal: (mealId: string) => Meal | undefined,
): MealFeedbackSummary[] {
  const itemsByMeal = new Map<string, MealFeedback[]>();

  for (const item of feedback) {
    itemsByMeal.set(item.mealId, [...(itemsByMeal.get(item.mealId) ?? []), item]);
  }

  const summaries: MealFeedbackSummary[] = [];

  for (const [mealId, items] of itemsByMeal) {
    const meal = findMeal(mealId);

    if (!meal) {
      continue;
    }

    const averageRating = items.reduce((total, item) => total + item.rating, 0) / items.length;
    summaries.push({ meal, items, averageRating });
  }

  return summaries.sort((a, b) => a.averageRating - b.averageRating);
}
