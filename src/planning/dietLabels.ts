import type { MealDiet } from "@/model/types";

export const DIET_LABELS: Readonly<Record<MealDiet, string>> = {
  meat: "Masité",
  fish: "Rybí",
  vegetarian: "Bezmasé",
  sweet: "Sladké",
};
