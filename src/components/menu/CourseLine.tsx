import type { Meal } from "@/model/types";
import { AllergenChips } from "./AllergenChips";
import { MealIcon } from "./MealIcon";

interface CourseLineProps {
  readonly label: string;
  readonly meal: Meal | undefined;
}

/**
 * Single line for the soup or the supplement of the day.
 */
export function CourseLine({ label, meal }: CourseLineProps) {
  return (
    <div className="course-line">
      <span className="course-label">{label}</span>
      {meal ? (
        <span className="course-meal">
          <MealIcon icon={meal.icon} size="small" />
          <span>{meal.name}</span>
          <AllergenChips allergens={meal.allergens} />
        </span>
      ) : (
        <span className="course-missing">Nezadáno</span>
      )}
    </div>
  );
}
