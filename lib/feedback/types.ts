import type { IsoDate } from "../dates";

export type MealRating = "LIKED" | "NEUTRAL" | "DISLIKED";

export const MEAL_RATINGS = {
  LIKED: { label: "Chutnalo" },
  NEUTRAL: { label: "Šlo to" },
  DISLIKED: { label: "Nechutnalo" },
} as const;

export const MEAL_RATING_LIST = Object.keys(MEAL_RATINGS) as MealRating[];

export function getMealRatingLabel(rating: MealRating): string {
  return MEAL_RATINGS[rating].label;
}

export type MealFeedback = {
  readonly id: string;
  readonly authorUserId: string;
  readonly mealId: string;
  /**
   * The day the meal was served; one author can rate one meal once per day.
   */
  readonly date: IsoDate;
  readonly rating: MealRating;
  readonly comment: string;
  readonly createdAt: string;
};
