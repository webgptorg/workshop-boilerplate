import { getMealCategoryLabel, type Meal } from "@/lib/meals";
import { Badge } from "@/components/ui";
import { AllergenList } from "./allergen-list";
import { MealIcon } from "./meal-icon";

export type MealSummaryProps = {
  meal: Meal | null;
  /**
   * Shown above the name, for example "Oběd 1".
   */
  kicker?: string;
  isCategoryShown?: boolean;
};

/**
 * Icon, name, description and allergens of one meal; `null` renders the "not planned yet" state.
 */
export function MealSummary({ meal, kicker, isCategoryShown = true }: MealSummaryProps) {
  if (meal === null) {
    return (
      <div className="meal-summary meal-summary-missing">
        {kicker ? <span className="meal-kicker">{kicker}</span> : null}
        <span className="meal-name">Jídlo zatím nedoplněno</span>
      </div>
    );
  }

  return (
    <div className="meal-summary">
      <span className="meal-icon" data-category={meal.category}>
        <MealIcon name={meal.iconName} size={26} />
      </span>
      <div className="meal-summary-text">
        {kicker ? <span className="meal-kicker">{kicker}</span> : null}
        <span className="meal-name">{meal.name}</span>
        {meal.description ? <span className="meal-description">{meal.description}</span> : null}
        <span className="meal-meta">
          {isCategoryShown ? <Badge>{getMealCategoryLabel(meal.category)}</Badge> : null}
          <AllergenList codes={meal.allergenCodes} />
        </span>
      </div>
    </div>
  );
}
