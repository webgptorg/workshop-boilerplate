"use client";

import { ArrowLeftRight } from "lucide-react";
import { useId } from "react";
import { MealSummary } from "@/components/meals/meal-summary";
import { DayCard, type DayTiming } from "@/components/plan/day-card";
import { LUNCH_CHOICE_LABELS } from "@/components/plan/lunch-option-labels";
import { Button, Field, Input } from "@/components/ui";
import type { IsoDate } from "@/lib/dates";
import { findMealById, type Meal } from "@/lib/meals";
import { swapDayOptions, updateDayPlan, type DayPlan, type LunchChoice } from "@/lib/plan";
import { MealSelect } from "./meal-select";

export type DayPlanEditorProps = {
  weekStartDate: IsoDate;
  dayPlan: DayPlan;
  timing: DayTiming;
  meals: readonly Meal[];
  choiceCounts: Readonly<Record<LunchChoice, number>>;
};

const CLOSED_NOTE_PLACEHOLDER = "Nevaří se";

export function DayPlanEditor({ weekStartDate, dayPlan, timing, meals, choiceCounts }: DayPlanEditorProps) {
  const idPrefix = useId();
  const isClosed = dayPlan.closedNote !== null;

  function patch(changes: Parameters<typeof updateDayPlan>[2]) {
    updateDayPlan(weekStartDate, dayPlan.date, changes);
  }

  const closedToggle = (
    <label className="checkbox-inline">
      <input
        type="checkbox"
        checked={isClosed}
        onChange={(event) => patch({ closedNote: event.target.checked ? CLOSED_NOTE_PLACEHOLDER : null })}
      />
      Nevaří se
    </label>
  );

  if (isClosed) {
    return (
      <DayCard date={dayPlan.date} timing={timing} closedNote={null} headerContent={closedToggle}>
        <Field label="Důvod" htmlFor={`${idPrefix}-closed-note`}>
          <Input
            id={`${idPrefix}-closed-note`}
            value={dayPlan.closedNote ?? ""}
            onChange={(event) => patch({ closedNote: event.target.value })}
          />
        </Field>
      </DayCard>
    );
  }

  return (
    <DayCard
      date={dayPlan.date}
      timing={timing}
      closedNote={null}
      headerContent={
        <>
          <span className="choice-counts" aria-label="Výběr strávníků">
            {LUNCH_CHOICE_LABELS.PRIMARY} ×{choiceCounts.PRIMARY} · {LUNCH_CHOICE_LABELS.ALTERNATIVE} ×
            {choiceCounts.ALTERNATIVE}
          </span>
          {closedToggle}
        </>
      }
    >
      <div className="day-editor-grid">
        <Field label="Polévka" htmlFor={`${idPrefix}-soup`}>
          <MealSelect
            id={`${idPrefix}-soup`}
            meals={meals}
            course="SOUP"
            value={dayPlan.soupMealId}
            onChange={(soupMealId) => patch({ soupMealId })}
          />
        </Field>
        <Field label="Doplněk a nápoj" htmlFor={`${idPrefix}-supplement`}>
          <Input
            id={`${idPrefix}-supplement`}
            value={dayPlan.supplement}
            onChange={(event) => patch({ supplement: event.target.value })}
          />
        </Field>
      </div>

      <div className="day-editor-options">
        <div className="day-editor-option">
          <Field label={LUNCH_CHOICE_LABELS.PRIMARY} htmlFor={`${idPrefix}-primary`}>
            <MealSelect
              id={`${idPrefix}-primary`}
              meals={meals}
              course="MAIN"
              value={dayPlan.primaryMealId}
              onChange={(primaryMealId) => patch({ primaryMealId })}
            />
          </Field>
          <MealSummary meal={findMealById(meals, dayPlan.primaryMealId)} />
        </div>

        <Button
          variant="ghost"
          size="small"
          className="day-editor-swap"
          onClick={() => swapDayOptions(weekStartDate, dayPlan)}
          aria-label="Prohodit Oběd 1 a Oběd 2"
          title="Prohodit Oběd 1 a Oběd 2"
        >
          <ArrowLeftRight size={18} />
        </Button>

        <div className="day-editor-option">
          <Field label={LUNCH_CHOICE_LABELS.ALTERNATIVE} htmlFor={`${idPrefix}-alternative`}>
            <MealSelect
              id={`${idPrefix}-alternative`}
              meals={meals}
              course="MAIN"
              value={dayPlan.alternativeMealId}
              onChange={(alternativeMealId) => patch({ alternativeMealId })}
            />
          </Field>
          <MealSummary meal={findMealById(meals, dayPlan.alternativeMealId)} />
        </div>
      </div>
    </DayCard>
  );
}
