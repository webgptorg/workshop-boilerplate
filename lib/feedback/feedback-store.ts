import type { IsoDate } from "../dates";
import { generateId } from "../generate-id";
import { createLocalStorageStore } from "../storage";
import type { MealFeedback, MealRating } from "./types";

export const feedbackStore = createLocalStorageStore<readonly MealFeedback[]>({
  name: "meal-feedback",
  version: 1,
  defaultValue: [],
});

export function findFeedback(
  feedbackList: readonly MealFeedback[],
  authorUserId: string,
  mealId: string,
  date: IsoDate,
): MealFeedback | null {
  return (
    feedbackList.find(
      (feedback) =>
        feedback.authorUserId === authorUserId && feedback.mealId === mealId && feedback.date === date,
    ) ?? null
  );
}

export type FeedbackInput = {
  readonly authorUserId: string;
  readonly mealId: string;
  readonly date: IsoDate;
  readonly rating: MealRating;
  readonly comment: string;
};

/**
 * Creates the feedback or replaces the author's earlier feedback on the same meal and day.
 */
export function saveFeedback(input: FeedbackInput): void {
  feedbackStore.update((feedbackList) => {
    const existingFeedback = findFeedback(feedbackList, input.authorUserId, input.mealId, input.date);
    const feedback: MealFeedback = {
      id: existingFeedback?.id ?? generateId(),
      ...input,
      comment: input.comment.trim(),
      createdAt: new Date().toISOString(),
    };

    if (existingFeedback === null) {
      return [...feedbackList, feedback];
    }

    return feedbackList.map((candidate) => (candidate.id === feedback.id ? feedback : candidate));
  });
}

export function listFeedbackNewestFirst(feedbackList: readonly MealFeedback[]): MealFeedback[] {
  return [...feedbackList].sort((feedbackA, feedbackB) => feedbackB.createdAt.localeCompare(feedbackA.createdAt));
}
