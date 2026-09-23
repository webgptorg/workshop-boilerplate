"use client";

import { CourseLine } from "@/components/menu/CourseLine";
import { DayHeader } from "@/components/menu/DayHeader";
import { Card } from "@/components/ui";
import { useAppData } from "@/hooks/AppDataProvider";
import type { DayMenu, MealSlot, UserRole } from "@/model/types";
import { DinerMealRow } from "./DinerMealRow";

interface DinerDayCardProps {
  readonly day: DayMenu;
  readonly pupilId: string;
  readonly authorId: string;
  readonly authorRole: UserRole;
}

const MEAL_SLOTS: readonly MealSlot[] = ["primary", "alternative"];

function getMealIdOfSlot(day: DayMenu, slot: MealSlot): string | null {
  return slot === "primary" ? day.primaryMealId : day.alternativeMealId;
}

export function DinerDayCard({ day, pupilId, authorId, authorRole }: DinerDayCardProps) {
  const { mealCatalog } = useAppData();

  if (day.note) {
    return (
      <Card className="day-card day-card-closed">
        <DayHeader date={day.date} />
        <p className="day-note">{day.note}</p>
      </Card>
    );
  }

  return (
    <Card className="day-card">
      <DayHeader date={day.date} />
      <CourseLine label="Polévka" meal={mealCatalog.findMeal(day.soupId)} />
      <div className="meal-rows">
        {MEAL_SLOTS.map((slot) => {
          const meal = mealCatalog.findMeal(getMealIdOfSlot(day, slot));
          return meal ? (
            <DinerMealRow
              key={slot}
              meal={meal}
              slot={slot}
              date={day.date}
              pupilId={pupilId}
              authorId={authorId}
              authorRole={authorRole}
            />
          ) : null;
        })}
      </div>
      <CourseLine label="Doplněk" meal={mealCatalog.findMeal(day.supplementId)} />
    </Card>
  );
}
