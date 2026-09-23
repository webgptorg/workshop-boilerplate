import { createLocalStorageStore } from "../storage";
import { EMPTY_MEAL_PREFERENCES, type MealPreferences } from "./types";

/**
 * Preferences keyed by the pupil's user id.
 */
export type MealPreferencesCollection = Readonly<Record<string, MealPreferences>>;

export const preferencesStore = createLocalStorageStore<MealPreferencesCollection>({
  name: "meal-preferences",
  version: 1,
  defaultValue: {},
});

export function getPreferencesForPupil(
  preferencesCollection: MealPreferencesCollection,
  pupilUserId: string,
): MealPreferences {
  return preferencesCollection[pupilUserId] ?? EMPTY_MEAL_PREFERENCES;
}

export function savePreferencesForPupil(pupilUserId: string, preferences: MealPreferences): void {
  preferencesStore.update((preferencesCollection) => ({
    ...preferencesCollection,
    [pupilUserId]: { ...preferences, note: preferences.note.trim() },
  }));
}
