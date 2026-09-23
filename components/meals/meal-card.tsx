import { Check, Pencil, Star } from "lucide-react";
import type { Meal } from "@/lib/meal-model";

interface MealCardProps {
  meal: Meal;
  index: number;
  isSelected: boolean;
  isStaff: boolean;
  isReady: boolean;
  onSelect: () => void;
  onDetail: () => void;
  onFeedback: () => void;
  onEdit: () => void;
}
export function MealCard({
  meal,
  index,
  isSelected,
  isStaff,
  isReady,
  onSelect,
  onDetail,
  onFeedback,
  onEdit,
}: MealCardProps) {
  return (
    <article className={`meal-card ${isSelected ? "is-selected" : ""}`}>
      <div className={`meal-icon meal-icon-${index}`} aria-hidden="true">
        {meal.icon}
      </div>
      <div className="meal-content">
        <div className="meal-type">
          {index === 0 ? "HLAVNÍ JÍDLO" : "ALTERNATIVA"}
          {isSelected && (
            <span className="chosen-label">
              <Check size={12} /> Vybráno
            </span>
          )}
        </div>
        <button className="meal-name" onClick={onDetail}>
          {meal.name}
        </button>
        <p>{meal.side}</p>
        <div className="meal-actions">
          <button className="allergens" onClick={onDetail}>
            Alergeny: {meal.allergens}
          </button>
          <button
            className="rating-button"
            onClick={isStaff ? onEdit : onFeedback}
            aria-label={`${isStaff ? "Upravit" : "Ohodnotit"} ${meal.name}`}
          >
            {isStaff ? <Pencil size={14} /> : <Star size={14} />}
          </button>
        </div>
      </div>
      {!isStaff && (
        <button
          className={`select-meal ${isSelected ? "selected" : ""}`}
          disabled={!isReady}
          onClick={onSelect}
          aria-pressed={isSelected}
          aria-label={`${isSelected ? "Zrušit výběr" : "Vybrat"}: ${meal.name}`}
        >
          {isSelected ? <Check size={16} /> : <span />}
        </button>
      )}
    </article>
  );
}
