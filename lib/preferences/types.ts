import type { AllergenCode, MealCategory } from "../meals";

/**
 * What a parent set for their child. The canteen does not see this; it only drives
 * the recommendation between the primary and the alternative option.
 */
export type MealPreferences = {
  readonly excludedCategories: readonly MealCategory[];
  readonly excludedAllergenCodes: readonly AllergenCode[];
  readonly note: string;
};

export const EMPTY_MEAL_PREFERENCES: MealPreferences = {
  excludedCategories: [],
  excludedAllergenCodes: [],
  note: "",
};
