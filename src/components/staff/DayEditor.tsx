"use client";

import { DayHeader } from "@/components/menu/DayHeader";
import { Card, Field } from "@/components/ui";
import type { DayMenu, Meal } from "@/model/types";
import { MealSelect } from "./MealSelect";

interface DayEditorProps {
  readonly day: DayMenu;
  readonly meals: readonly Meal[];
  readonly onChange: (day: DayMenu) => void;
}

/**
 * Editor of one day of the week plan.
 */
export function DayEditor({ day, meals, onChange }: DayEditorProps) {
  const isClosed = day.note !== undefined;

  function handleNoteChange(note: string) {
    onChange(
      note.trim() === ""
        ? { ...day, note: undefined }
        : { ...day, note, soupId: null, primaryMealId: null, alternativeMealId: null, supplementId: null },
    );
  }

  return (
    <Card className="day-card day-editor">
      <DayHeader date={day.date} />
      <Field label="Den bez oběda" hint="Vyplňte důvod, například státní svátek. Prázdné = vaří se.">
        <input
          className="input"
          value={day.note ?? ""}
          onChange={(event) => handleNoteChange(event.target.value)}
          placeholder="Vaří se"
        />
      </Field>
      {!isClosed && (
        <div className="day-editor-grid">
          <Field label="Polévka">
            <MealSelect id={`${day.date}-soup`} meals={meals} course="soup" value={day.soupId} onChange={(soupId) => onChange({ ...day, soupId })} />
          </Field>
          <Field label="Oběd 1">
            <MealSelect id={`${day.date}-primary`} meals={meals} course="main" value={day.primaryMealId} onChange={(primaryMealId) => onChange({ ...day, primaryMealId })} />
          </Field>
          <Field label="Oběd 2">
            <MealSelect id={`${day.date}-alternative`} meals={meals} course="main" value={day.alternativeMealId} onChange={(alternativeMealId) => onChange({ ...day, alternativeMealId })} />
          </Field>
          <Field label="Doplněk">
            <MealSelect id={`${day.date}-supplement`} meals={meals} course="supplement" value={day.supplementId} onChange={(supplementId) => onChange({ ...day, supplementId })} />
          </Field>
        </div>
      )}
    </Card>
  );
}
