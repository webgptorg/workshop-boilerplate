"use client";

import { useState, type FormEvent } from "react";
import { ALL_ALLERGEN_CODES, ALLERGEN_NAMES } from "@/data/allergens";
import { Button, Card, Field, Notice } from "@/components/ui";
import type { AllergenCode, MealDiet, PupilPreferences } from "@/model/types";
import { DIET_LABELS } from "@/planning/dietLabels";

interface PreferencesFormProps {
  readonly preferences: PupilPreferences;
  readonly onSave: (preferences: PupilPreferences) => void;
}

const DIET_OPTIONS = Object.keys(DIET_LABELS) as MealDiet[];

function toggleItem<TItem>(items: readonly TItem[], item: TItem): TItem[] {
  return items.includes(item) ? items.filter((candidate) => candidate !== item) : [...items, item];
}

function parseIngredients(text: string): string[] {
  return text
    .split(",")
    .map((ingredient) => ingredient.trim())
    .filter((ingredient) => ingredient !== "");
}

/**
 * What the child cannot or does not want to eat. Meals matching the
 * preferences are marked as unsuitable in the week plan.
 */
export function PreferencesForm({ preferences, onSave }: PreferencesFormProps) {
  const [excludedAllergens, setExcludedAllergens] = useState<readonly AllergenCode[]>(preferences.excludedAllergens);
  const [excludedDiets, setExcludedDiets] = useState<readonly MealDiet[]>(preferences.excludedDiets);
  const [ingredientsText, setIngredientsText] = useState(preferences.dislikedIngredients.join(", "));
  const [isSaved, setIsSaved] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave({ excludedAllergens, excludedDiets, dislikedIngredients: parseIngredients(ingredientsText) });
    setIsSaved(true);
  }

  return (
    <Card>
      <form className="preferences-form" onSubmit={handleSubmit} onChange={() => setIsSaved(false)}>
        <fieldset className="allergen-fieldset">
          <legend className="field-label">Alergeny, kterým se dítě vyhýbá</legend>
          <div className="allergen-options">
            {ALL_ALLERGEN_CODES.map((allergen) => (
              <label key={allergen} className="checkbox-option">
                <input type="checkbox" checked={excludedAllergens.includes(allergen)} onChange={() => setExcludedAllergens(toggleItem(excludedAllergens, allergen))} />
                <span>
                  {allergen} {ALLERGEN_NAMES[allergen]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="allergen-fieldset">
          <legend className="field-label">Druhy jídel, které dítě nejí</legend>
          <div className="allergen-options">
            {DIET_OPTIONS.map((diet) => (
              <label key={diet} className="checkbox-option">
                <input type="checkbox" checked={excludedDiets.includes(diet)} onChange={() => setExcludedDiets(toggleItem(excludedDiets, diet))} />
                <span>{DIET_LABELS[diet]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="Suroviny, které dítě nemá rádo" hint="Oddělte čárkou, například: kopr, houby">
          <input className="input" value={ingredientsText} onChange={(event) => setIngredientsText(event.target.value)} />
        </Field>
        <div className="form-actions">
          <Button type="submit">Uložit</Button>
          {isSaved && <Notice tone="success">Uloženo.</Notice>}
        </div>
      </form>
    </Card>
  );
}
