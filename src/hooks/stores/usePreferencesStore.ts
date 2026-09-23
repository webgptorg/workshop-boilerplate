"use client";

import { useCallback } from "react";
import type { PupilPreferences } from "@/model/types";
import { STORAGE_KEYS } from "@/storage/storageKeys";
import { useStoredValue } from "@/storage/useStoredValue";

type PreferencesMap = Readonly<Record<string, PupilPreferences>>;

const EMPTY_PREFERENCES_MAP: PreferencesMap = {};

export const EMPTY_PREFERENCES: PupilPreferences = {
  excludedAllergens: [],
  excludedDiets: [],
  dislikedIngredients: [],
};

export interface PreferencesStore {
  readonly getPreferences: (pupilId: string) => PupilPreferences;
  readonly savePreferences: (pupilId: string, preferences: PupilPreferences) => void;
  readonly isHydrated: boolean;
}

export function usePreferencesStore(): PreferencesStore {
  const { value: preferencesMap, setValue: setPreferencesMap, isHydrated } = useStoredValue<PreferencesMap>(
    STORAGE_KEYS.preferences,
    EMPTY_PREFERENCES_MAP,
  );

  const getPreferences = useCallback(
    (pupilId: string) => preferencesMap[pupilId] ?? EMPTY_PREFERENCES,
    [preferencesMap],
  );

  const savePreferences = useCallback(
    (pupilId: string, preferences: PupilPreferences) => {
      setPreferencesMap((previousMap) => ({ ...previousMap, [pupilId]: preferences }));
    },
    [setPreferencesMap],
  );

  return { getPreferences, savePreferences, isHydrated };
}
