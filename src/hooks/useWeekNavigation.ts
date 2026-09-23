"use client";

import { useCallback, useState } from "react";
import type { IsoDate } from "@/model/types";
import { addDays, getTodayIsoDate, getWeekStart } from "@/planning/calendar";

const DAYS_PER_WEEK = 7;

export interface WeekNavigation {
  readonly weekStart: IsoDate;
  readonly goToPreviousWeek: () => void;
  readonly goToNextWeek: () => void;
  readonly goToCurrentWeek: () => void;
}

export function useWeekNavigation(): WeekNavigation {
  const [weekStart, setWeekStart] = useState<IsoDate>(() => getWeekStart(getTodayIsoDate()));

  const goToPreviousWeek = useCallback(() => setWeekStart((current) => addDays(current, -DAYS_PER_WEEK)), []);
  const goToNextWeek = useCallback(() => setWeekStart((current) => addDays(current, DAYS_PER_WEEK)), []);
  const goToCurrentWeek = useCallback(() => setWeekStart(getWeekStart(getTodayIsoDate())), []);

  return { weekStart, goToPreviousWeek, goToNextWeek, goToCurrentWeek };
}
