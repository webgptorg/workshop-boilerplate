"use client";

import { FeedbackList } from "@/components/feedback/FeedbackList";
import { MealIcon } from "@/components/menu/MealIcon";
import { Card, EmptyState } from "@/components/ui";
import { useAppData } from "@/hooks/AppDataProvider";
import { summarizeFeedbackByMeal } from "@/planning/feedbackSummary";

export function FeedbackOverview() {
  const { feedback, mealCatalog } = useAppData();
  const summaries = summarizeFeedbackByMeal(feedback.feedback, mealCatalog.findMeal);

  if (summaries.length === 0) {
    return (
      <Card>
        <EmptyState text="Zatím žádné hodnocení." />
      </Card>
    );
  }

  return (
    <div className="feedback-overview">
      {summaries.map((summary) => (
        <Card key={summary.meal.id} className="feedback-meal">
          <header className="feedback-meal-header">
            <MealIcon icon={summary.meal.icon} />
            <div>
              <h2 className="meal-name">{summary.meal.name}</h2>
              <p className="feedback-meta">
                Průměr {summary.averageRating.toFixed(1)} ze 3 · hodnocení: {summary.items.length}
              </p>
            </div>
          </header>
          <FeedbackList items={summary.items} />
        </Card>
      ))}
    </div>
  );
}
