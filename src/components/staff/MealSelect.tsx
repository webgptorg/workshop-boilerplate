import type { Meal, MealCourse, MealId } from "@/model/types";

interface MealSelectProps {
  readonly id: string;
  readonly meals: readonly Meal[];
  readonly course: MealCourse;
  readonly value: MealId | null;
  readonly onChange: (mealId: MealId | null) => void;
}

export function MealSelect({ id, meals, course, value, onChange }: MealSelectProps) {
  const options = meals.filter((meal) => meal.course === course);

  return (
    <select
      id={id}
      className="input"
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value === "" ? null : event.target.value)}
    >
      <option value="">Nezadáno</option>
      {options.map((meal) => (
        <option key={meal.id} value={meal.id}>
          {meal.icon} {meal.name}
        </option>
      ))}
    </select>
  );
}
