import type { IsoDate } from "../dates";

/**
 * Which of the two lunch options a diner takes.
 */
export type LunchChoice = "PRIMARY" | "ALTERNATIVE";

export type DayPlan = {
  readonly date: IsoDate;
  /**
   * When set, the canteen does not cook that day (for example a public holiday) and the reason is shown.
   */
  readonly closedNote: string | null;
  /**
   * Drink and side supplement served with both options, for example "Ovocný kompot".
   */
  readonly supplement: string;
  readonly soupMealId: string | null;
  readonly primaryMealId: string | null;
  readonly alternativeMealId: string | null;
};

export type WeekPlan = {
  /**
   * Monday of the week.
   */
  readonly weekStartDate: IsoDate;
  /**
   * Monday to Friday, always five entries.
   */
  readonly days: readonly DayPlan[];
};

/**
 * All week plans keyed by their `weekStartDate`.
 */
export type WeekPlanCollection = Readonly<Record<IsoDate, WeekPlan>>;
