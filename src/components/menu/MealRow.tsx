import type { ReactNode } from "react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Meal, MealSlot } from "@/model/types";
import { DIET_LABELS } from "@/planning/dietLabels";
import { AllergenChips } from "./AllergenChips";
import { MealIcon } from "./MealIcon";

export const MEAL_SLOT_LABELS: Readonly<Record<MealSlot, string>> = {
  primary: "Oběd 1",
  alternative: "Oběd 2",
};

interface MealRowProps {
  readonly meal: Meal;
  readonly slot: MealSlot;
  readonly isSelected?: boolean;
  /** Reasons why the meal does not fit the preferences of the pupil */
  readonly unsuitableReasons?: readonly string[];
  readonly children?: ReactNode;
}

export function MealRow({ meal, slot, isSelected = false, unsuitableReasons = [], children }: MealRowProps) {
  const isUnsuitable = unsuitableReasons.length > 0;

  return (
    <article className={cn("meal-row", isSelected && "is-selected", isUnsuitable && "is-unsuitable")}>
      <MealIcon icon={meal.icon} />
      <div className="meal-row-body">
        <div className="meal-row-header">
          <span className="meal-slot">{MEAL_SLOT_LABELS[slot]}</span>
          <Badge tone="neutral">{DIET_LABELS[meal.diet]}</Badge>
          {isSelected && <Badge tone="accent">Vybráno</Badge>}
          {isUnsuitable && <Badge tone="warning">Nevhodné</Badge>}
        </div>
        <h3 className="meal-name">{meal.name}</h3>
        <p className="meal-description">{meal.description}</p>
        {isUnsuitable && <p className="meal-reasons">{unsuitableReasons.join(", ")}</p>}
        <AllergenChips allergens={meal.allergens} />
      </div>
      {children && <div className="meal-row-actions">{children}</div>}
    </article>
  );
}
