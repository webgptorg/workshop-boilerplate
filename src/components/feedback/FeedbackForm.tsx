"use client";

import { useState, type FormEvent } from "react";
import { Button, Field } from "@/components/ui";
import { useAppData } from "@/hooks/AppDataProvider";
import type { IsoDate, Meal, MealRating, UserRole } from "@/model/types";
import { RatingFaces } from "./RatingFaces";

interface FeedbackFormProps {
  readonly meal: Meal;
  readonly date: IsoDate;
  readonly authorId: string;
  readonly authorRole: UserRole;
  readonly onDone: () => void;
}

export function FeedbackForm({ meal, date, authorId, authorRole, onDone }: FeedbackFormProps) {
  const { feedback } = useAppData();
  const [rating, setRating] = useState<MealRating | null>(null);
  const [comment, setComment] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (rating === null) {
      return;
    }

    feedback.addFeedback({ mealId: meal.id, date, authorId, authorRole, rating, comment: comment.trim() });
    onDone();
  }

  return (
    <form className="feedback-form" onSubmit={handleSubmit}>
      <RatingFaces value={rating} onChange={setRating} />
      <Field label="Poznámka">
        <textarea
          className="input"
          rows={2}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Co bylo dobré nebo co změnit"
        />
      </Field>
      <div className="form-actions">
        <Button type="submit" disabled={rating === null}>
          Odeslat hodnocení
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Zrušit
        </Button>
      </div>
    </form>
  );
}
