import type { Meal } from "@/model/types";
import { MAIN_MEALS } from "./mainMeals";
import { SOUPS } from "./soups";
import { SUPPLEMENTS } from "./supplements";

export const INITIAL_MEAL_CATALOG: readonly Meal[] = [
  ...SOUPS,
  ...MAIN_MEALS,
  ...SUPPLEMENTS,
];
