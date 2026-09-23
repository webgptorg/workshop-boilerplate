import type { AllergenCode } from "./allergens";
import type { MealCategory } from "./categories";
import type { MealIconName } from "./icons";

/**
 * Soups are served with both lunch options; main courses are the primary or alternative choice.
 */
export type MealCourse = "SOUP" | "MAIN";

export type Meal = {
  readonly id: string;
  readonly course: MealCourse;
  readonly name: string;
  /**
   * Side dish and the main ingredients, for example "vařené brambory · kuřecí maso, paprika".
   */
  readonly description: string;
  readonly category: MealCategory;
  readonly iconName: MealIconName;
  readonly allergenCodes: readonly AllergenCode[];
};
