import { Select } from "@/components/ui";
import { listMealsByCourse, type Meal, type MealCourse } from "@/lib/meals";

export type MealSelectProps = {
  id: string;
  meals: readonly Meal[];
  course: MealCourse;
  value: string | null;
  onChange: (mealId: string | null) => void;
};

const EMPTY_VALUE = "";

/**
 * Dropdown over the catalog, filtered to soups or main courses.
 */
export function MealSelect({ id, meals, course, value, onChange }: MealSelectProps) {
  return (
    <Select
      id={id}
      value={value ?? EMPTY_VALUE}
      onChange={(event) => onChange(event.target.value === EMPTY_VALUE ? null : event.target.value)}
    >
      <option value={EMPTY_VALUE}>— nevybráno —</option>
      {listMealsByCourse(meals, course).map((meal) => (
        <option key={meal.id} value={meal.id}>
          {meal.name}
        </option>
      ))}
    </Select>
  );
}
