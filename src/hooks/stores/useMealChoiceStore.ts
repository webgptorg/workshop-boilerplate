"use client";

import { useCallback } from "react";
import type { IsoDate, MealSlot } from "@/model/types";
import { STORAGE_KEYS } from "@/storage/storageKeys";
import { useStoredValue } from "@/storage/useStoredValue";

/** Keyed by `${pupilId}:${date}` */
type MealChoiceMap = Readonly<Record<string, MealSlot>>;

export interface MealChoiceStore {
  readonly getChoice: (pupilId: string, date: IsoDate) => MealSlot | null;
  readonly setChoice: (pupilId: string, date: IsoDate, slot: MealSlot) => void;
  readonly isHydrated: boolean;
}

const EMPTY_CHOICES: MealChoiceMap = {};

function createChoiceKey(pupilId: string, date: IsoDate): string {
  return `${pupilId}:${date}`;
}

export function useMealChoiceStore(): MealChoiceStore {
  const { value: choices, setValue: setChoices, isHydrated } = useStoredValue<MealChoiceMap>(
    STORAGE_KEYS.mealChoices,
    EMPTY_CHOICES,
  );

  const getChoice = useCallback(
    (pupilId: string, date: IsoDate) => choices[createChoiceKey(pupilId, date)] ?? null,
    [choices],
  );

  const setChoice = useCallback(
    (pupilId: string, date: IsoDate, slot: MealSlot) => {
      setChoices((previousChoices) => ({ ...previousChoices, [createChoiceKey(pupilId, date)]: slot }));
    },
    [setChoices],
  );

  return { getChoice, setChoice, isHydrated };
}
