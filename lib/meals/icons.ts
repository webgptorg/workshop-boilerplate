/**
 * Names of the icons a meal can have. The mapping to actual SVG icons lives in
 * `components/meals/meal-icon.tsx`, so this module stays free of React.
 */
export const MEAL_ICONS = {
  SOUP: { label: "Polévka" },
  FISH: { label: "Ryba" },
  CHICKEN: { label: "Drůbež" },
  PORK: { label: "Vepřové" },
  BEEF: { label: "Hovězí" },
  EGG: { label: "Vejce" },
  PASTA: { label: "Těstoviny" },
  GRAIN: { label: "Obiloviny a rýže" },
  LEGUMES: { label: "Luštěniny" },
  VEGETABLE: { label: "Zelenina" },
  SALAD: { label: "Salát" },
  SWEET: { label: "Sladké jídlo" },
  CHEESE: { label: "Sýr" },
  FRIED: { label: "Smažené" },
  STEW: { label: "Guláš a omáčky" },
  LEAF: { label: "Lehké bezmasé" },
} as const;

export type MealIconName = keyof typeof MEAL_ICONS;

export const MEAL_ICON_NAME_LIST = Object.keys(MEAL_ICONS) as MealIconName[];

export function getMealIconLabel(iconName: MealIconName): string {
  return MEAL_ICONS[iconName].label;
}
