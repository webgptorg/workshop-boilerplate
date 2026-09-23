"use client";

import { Save } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { AllergenChecklist } from "@/components/meals/allergen-checklist";
import { Button, Field, Textarea } from "@/components/ui";
import { useStoreValue } from "@/hooks/use-store-value";
import { MEAL_CATEGORY_LIST, getMealCategoryLabel, type AllergenCode, type MealCategory } from "@/lib/meals";
import { getPreferencesForPupil, preferencesStore, savePreferencesForPupil } from "@/lib/preferences";

/**
 * Categories a parent can exclude. Meatless meals are always fine.
 */
const EXCLUDABLE_CATEGORIES: readonly MealCategory[] = MEAL_CATEGORY_LIST.filter(
  (category) => category !== "VEGETARIAN",
);

export type PreferencesFormProps = {
  pupilUserId: string;
  pupilDisplayName: string;
};

export function PreferencesForm({ pupilUserId, pupilDisplayName }: PreferencesFormProps) {
  const idPrefix = useId();
  const preferencesCollection = useStoreValue(preferencesStore);
  const savedPreferences = getPreferencesForPupil(preferencesCollection, pupilUserId);

  const [excludedCategories, setExcludedCategories] = useState<readonly MealCategory[]>(
    savedPreferences.excludedCategories,
  );
  const [excludedAllergenCodes, setExcludedAllergenCodes] = useState<readonly AllergenCode[]>(
    savedPreferences.excludedAllergenCodes,
  );
  const [note, setNote] = useState(savedPreferences.note);
  const [isSaved, setIsSaved] = useState(false);

  function toggleCategory(category: MealCategory, isChecked: boolean) {
    setExcludedCategories((categories) =>
      isChecked ? [...categories, category] : categories.filter((excluded) => excluded !== category),
    );
    setIsSaved(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    savePreferencesForPupil(pupilUserId, { excludedCategories, excludedAllergenCodes, note });
    setIsSaved(true);
  }

  return (
    <form className="preferences-form" onSubmit={handleSubmit}>
      <fieldset className="fieldset">
        <legend>Jídla, kterým se {pupilDisplayName} vyhýbá</legend>
        <ul className="checklist checklist-inline">
          {EXCLUDABLE_CATEGORIES.map((category) => {
            const inputId = `${idPrefix}-category-${category}`;

            return (
              <li key={category}>
                <input
                  id={inputId}
                  type="checkbox"
                  checked={excludedCategories.includes(category)}
                  onChange={(event) => toggleCategory(category, event.target.checked)}
                />
                <label htmlFor={inputId}>{getMealCategoryLabel(category)}</label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset className="fieldset">
        <legend>Alergeny, které nesmí dostat</legend>
        <AllergenChecklist
          idPrefix={idPrefix}
          selectedCodes={excludedAllergenCodes}
          onChange={(codes) => {
            setExcludedAllergenCodes(codes);
            setIsSaved(false);
          }}
        />
      </fieldset>

      <Field label="Poznámka pro jídelnu" htmlFor={`${idPrefix}-note`}>
        <Textarea
          id={`${idPrefix}-note`}
          rows={2}
          value={note}
          onChange={(event) => {
            setNote(event.target.value);
            setIsSaved(false);
          }}
        />
      </Field>

      <div className="form-actions">
        <Button type="submit">
          <Save size={18} />
          Uložit preference
        </Button>
        {isSaved ? (
          <span className="form-status" role="status">
            Uloženo. Doporučení v jídelníčku se hned přepočítalo.
          </span>
        ) : null}
      </div>
    </form>
  );
}
