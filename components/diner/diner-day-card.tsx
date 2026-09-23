import { Badge } from "@/components/ui";
import { DayCard, type DayTiming } from "@/components/plan/day-card";
import { LUNCH_CHOICE_LIST } from "@/components/plan/lunch-option-labels";
import { SoupAndSupplement } from "@/components/plan/soup-and-supplement";
import { findMealById, type Meal } from "@/lib/meals";
import type { DayPlan, LunchChoice } from "@/lib/plan";
import { recommendDayChoice, type MealPreferences } from "@/lib/preferences";
import { LunchOption } from "./lunch-option";

export type DinerDayCardProps = {
  dayPlan: DayPlan;
  timing: DayTiming;
  meals: readonly Meal[];
  preferences: MealPreferences;
  selectedChoice: LunchChoice;
  authorUserId: string;
  onSelect: (date: DayPlan["date"], choice: LunchChoice) => void;
};

export function DinerDayCard({
  dayPlan,
  timing,
  meals,
  preferences,
  selectedChoice,
  authorUserId,
  onSelect,
}: DinerDayCardProps) {
  const recommendation = recommendDayChoice(dayPlan, meals, preferences);
  const mealsByChoice: Readonly<Record<LunchChoice, Meal | null>> = {
    PRIMARY: findMealById(meals, dayPlan.primaryMealId),
    ALTERNATIVE: findMealById(meals, dayPlan.alternativeMealId),
  };

  return (
    <DayCard
      date={dayPlan.date}
      timing={timing}
      closedNote={dayPlan.closedNote}
      headerContent={recommendation.isNoOptionSuitable ? <Badge tone="warning">Žádná varianta nevyhovuje preferencím</Badge> : null}
    >
      <SoupAndSupplement soup={findMealById(meals, dayPlan.soupMealId)} supplement={dayPlan.supplement} />

      {recommendation.soup.isSuitable ? null : (
        <p className="day-card-note">Polévka nevyhovuje preferencím: {recommendation.soup.reasons.join(", ")}.</p>
      )}

      <div className="lunch-options">
        {LUNCH_CHOICE_LIST.map((choice) => (
          <LunchOption
            key={choice}
            choice={choice}
            meal={mealsByChoice[choice]}
            date={dayPlan.date}
            suitability={recommendation[choice === "PRIMARY" ? "primary" : "alternative"]}
            isRecommended={recommendation.recommendedChoice === choice}
            isSelected={selectedChoice === choice}
            isSelectable={timing !== "PAST"}
            isRatable={timing !== "FUTURE"}
            authorUserId={authorUserId}
            onSelect={(selected) => onSelect(dayPlan.date, selected)}
          />
        ))}
      </div>
    </DayCard>
  );
}
