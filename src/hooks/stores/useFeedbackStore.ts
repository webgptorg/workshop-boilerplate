"use client";

import { useCallback } from "react";
import { INITIAL_FEEDBACK } from "@/data/seedFeedback";
import type { MealFeedback } from "@/model/types";
import { STORAGE_KEYS } from "@/storage/storageKeys";
import { useStoredValue } from "@/storage/useStoredValue";
import { createId } from "./createId";

export type NewMealFeedback = Omit<MealFeedback, "id" | "createdAt">;

export interface FeedbackStore {
  readonly feedback: readonly MealFeedback[];
  readonly addFeedback: (newFeedback: NewMealFeedback) => void;
  readonly isHydrated: boolean;
}

export function useFeedbackStore(): FeedbackStore {
  const { value: feedback, setValue: setFeedback, isHydrated } = useStoredValue<readonly MealFeedback[]>(
    STORAGE_KEYS.feedback,
    INITIAL_FEEDBACK,
  );

  const addFeedback = useCallback(
    (newFeedback: NewMealFeedback) => {
      const createdFeedback: MealFeedback = {
        ...newFeedback,
        id: createId("feedback"),
        createdAt: new Date().toISOString(),
      };
      setFeedback((previousFeedback) => [...previousFeedback, createdFeedback]);
    },
    [setFeedback],
  );

  return { feedback, addFeedback, isHydrated };
}
