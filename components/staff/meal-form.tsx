"use client";

import { Save } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { AllergenChecklist } from "@/components/meals/allergen-checklist";
import { MealIcon } from "@/components/meals/meal-icon";
import { Button, Field, Input, Select } from "@/components/ui";
import {
  MEAL_CATEGORY_LIST,
  MEAL_ICON_NAME_LIST,
  getMealCategoryLabel,
  getMealIconLabel,
  type Meal,
  type MealCategory,
  type MealIconName,
} from "@/lib/meals";

export type MealFormProps = {
  meal: Meal;
  onSave: (meal: Meal) => void;
  onCancel: () => void;
};

/**
 * Edits one catalog entry; the result is handed back on save.
 */
export function MealForm({ meal, onSave, onCancel }: MealFormProps) {
  const idPrefix = useId();
  const [draft, setDraft] = useState<Meal>(meal);
  const isNameMissing = draft.name.trim() === "";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isNameMissing) {
      return;
    }

    onSave({ ...draft, name: draft.name.trim(), description: draft.description.trim() });
  }

  return (
    <form className="meal-form" onSubmit={handleSubmit}>
      <div className="meal-form-grid">
        <Field label="Název" htmlFor={`${idPrefix}-name`} className="meal-form-name">
          <Input
            id={`${idPrefix}-name`}
            value={draft.name}
            onChange={(event) => setDraft({ ...draft, name: event.target.value })}
            required
            autoFocus
          />
        </Field>

        <Field
          label="Příloha a suroviny"
          htmlFor={`${idPrefix}-description`}
          className="meal-form-description"
          hint="Například „vařené brambory · kuřecí maso, paprika“"
        >
          <Input
            id={`${idPrefix}-description`}
            value={draft.description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
          />
        </Field>

        <Field label="Kategorie" htmlFor={`${idPrefix}-category`}>
          <Select
            id={`${idPrefix}-category`}
            value={draft.category}
            onChange={(event) => setDraft({ ...draft, category: event.target.value as MealCategory })}
          >
            {MEAL_CATEGORY_LIST.map((category) => (
              <option key={category} value={category}>
                {getMealCategoryLabel(category)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Ikona" htmlFor={`${idPrefix}-icon`}>
          <div className="meal-form-icon">
            <span className="meal-icon" data-category={draft.category}>
              <MealIcon name={draft.iconName} size={22} />
            </span>
            <Select
              id={`${idPrefix}-icon`}
              value={draft.iconName}
              onChange={(event) => setDraft({ ...draft, iconName: event.target.value as MealIconName })}
            >
              {MEAL_ICON_NAME_LIST.map((iconName) => (
                <option key={iconName} value={iconName}>
                  {getMealIconLabel(iconName)}
                </option>
              ))}
            </Select>
          </div>
        </Field>
      </div>

      <fieldset className="fieldset">
        <legend>Alergeny</legend>
        <AllergenChecklist
          idPrefix={idPrefix}
          selectedCodes={draft.allergenCodes}
          onChange={(allergenCodes) => setDraft({ ...draft, allergenCodes })}
        />
      </fieldset>

      <div className="form-actions">
        <Button type="submit" disabled={isNameMissing}>
          <Save size={18} />
          Uložit jídlo
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Zrušit
        </Button>
      </div>
    </form>
  );
}
