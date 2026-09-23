import type { IsoDate, WeekPlan } from "@/model/types";
import { getWorkdaysOfWeek } from "./calendar";

export function createEmptyWeekPlan(weekStart: IsoDate): WeekPlan {
  return {
    weekStart,
    isPublished: false,
    days: getWorkdaysOfWeek(weekStart).map((date) => ({
      date,
      soupId: null,
      primaryMealId: null,
      alternativeMealId: null,
      supplementId: null,
    })),
  };
}
