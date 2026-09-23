"use client";

import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";
import { useStoreValue } from "@/hooks/use-store-value";
import type { IsoDate } from "@/lib/dates";
import { feedbackStore, findFeedback, getMealRatingLabel, saveFeedback, type MealRating } from "@/lib/feedback";
import { FeedbackForm } from "./feedback-form";
import { RatingIcon } from "./rating-picker";

export type MealFeedbackControlProps = {
  authorUserId: string;
  mealId: string;
  date: IsoDate;
};

/**
 * Shows the author's feedback on a meal, or lets them write it.
 */
export function MealFeedbackControl({ authorUserId, mealId, date }: MealFeedbackControlProps) {
  const feedbackList = useStoreValue(feedbackStore);
  const existingFeedback = findFeedback(feedbackList, authorUserId, mealId, date);
  const [isEditing, setIsEditing] = useState(false);

  function handleSave(rating: MealRating, comment: string) {
    saveFeedback({ authorUserId, mealId, date, rating, comment });
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <FeedbackForm existingFeedback={existingFeedback} onSave={handleSave} onCancel={() => setIsEditing(false)} />
    );
  }

  if (existingFeedback === null) {
    return (
      <Button variant="secondary" size="small" onClick={() => setIsEditing(true)}>
        <MessageSquare size={16} />
        Ohodnotit
      </Button>
    );
  }

  return (
    <div className="feedback-summary">
      <span className={`feedback-rating feedback-rating-${existingFeedback.rating.toLowerCase()}`}>
        <RatingIcon rating={existingFeedback.rating} />
        {getMealRatingLabel(existingFeedback.rating)}
      </span>
      {existingFeedback.comment ? <q className="feedback-comment">{existingFeedback.comment}</q> : null}
      <Button variant="ghost" size="small" onClick={() => setIsEditing(true)}>
        Upravit
      </Button>
    </div>
  );
}
