"use client";

import { getDayTiming } from "@/components/plan/day-card";
import { WeekNavigator } from "@/components/plan/week-navigator";
import { useStoreValue } from "@/hooks/use-store-value";
import { useWeekNavigation } from "@/hooks/use-week-navigation";
import { getTodayIsoDate, type IsoDate } from "@/lib/dates";
import { mealCatalogStore } from "@/lib/meals";
import { findWeekPlan, weekPlanStore, type LunchChoice } from "@/lib/plan";
import { getPreferencesForPupil, preferencesStore } from "@/lib/preferences";
import { getEffectiveChoice, saveSelection, selectionStore } from "@/lib/selections";
import { DinerDayCard } from "./diner-day-card";

export type DinerWeekViewProps = {
  /**
   * Whose lunch is shown and selected.
   */
  pupilUserId: string;
  /**
   * Who writes the feedback: the pupil, or the parent looking at the child's week.
   */
  authorUserId: string;
};

/**
 * The week plan as pupils and parents see it: choose between the two options, rate meals.
 */
export function DinerWeekView({ pupilUserId, authorUserId }: DinerWeekViewProps) {
  const navigation = useWeekNavigation();
  const weekPlans = useStoreValue(weekPlanStore);
  const meals = useStoreValue(mealCatalogStore);
  const selections = useStoreValue(selectionStore);
  const preferencesCollection = useStoreValue(preferencesStore);

  const weekPlan = findWeekPlan(weekPlans, navigation.weekStartDate);
  const preferences = getPreferencesForPupil(preferencesCollection, pupilUserId);
  const todayIsoDate = getTodayIsoDate();

  function handleSelect(date: IsoDate, choice: LunchChoice) {
    saveSelection(pupilUserId, date, choice);
  }

  return (
    <section className="week-view" aria-label="Týdenní jídelníček">
      <WeekNavigator navigation={navigation} />

      {weekPlan === null ? (
        <p className="empty-state">Pro tento týden jídelna zatím jídelníček nezveřejnila.</p>
      ) : (
        <div className="day-list">
          {weekPlan.days.map((dayPlan) => (
            <DinerDayCard
              key={dayPlan.date}
              dayPlan={dayPlan}
              timing={getDayTiming(dayPlan.date, todayIsoDate)}
              meals={meals}
              preferences={preferences}
              selectedChoice={getEffectiveChoice(selections, pupilUserId, dayPlan.date)}
              authorUserId={authorUserId}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </section>
  );
}
