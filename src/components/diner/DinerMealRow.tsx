"use client";

import { useState } from "react";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { MealRow } from "@/components/menu/MealRow";
import { Button, Notice } from "@/components/ui";
import { useAppData } from "@/hooks/AppDataProvider";
import type { IsoDate, Meal, MealSlot, UserRole } from "@/model/types";
import { evaluateMealSuitability } from "@/planning/mealSuitability";

interface DinerMealRowProps {
  readonly meal: Meal;
  readonly slot: MealSlot;
  readonly date: IsoDate;
  readonly pupilId: string;
  readonly authorId: string;
  readonly authorRole: UserRole;
}

/**
 * Meal of the day with the choice button and the feedback of the diner.
 */
export function DinerMealRow({ meal, slot, date, pupilId, authorId, authorRole }: DinerMealRowProps) {
  const { mealChoices, preferences, feedback } = useAppData();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const isSelected = mealChoices.getChoice(pupilId, date) === slot;
  const suitability = evaluateMealSuitability(meal, preferences.getPreferences(pupilId));
  const isAlreadyRated = feedback.feedback.some(
    (item) => item.mealId === meal.id && item.date === date && item.authorId === authorId,
  );

  return (
    <div className="diner-meal">
      <MealRow meal={meal} slot={slot} isSelected={isSelected} unsuitableReasons={suitability.reasons}>
        <Button
          variant={isSelected ? "primary" : "secondary"}
          size="small"
          onClick={() => mealChoices.setChoice(pupilId, date, slot)}
          aria-pressed={isSelected}
        >
          {isSelected ? "Vybráno" : "Vybrat"}
        </Button>
        {!isAlreadyRated && !isFeedbackOpen && (
          <Button variant="ghost" size="small" onClick={() => setIsFeedbackOpen(true)}>
            Ohodnotit
          </Button>
        )}
      </MealRow>
      {isAlreadyRated && <Notice tone="success">Hodnocení odesláno.</Notice>}
      {isFeedbackOpen && (
        <FeedbackForm
          meal={meal}
          date={date}
          authorId={authorId}
          authorRole={authorRole}
          onDone={() => setIsFeedbackOpen(false)}
        />
      )}
    </div>
  );
}
