import { useCallback, useState } from "react";
import { addDays, getTodayIsoDate, getWeekStartDate, type IsoDate } from "@/lib/dates";

const DAYS_PER_WEEK = 7;

export type WeekNavigation = {
  readonly weekStartDate: IsoDate;
  readonly currentWeekStartDate: IsoDate;
  readonly isCurrentWeek: boolean;
  readonly goToPreviousWeek: () => void;
  readonly goToNextWeek: () => void;
  readonly goToCurrentWeek: () => void;
};

/**
 * Which week is displayed; starts on the current week.
 */
export function useWeekNavigation(): WeekNavigation {
  const [currentWeekStartDate] = useState(() => getWeekStartDate(getTodayIsoDate()));
  const [weekStartDate, setWeekStartDate] = useState(currentWeekStartDate);

  const goToPreviousWeek = useCallback(() => {
    setWeekStartDate((weekStart) => addDays(weekStart, -DAYS_PER_WEEK));
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeekStartDate((weekStart) => addDays(weekStart, DAYS_PER_WEEK));
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setWeekStartDate(currentWeekStartDate);
  }, [currentWeekStartDate]);

  return {
    weekStartDate,
    currentWeekStartDate,
    isCurrentWeek: weekStartDate === currentWeekStartDate,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
  };
}
