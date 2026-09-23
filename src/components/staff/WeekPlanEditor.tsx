"use client";

import { WeekNavigator } from "@/components/menu/WeekNavigator";
import { Badge, Button, Card } from "@/components/ui";
import { useAppData } from "@/hooks/AppDataProvider";
import { useWeekNavigation } from "@/hooks/useWeekNavigation";
import type { DayMenu, WeekPlan } from "@/model/types";
import { checkWeekBasket } from "@/planning/basketCheck";
import { createEmptyWeekPlan } from "@/planning/emptyWeekPlan";
import { BasketCheckPanel } from "./BasketCheckPanel";
import { DayEditor } from "./DayEditor";

/**
 * Week plan editing for the staff, every change is stored immediately.
 */
export function WeekPlanEditor() {
  const { weekPlans } = useAppData();
  const navigation = useWeekNavigation();
  const weekPlan = weekPlans.findWeekPlan(navigation.weekStart);

  return (
    <div className="week-view">
      <WeekNavigator
        weekStart={navigation.weekStart}
        onPreviousWeek={navigation.goToPreviousWeek}
        onNextWeek={navigation.goToNextWeek}
        onCurrentWeek={navigation.goToCurrentWeek}
      />
      {weekPlan ? (
        <ExistingWeekPlan weekPlan={weekPlan} />
      ) : (
        <Card className="week-missing">
          <p>Tento týden ještě nemá jídelníček.</p>
          <Button onClick={() => weekPlans.saveWeekPlan(createEmptyWeekPlan(navigation.weekStart))}>
            Založit jídelníček
          </Button>
        </Card>
      )}
    </div>
  );
}

function ExistingWeekPlan({ weekPlan }: { readonly weekPlan: WeekPlan }) {
  const { weekPlans, mealCatalog } = useAppData();
  const basketCheck = checkWeekBasket(weekPlan, mealCatalog.findMeal);

  function handleDayChange(changedDay: DayMenu) {
    weekPlans.saveWeekPlan({
      ...weekPlan,
      days: weekPlan.days.map((day) => (day.date === changedDay.date ? changedDay : day)),
    });
  }

  function handlePublishToggle() {
    weekPlans.saveWeekPlan({ ...weekPlan, isPublished: !weekPlan.isPublished });
  }

  return (
    <>
      <Card className="publish-bar">
        <Badge tone={weekPlan.isPublished ? "success" : "warning"}>
          {weekPlan.isPublished ? "Zveřejněno" : "Koncept"}
        </Badge>
        <span className="publish-bar-text">
          {weekPlan.isPublished ? "Žáci a rodiče jídelníček vidí." : "Jídelníček vidí jen jídelna."}
        </span>
        <Button variant={weekPlan.isPublished ? "secondary" : "primary"} onClick={handlePublishToggle}>
          {weekPlan.isPublished ? "Stáhnout ze zveřejnění" : "Zveřejnit"}
        </Button>
      </Card>
      <BasketCheckPanel check={basketCheck} />
      {weekPlan.days.map((day) => (
        <DayEditor key={day.date} day={day} meals={mealCatalog.meals} onChange={handleDayChange} />
      ))}
    </>
  );
}
