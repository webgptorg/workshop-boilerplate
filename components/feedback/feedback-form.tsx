"use client";

import { useId, useState, type FormEvent } from "react";
import { Button, Textarea } from "@/components/ui";
import type { MealFeedback, MealRating } from "@/lib/feedback";
import { RatingPicker } from "./rating-picker";

export type FeedbackFormProps = {
  existingFeedback: MealFeedback | null;
  onSave: (rating: MealRating, comment: string) => void;
  onCancel: () => void;
};

export function FeedbackForm({ existingFeedback, onSave, onCancel }: FeedbackFormProps) {
  const commentId = useId();
  const [rating, setRating] = useState<MealRating | null>(existingFeedback?.rating ?? null);
  const [comment, setComment] = useState(existingFeedback?.comment ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (rating === null) {
      return;
    }

    onSave(rating, comment);
  }

  return (
    <form className="feedback-form" onSubmit={handleSubmit}>
      <RatingPicker value={rating} onChange={setRating} />
      <label className="field-label" htmlFor={commentId}>
        Komentář pro jídelnu (nepovinné)
      </label>
      <Textarea
        id={commentId}
        rows={2}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Co bylo dobře, co by šlo jinak…"
      />
      <div className="feedback-form-actions">
        <Button type="submit" size="small" disabled={rating === null}>
          Uložit hodnocení
        </Button>
        <Button variant="ghost" size="small" onClick={onCancel}>
          Zrušit
        </Button>
      </div>
    </form>
  );
}
