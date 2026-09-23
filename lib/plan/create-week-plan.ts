import spaceTrim from "spacetrim";
import { getWeekdayIsoDates, type IsoDate } from "../dates";
import { UnexpectedError } from "../errors";
import type { DayPlan, WeekPlan } from "./types";

const DEFAULT_SUPPLEMENT = "Voda, mléko, ovocný čaj";

export function createEmptyDayPlan(date: IsoDate): DayPlan {
  return {
    date,
    closedNote: null,
    supplement: DEFAULT_SUPPLEMENT,
    soupMealId: null,
    primaryMealId: null,
    alternativeMealId: null,
  };
}

export function createEmptyWeekPlan(weekStartDate: IsoDate): WeekPlan {
  return {
    weekStartDate,
    days: getWeekdayIsoDates(weekStartDate).map(createEmptyDayPlan),
  };
}

export type DaySeed =
  | {
      readonly supplement: string;
      readonly soupMealId: string;
      readonly primaryMealId: string;
      readonly alternativeMealId: string;
    }
  | { readonly closedNote: string };

/**
 * Builds a full week from compact seed entries, one per weekday (Monday first).
 */
export function createSeededWeekPlan(weekStartDate: IsoDate, daySeeds: readonly DaySeed[]): WeekPlan {
  const dates = getWeekdayIsoDates(weekStartDate);

  if (daySeeds.length !== dates.length) {
    throw new UnexpectedError(
      spaceTrim(`
        Week starting \`${weekStartDate}\` must be seeded with exactly ${dates.length} days, got ${daySeeds.length}.
      `),
    );
  }

  return {
    weekStartDate,
    days: dates.map((date, index) => {
      const daySeed = daySeeds[index];

      if ("closedNote" in daySeed) {
        return { ...createEmptyDayPlan(date), closedNote: daySeed.closedNote };
      }

      return { ...createEmptyDayPlan(date), ...daySeed };
    }),
  };
}
