"use client";

import { CalendarPlus } from "lucide-react";
import { getDayTiming } from "@/components/plan/day-card";
import { WeekNavigator } from "@/components/plan/week-navigator";
import { Button } from "@/components/ui";
import { useStoreValue } from "@/hooks/use-store-value";
import { useWeekNavigation } from "@/hooks/use-week-navigation";
import { getTodayIsoDate } from "@/lib/dates";
import { mealCatalogStore } from "@/lib/meals";
import { createWeekPlanIfMissing, findWeekPlan, summarizeWeekVariety, weekPlanStore } from "@/lib/plan";
import { countChoicesForDate, selectionStore } from "@/lib/selections";
import { listPupilUsers } from "@/lib/users";
import { DayPlanEditor } from "./day-plan-editor";
import { WeekVarietySummary } from "./week-variety-summary";

const PUPIL_USER_IDS = listPupilUsers().map((pupil) => pupil.id);

/**
 * The canteen's view of a week: every change is saved immediately.
 */
export function WeekPlanEditor() {
  const navigation = useWeekNavigation();
  const weekPlans = useStoreValue(weekPlanStore);
  const meals = useStoreValue(mealCatalogStore);
  const selections = useStoreValue(selectionStore);

  const weekPlan = findWeekPlan(weekPlans, navigation.weekStartDate);
  const todayIsoDate = getTodayIsoDate();

  return (
    <section className="week-view" aria-label="Úprava jídelníčku">
      <WeekNavigator navigation={navigation} />

      {weekPlan === null ? (
        <div className="empty-state">
          <p>Tento týden zatím nemá jídelníček.</p>
          <Button onClick={() => createWeekPlanIfMissing(navigation.weekStartDate)}>
            <CalendarPlus size={18} />
            Založit jídelníček pro tento týden
          </Button>
        </div>
      ) : (
        <>
          <WeekVarietySummary summary={summarizeWeekVariety(weekPlan, meals)} />

          <div className="day-list">
            {weekPlan.days.map((dayPlan) => (
              <DayPlanEditor
                key={dayPlan.date}
                weekStartDate={weekPlan.weekStartDate}
                dayPlan={dayPlan}
                timing={getDayTiming(dayPlan.date, todayIsoDate)}
                meals={meals}
                choiceCounts={countChoicesForDate(selections, PUPIL_USER_IDS, dayPlan.date)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
