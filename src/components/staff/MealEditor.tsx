"use client";

import { useState, type FormEvent } from "react";
import { ALL_ALLERGEN_CODES, ALLERGEN_NAMES } from "@/data/allergens";
import { Button, Field } from "@/components/ui";
import type { AllergenCode, Meal, MealDiet } from "@/model/types";
import { DIET_LABELS } from "@/planning/dietLabels";

interface MealEditorProps {
  readonly meal: Meal;
  readonly onSave: (meal: Meal) => void;
  readonly onCancel: () => void;
}

const DIET_OPTIONS = Object.keys(DIET_LABELS) as MealDiet[];

/**
 * Form for the information of one meal shown to the diners.
 */
export function MealEditor({ meal, onSave, onCancel }: MealEditorProps) {
  const [draft, setDraft] = useState<Meal>(meal);

  function toggleAllergen(allergen: AllergenCode) {
    const allergens = draft.allergens.includes(allergen)
      ? draft.allergens.filter((code) => code !== allergen)
      : [...draft.allergens, allergen].sort((a, b) => a - b);
    setDraft({ ...draft, allergens });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave({ ...draft, name: draft.name.trim(), description: draft.description.trim() });
  }

  return (
    <form className="meal-editor" onSubmit={handleSubmit}>
      <div className="meal-editor-grid">
        <Field label="Ikona">
          <input className="input input-icon" value={draft.icon} maxLength={4} onChange={(event) => setDraft({ ...draft, icon: event.target.value })} />
        </Field>
        <Field label="Název">
          <input className="input" value={draft.name} required onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
        </Field>
        <Field label="Druh">
          <select className="input" value={draft.diet} onChange={(event) => setDraft({ ...draft, diet: event.target.value as MealDiet })}>
            {DIET_OPTIONS.map((diet) => (
              <option key={diet} value={diet}>
                {DIET_LABELS[diet]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Cena surovin na porci (Kč, odhad)">
          <input className="input" type="number" min={0} value={draft.estimatedCostCzk} onChange={(event) => setDraft({ ...draft, estimatedCostCzk: Number(event.target.value) })} />
        </Field>
      </div>
      <Field label="Suroviny">
        <textarea className="input" rows={2} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
      </Field>
      <fieldset className="allergen-fieldset">
        <legend className="field-label">Alergeny</legend>
        <div className="allergen-options">
          {ALL_ALLERGEN_CODES.map((allergen) => (
            <label key={allergen} className="checkbox-option">
              <input type="checkbox" checked={draft.allergens.includes(allergen)} onChange={() => toggleAllergen(allergen)} />
              <span>
                {allergen} {ALLERGEN_NAMES[allergen]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="form-actions">
        <Button type="submit">Uložit</Button>
        <Button variant="ghost" onClick={onCancel}>
          Zrušit
        </Button>
      </div>
    </form>
  );
}
