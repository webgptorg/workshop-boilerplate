"use client";

import { RatingIcon } from "@/components/feedback/rating-picker";
import { RoleBadge } from "@/components/layout/role-badge";
import { useStoreValue } from "@/hooks/use-store-value";
import { formatDateTime, formatShortDate } from "@/lib/dates";
import {
  MEAL_RATING_LIST,
  feedbackStore,
  getMealRatingLabel,
  listFeedbackNewestFirst,
  summarizeFeedbackByMeal,
} from "@/lib/feedback";
import { findMealById, mealCatalogStore } from "@/lib/meals";
import { findUserById } from "@/lib/users";

/**
 * What pupils and parents said about the meals, per meal and as a timeline.
 */
export function FeedbackOverview() {
  const feedbackList = useStoreValue(feedbackStore);
  const meals = useStoreValue(mealCatalogStore);

  if (feedbackList.length === 0) {
    return <p className="empty-state">Zatím nikdo nic nehodnotil.</p>;
  }

  const summaries = summarizeFeedbackByMeal(feedbackList);

  return (
    <section className="feedback-overview" aria-label="Zpětná vazba">
      <h2 className="section-heading">Podle jídel</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Jídlo</th>
            {MEAL_RATING_LIST.map((rating) => (
              <th key={rating} scope="col" className="data-table-number">
                {getMealRatingLabel(rating)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {summaries.map((summary) => (
            <tr key={summary.mealId}>
              <th scope="row">{findMealById(meals, summary.mealId)?.name ?? "Jídlo už není v katalogu"}</th>
              {MEAL_RATING_LIST.map((rating) => (
                <td key={rating} className="data-table-number">
                  {summary.counts[rating]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="section-heading">Jednotlivá hodnocení</h2>
      <ul className="feedback-timeline">
        {listFeedbackNewestFirst(feedbackList).map((feedback) => {
          const author = findUserById(feedback.authorUserId);
          const meal = findMealById(meals, feedback.mealId);

          return (
            <li key={feedback.id} className="feedback-entry">
              <span className={`feedback-rating feedback-rating-${feedback.rating.toLowerCase()}`}>
                <RatingIcon rating={feedback.rating} />
                {getMealRatingLabel(feedback.rating)}
              </span>
              <span className="feedback-entry-meal">
                {meal?.name ?? "Jídlo už není v katalogu"} · {formatShortDate(feedback.date)}
              </span>
              {feedback.comment ? <q className="feedback-comment">{feedback.comment}</q> : null}
              <span className="feedback-entry-author">
                {author ? <RoleBadge role={author.role} /> : null}
                {author?.displayName ?? "Neznámý uživatel"} · {formatDateTime(feedback.createdAt)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
