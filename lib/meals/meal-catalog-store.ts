import spaceTrim from "spacetrim";
import { NotFoundError } from "../errors";
import { generateId } from "../generate-id";
import { createLocalStorageStore } from "../storage";
import { SEED_MEALS } from "./seed-meals";
import type { Meal, MealCourse } from "./types";

export const mealCatalogStore = createLocalStorageStore<readonly Meal[]>({
  name: "meals",
  version: 1,
  defaultValue: SEED_MEALS,
});

export function findMealById(meals: readonly Meal[], mealId: string | null): Meal | null {
  if (mealId === null) {
    return null;
  }

  return meals.find((meal) => meal.id === mealId) ?? null;
}

export function getMealById(meals: readonly Meal[], mealId: string): Meal {
  const meal = findMealById(meals, mealId);

  if (meal === null) {
    throw new NotFoundError(
      spaceTrim(`
        Meal with id \`${mealId}\` is not in the catalog.

        The catalog has ${meals.length} meals.
      `),
    );
  }

  return meal;
}

export function listMealsByCourse(meals: readonly Meal[], course: MealCourse): Meal[] {
  return meals
    .filter((meal) => meal.course === course)
    .sort((mealA, mealB) => mealA.name.localeCompare(mealB.name, "cs"));
}

export function saveMeal(meal: Meal): void {
  mealCatalogStore.update((meals) => {
    const isExisting = meals.some((existingMeal) => existingMeal.id === meal.id);

    return isExisting
      ? meals.map((existingMeal) => (existingMeal.id === meal.id ? meal : existingMeal))
      : [...meals, meal];
  });
}

export function createMealDraft(course: MealCourse): Meal {
  return {
    id: `${course.toLowerCase()}-${generateId()}`,
    course,
    name: "",
    description: "",
    category: "VEGETARIAN",
    iconName: course === "SOUP" ? "SOUP" : "LEAF",
    allergenCodes: [],
  };
}
