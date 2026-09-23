"use client";

import { Card, EmptyState } from "@/components/ui";
import { WeekNavigator } from "@/components/menu/WeekNavigator";
import { useAppData } from "@/hooks/AppDataProvider";
import { useWeekNavigation } from "@/hooks/useWeekNavigation";
import type { UserRole } from "@/model/types";
import { DinerDayCard } from "./DinerDayCard";

interface DinerWeekViewProps {
  /** Pupil whose choices and preferences are shown */
  readonly pupilId: string;
  /** Signed-in user who selects meals and writes feedback */
  readonly authorId: string;
  readonly authorRole: UserRole;
}

/**
 * Published week plan as seen by a pupil or a parent.
 */
export function DinerWeekView({ pupilId, authorId, authorRole }: DinerWeekViewProps) {
  const { weekPlans } = useAppData();
  const navigation = useWeekNavigation();
  const weekPlan = weekPlans.findWeekPlan(navigation.weekStart);
  const isVisible = weekPlan !== undefined && weekPlan.isPublished;

  return (
    <div className="week-view">
      <WeekNavigator
        weekStart={navigation.weekStart}
        onPreviousWeek={navigation.goToPreviousWeek}
        onNextWeek={navigation.goToNextWeek}
        onCurrentWeek={navigation.goToCurrentWeek}
      />
      {isVisible ? (
        weekPlan.days.map((day) => (
          <DinerDayCard key={day.date} day={day} pupilId={pupilId} authorId={authorId} authorRole={authorRole} />
        ))
      ) : (
        <Card>
          <EmptyState text="Jídelníček pro tento týden zatím není zveřejněn." />
        </Card>
      )}
    </div>
  );
}
