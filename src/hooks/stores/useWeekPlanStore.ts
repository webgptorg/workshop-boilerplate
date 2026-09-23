"use client";

import { useCallback } from "react";
import { INITIAL_WEEK_PLANS } from "@/data/weekPlans";
import type { IsoDate, WeekPlan } from "@/model/types";
import { STORAGE_KEYS } from "@/storage/storageKeys";
import { useStoredValue } from "@/storage/useStoredValue";

export interface WeekPlanStore {
  readonly weekPlans: readonly WeekPlan[];
  readonly findWeekPlan: (weekStart: IsoDate) => WeekPlan | undefined;
  readonly saveWeekPlan: (weekPlan: WeekPlan) => void;
  readonly isHydrated: boolean;
}

export function useWeekPlanStore(): WeekPlanStore {
  const { value: weekPlans, setValue: setWeekPlans, isHydrated } = useStoredValue<readonly WeekPlan[]>(
    STORAGE_KEYS.weekPlans,
    INITIAL_WEEK_PLANS,
  );

  const findWeekPlan = useCallback(
    (weekStart: IsoDate) => weekPlans.find((weekPlan) => weekPlan.weekStart === weekStart),
    [weekPlans],
  );

  const saveWeekPlan = useCallback(
    (savedWeekPlan: WeekPlan) => {
      setWeekPlans((previousWeekPlans) => {
        const otherWeekPlans = previousWeekPlans.filter(
          (weekPlan) => weekPlan.weekStart !== savedWeekPlan.weekStart,
        );
        return [...otherWeekPlans, savedWeekPlan].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
      });
    },
    [setWeekPlans],
  );

  return { weekPlans, findWeekPlan, saveWeekPlan, isHydrated };
}
