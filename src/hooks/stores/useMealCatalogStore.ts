"use client";

import { useCallback } from "react";
import { INITIAL_MEAL_CATALOG } from "@/data/mealCatalog";
import type { Meal, MealId } from "@/model/types";
import { STORAGE_KEYS } from "@/storage/storageKeys";
import { useStoredValue } from "@/storage/useStoredValue";

export interface MealCatalogStore {
  readonly meals: readonly Meal[];
  readonly findMeal: (mealId: MealId | null) => Meal | undefined;
  readonly updateMeal: (meal: Meal) => void;
  readonly isHydrated: boolean;
}

export function useMealCatalogStore(): MealCatalogStore {
  const { value: meals, setValue: setMeals, isHydrated } = useStoredValue<readonly Meal[]>(
    STORAGE_KEYS.meals,
    INITIAL_MEAL_CATALOG,
  );

  const findMeal = useCallback(
    (mealId: MealId | null) => (mealId === null ? undefined : meals.find((meal) => meal.id === mealId)),
    [meals],
  );

  const updateMeal = useCallback(
    (updatedMeal: Meal) => {
      setMeals((previousMeals) =>
        previousMeals.map((meal) => (meal.id === updatedMeal.id ? updatedMeal : meal)),
      );
    },
    [setMeals],
  );

  return { meals, findMeal, updateMeal, isHydrated };
}
