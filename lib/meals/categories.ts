/**
 * Coarse category of a meal used for dietary preferences and for the weekly variety overview.
 *
 * The categories follow the rules of the vyhláška 107/2005 Sb. (příloha 1) for menus with a choice:
 * a meatless option every day, fish regularly, red meat at most once a week per line,
 * a sweet main course at most once per two weeks.
 */
export const MEAL_CATEGORIES = {
  PORK: { label: "Vepřové", isRedMeat: true },
  BEEF: { label: "Hovězí", isRedMeat: true },
  POULTRY: { label: "Drůbeží", isRedMeat: false },
  FISH: { label: "Ryby", isRedMeat: false },
  VEGETARIAN: { label: "Bezmasé", isRedMeat: false },
  SWEET: { label: "Sladké", isRedMeat: false },
} as const;

export type MealCategory = keyof typeof MEAL_CATEGORIES;

export const MEAL_CATEGORY_LIST = Object.keys(MEAL_CATEGORIES) as MealCategory[];

export function getMealCategoryLabel(category: MealCategory): string {
  return MEAL_CATEGORIES[category].label;
}

export function isRedMeatCategory(category: MealCategory): boolean {
  return MEAL_CATEGORIES[category].isRedMeat;
}

export function isMeatlessCategory(category: MealCategory): boolean {
  return category === "VEGETARIAN" || category === "SWEET";
}
