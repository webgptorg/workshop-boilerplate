import type { MealFeedback, MealRating } from "./types";

export type MealFeedbackSummary = {
  readonly mealId: string;
  readonly counts: Readonly<Record<MealRating, number>>;
  readonly total: number;
};

/**
 * Groups all feedback by meal, most rated meals first.
 */
export function summarizeFeedbackByMeal(feedbackList: readonly MealFeedback[]): MealFeedbackSummary[] {
  const summaries = new Map<string, { counts: Record<MealRating, number>; total: number }>();

  for (const feedback of feedbackList) {
    const summary = summaries.get(feedback.mealId) ?? {
      counts: { LIKED: 0, NEUTRAL: 0, DISLIKED: 0 },
      total: 0,
    };

    summary.counts[feedback.rating] += 1;
    summary.total += 1;
    summaries.set(feedback.mealId, summary);
  }

  return [...summaries.entries()]
    .map(([mealId, summary]) => ({ mealId, ...summary }))
    .sort((summaryA, summaryB) => summaryB.total - summaryA.total);
}
