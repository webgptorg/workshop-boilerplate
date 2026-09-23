import { Check } from "lucide-react";
import { MealFeedbackControl } from "@/components/feedback/meal-feedback-control";
import { MealSummary } from "@/components/meals/meal-summary";
import { LUNCH_CHOICE_LABELS } from "@/components/plan/lunch-option-labels";
import { Badge, Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { IsoDate } from "@/lib/dates";
import type { Meal } from "@/lib/meals";
import type { LunchChoice } from "@/lib/plan";
import type { MealSuitability } from "@/lib/preferences";

export type LunchOptionProps = {
  choice: LunchChoice;
  meal: Meal | null;
  date: IsoDate;
  suitability: MealSuitability;
  isRecommended: boolean;
  isSelected: boolean;
  /**
   * Selecting is possible until the day is over.
   */
  isSelectable: boolean;
  /**
   * Rating is possible once the meal has been served (today or earlier).
   */
  isRatable: boolean;
  authorUserId: string;
  onSelect: (choice: LunchChoice) => void;
};

/**
 * One of the two lunch options as a pupil or a parent sees it.
 */
export function LunchOption({
  choice,
  meal,
  date,
  suitability,
  isRecommended,
  isSelected,
  isSelectable,
  isRatable,
  authorUserId,
  onSelect,
}: LunchOptionProps) {
  const isMealPlanned = meal !== null;

  return (
    <div
      className={cn(
        "lunch-option",
        isSelected && "is-selected",
        !suitability.isSuitable && "is-unsuitable",
        isRecommended && "is-recommended",
      )}
    >
      <MealSummary meal={meal} kicker={LUNCH_CHOICE_LABELS[choice]} />

      {(isRecommended || !suitability.isSuitable) && isMealPlanned ? (
        <div className="lunch-option-hints">
          {isRecommended ? <Badge tone="green">Doporučeno podle preferencí</Badge> : null}
          {suitability.isSuitable ? null : (
            <Badge tone="warning">Nevhodné: {suitability.reasons.join(", ")}</Badge>
          )}
        </div>
      ) : null}

      <div className="lunch-option-actions">
        {isSelectable && isMealPlanned ? (
          <Button
            variant={isSelected ? "tint" : "secondary"}
            size="small"
            aria-pressed={isSelected}
            onClick={() => onSelect(choice)}
          >
            {isSelected ? <Check size={16} /> : null}
            {isSelected ? "Vybráno" : "Vybrat"}
          </Button>
        ) : null}

        {!isSelectable && isSelected && isMealPlanned ? (
          <span className="lunch-option-selected-note">
            <Check size={16} />
            Vybráno
          </span>
        ) : null}

        {isRatable && isMealPlanned ? (
          <MealFeedbackControl authorUserId={authorUserId} mealId={meal.id} date={date} />
        ) : null}
      </div>
    </div>
  );
}
