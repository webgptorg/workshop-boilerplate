import spaceTrim from "spacetrim";
import type { IsoDate } from "../dates";
import { NotFoundError } from "../errors";
import { createLocalStorageStore } from "../storage";
import { createEmptyWeekPlan } from "./create-week-plan";
import { SEED_WEEK_PLANS } from "./seed-week-plans";
import type { DayPlan, WeekPlan, WeekPlanCollection } from "./types";

export const weekPlanStore = createLocalStorageStore<WeekPlanCollection>({
  name: "week-plans",
  version: 1,
  defaultValue: SEED_WEEK_PLANS,
});

export function findWeekPlan(weekPlans: WeekPlanCollection, weekStartDate: IsoDate): WeekPlan | null {
  return weekPlans[weekStartDate] ?? null;
}

export function findDayPlan(weekPlans: WeekPlanCollection, weekStartDate: IsoDate, date: IsoDate): DayPlan | null {
  return findWeekPlan(weekPlans, weekStartDate)?.days.find((dayPlan) => dayPlan.date === date) ?? null;
}

export function listPlannedWeekStartDates(weekPlans: WeekPlanCollection): IsoDate[] {
  return Object.keys(weekPlans).sort();
}

export function createWeekPlanIfMissing(weekStartDate: IsoDate): void {
  weekPlanStore.update((weekPlans) => {
    if (findWeekPlan(weekPlans, weekStartDate) !== null) {
      return weekPlans;
    }

    return { ...weekPlans, [weekStartDate]: createEmptyWeekPlan(weekStartDate) };
  });
}

export type DayPlanPatch = Partial<Omit<DayPlan, "date">>;

/**
 * @throws {NotFoundError} when the week or the day is not planned yet
 */
export function updateDayPlan(weekStartDate: IsoDate, date: IsoDate, patch: DayPlanPatch): void {
  weekPlanStore.update((weekPlans) => {
    const weekPlan = findWeekPlan(weekPlans, weekStartDate);

    if (weekPlan === null || !weekPlan.days.some((dayPlan) => dayPlan.date === date)) {
      throw new NotFoundError(
        spaceTrim(`
          Cannot update day \`${date}\`: week starting \`${weekStartDate}\` is not planned or does not contain that day.

          Planned weeks: ${listPlannedWeekStartDates(weekPlans).map((plannedWeek) => `\`${plannedWeek}\``).join(", ")}
        `),
      );
    }

    return {
      ...weekPlans,
      [weekStartDate]: {
        ...weekPlan,
        days: weekPlan.days.map((dayPlan) => (dayPlan.date === date ? { ...dayPlan, ...patch } : dayPlan)),
      },
    };
  });
}

export function swapDayOptions(weekStartDate: IsoDate, dayPlan: DayPlan): void {
  updateDayPlan(weekStartDate, dayPlan.date, {
    primaryMealId: dayPlan.alternativeMealId,
    alternativeMealId: dayPlan.primaryMealId,
  });
}
