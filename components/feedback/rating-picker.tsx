import { Frown, Meh, Smile, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { MEAL_RATING_LIST, getMealRatingLabel, type MealRating } from "@/lib/feedback";

const RATING_ICONS: Readonly<Record<MealRating, LucideIcon>> = {
  LIKED: Smile,
  NEUTRAL: Meh,
  DISLIKED: Frown,
};

export function RatingIcon({ rating, size = 20 }: { rating: MealRating; size?: number }) {
  const IconComponent = RATING_ICONS[rating];
  return <IconComponent size={size} aria-hidden="true" />;
}

export type RatingPickerProps = {
  value: MealRating | null;
  onChange: (rating: MealRating) => void;
};

/**
 * Three-step scale that works for a pupil as well as for a parent.
 */
export function RatingPicker({ value, onChange }: RatingPickerProps) {
  return (
    <div className="rating-picker" role="radiogroup" aria-label="Hodnocení">
      {MEAL_RATING_LIST.map((rating) => (
        <button
          key={rating}
          type="button"
          role="radio"
          aria-checked={value === rating}
          className={cn("rating-option", `rating-option-${rating.toLowerCase()}`, value === rating && "is-selected")}
          onClick={() => onChange(rating)}
        >
          <RatingIcon rating={rating} size={22} />
          <span>{getMealRatingLabel(rating)}</span>
        </button>
      ))}
    </div>
  );
}
