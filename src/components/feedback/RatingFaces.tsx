import { cn } from "@/lib/cn";
import type { MealRating } from "@/model/types";

export const RATING_OPTIONS: ReadonlyArray<{ readonly rating: MealRating; readonly face: string; readonly label: string }> = [
  { rating: 3, face: "😀", label: "Chutnalo" },
  { rating: 2, face: "😐", label: "Šlo to" },
  { rating: 1, face: "🙁", label: "Nechutnalo" },
];

interface RatingFacesProps {
  readonly value: MealRating | null;
  readonly onChange: (rating: MealRating) => void;
}

export function RatingFaces({ value, onChange }: RatingFacesProps) {
  return (
    <div className="rating-faces" role="radiogroup" aria-label="Hodnocení">
      {RATING_OPTIONS.map((option) => (
        <button
          key={option.rating}
          type="button"
          role="radio"
          aria-checked={value === option.rating}
          className={cn("rating-face", value === option.rating && "is-selected")}
          onClick={() => onChange(option.rating)}
        >
          <span className="rating-face-emoji" aria-hidden="true">
            {option.face}
          </span>
          <span className="rating-face-label">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
