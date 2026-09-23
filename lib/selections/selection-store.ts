import type { IsoDate } from "../dates";
import type { LunchChoice } from "../plan";
import { createLocalStorageStore } from "../storage";

export type LunchSelection = {
  readonly pupilUserId: string;
  readonly date: IsoDate;
  readonly choice: LunchChoice;
};

/**
 * Selections keyed by `getSelectionKey(pupilUserId, date)`.
 */
export type LunchSelectionCollection = Readonly<Record<string, LunchSelection>>;

/**
 * A diner who has not chosen otherwise gets the primary option, like in the real canteen.
 */
export const DEFAULT_LUNCH_CHOICE: LunchChoice = "PRIMARY";

export const selectionStore = createLocalStorageStore<LunchSelectionCollection>({
  name: "lunch-selections",
  version: 1,
  defaultValue: {},
});

export function getSelectionKey(pupilUserId: string, date: IsoDate): string {
  return `${pupilUserId}|${date}`;
}

export function findSelection(
  selections: LunchSelectionCollection,
  pupilUserId: string,
  date: IsoDate,
): LunchSelection | null {
  return selections[getSelectionKey(pupilUserId, date)] ?? null;
}

export function getEffectiveChoice(
  selections: LunchSelectionCollection,
  pupilUserId: string,
  date: IsoDate,
): LunchChoice {
  return findSelection(selections, pupilUserId, date)?.choice ?? DEFAULT_LUNCH_CHOICE;
}

export function saveSelection(pupilUserId: string, date: IsoDate, choice: LunchChoice): void {
  selectionStore.update((selections) => ({
    ...selections,
    [getSelectionKey(pupilUserId, date)]: { pupilUserId, date, choice },
  }));
}

/**
 * Counts how many of the given pupils take each option on the given day.
 */
export function countChoicesForDate(
  selections: LunchSelectionCollection,
  pupilUserIds: readonly string[],
  date: IsoDate,
): Readonly<Record<LunchChoice, number>> {
  const counts = { PRIMARY: 0, ALTERNATIVE: 0 };

  for (const pupilUserId of pupilUserIds) {
    counts[getEffectiveChoice(selections, pupilUserId, date)] += 1;
  }

  return counts;
}
