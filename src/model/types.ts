/**
 * Calendar date in the `YYYY-MM-DD` format.
 */
export type IsoDate = string;

/**
 * Allergen code according to the EU list (1–14) used on Czech school menus.
 */
export type AllergenCode =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14;

/**
 * Food groups tracked by the consumption basket (spotřební koš) of the
 * regulation 107/2005 Sb., in force since 1. 9. 2025.
 */
export type FoodGroup =
  | "meat"
  | "fish"
  | "dairy"
  | "fats"
  | "sugars"
  | "vegetablesAndFruit"
  | "potatoes"
  | "wholegrains"
  | "legumes";

/**
 * Estimated grams of each food group in one portion (net weight).
 */
export type BasketContribution = Partial<Record<FoodGroup, number>>;

export type MealCourse = "soup" | "main" | "supplement";

export type MealDiet = "meat" | "fish" | "vegetarian" | "sweet";

export type MealId = string;

export interface Meal {
  readonly id: MealId;
  readonly course: MealCourse;
  readonly name: string;
  /** Emoji used as the icon of the meal */
  readonly icon: string;
  /** Ingredients or a short description shown to diners */
  readonly description: string;
  readonly allergens: readonly AllergenCode[];
  readonly diet: MealDiet;
  /** Estimated contribution to the consumption basket per portion */
  readonly basket: BasketContribution;
  /** Estimated cost of ingredients per portion in CZK */
  readonly estimatedCostCzk: number;
}

export interface DayMenu {
  readonly date: IsoDate;
  readonly soupId: MealId | null;
  readonly primaryMealId: MealId | null;
  readonly alternativeMealId: MealId | null;
  readonly supplementId: MealId | null;
  /** Reason why the day has no lunch, for example a public holiday */
  readonly note?: string;
}

export interface WeekPlan {
  /** Monday of the week */
  readonly weekStart: IsoDate;
  readonly isPublished: boolean;
  readonly days: readonly DayMenu[];
}

export type MealSlot = "primary" | "alternative";

export type MealRating = 1 | 2 | 3;

export type UserRole = "pupil" | "staff" | "parent";

export interface MealFeedback {
  readonly id: string;
  readonly mealId: MealId;
  readonly date: IsoDate;
  readonly authorId: string;
  readonly authorRole: UserRole;
  readonly rating: MealRating;
  readonly comment: string;
  readonly createdAt: string;
}

export type MealIdeaStatus = "new" | "planned" | "adjusted" | "declined";

export interface MealIdea {
  readonly id: string;
  readonly text: string;
  readonly authorId: string;
  readonly createdAt: string;
  readonly status: MealIdeaStatus;
  /** Explanation written by the staff for the parent */
  readonly response: string;
}

export interface PupilPreferences {
  readonly excludedAllergens: readonly AllergenCode[];
  readonly excludedDiets: readonly MealDiet[];
  readonly dislikedIngredients: readonly string[];
}
