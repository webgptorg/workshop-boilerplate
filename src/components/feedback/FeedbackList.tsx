import { ROLE_DEFINITIONS } from "@/auth/roles";
import { EmptyState } from "@/components/ui";
import type { MealFeedback } from "@/model/types";
import { formatDateTime } from "@/planning/calendar";
import { RATING_OPTIONS } from "./RatingFaces";

interface FeedbackListProps {
  readonly items: readonly MealFeedback[];
}

function findFace(rating: MealFeedback["rating"]): string {
  return RATING_OPTIONS.find((option) => option.rating === rating)?.face ?? "";
}

export function FeedbackList({ items }: FeedbackListProps) {
  if (items.length === 0) {
    return <EmptyState text="Zatím žádné hodnocení." />;
  }

  return (
    <ul className="feedback-list">
      {items.map((item) => (
        <li key={item.id} className="feedback-item">
          <span className="feedback-face" aria-hidden="true">
            {findFace(item.rating)}
          </span>
          <div>
            <p className="feedback-comment">{item.comment || "Bez poznámky"}</p>
            <p className="feedback-meta">
              {ROLE_DEFINITIONS[item.authorRole].label} · {formatDateTime(item.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
