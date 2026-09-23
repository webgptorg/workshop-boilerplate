import { Check, Leaf, Pencil, Star } from "lucide-react";
import type { Meal } from "@/lib/types";
import { MealIcon } from "./meal-icon";
export function MealCard({
  meal,
  isSelected,
  isStaff,
  isPending,
  onSelect,
  onDetail,
}: {
  meal: Meal;
  isSelected: boolean;
  isStaff: boolean;
  isPending: boolean;
  onSelect: () => void;
  onDetail: () => void;
}) {
  return (
    <article className={`meal-card ${isSelected ? "selected" : ""}`}>
      <div className="meal-top">
        <span className="meal-slot">
          {meal.slot === 1 ? "Hlavní jídlo" : "Alternativa"}
        </span>
        {isSelected && (
          <span className="selected-label">
            <Check size={12} /> Vybráno
          </span>
        )}
      </div>
      <button
        className="meal-detail"
        onClick={onDetail}
        aria-label={`Podrobnosti: ${meal.name}`}
      >
        <MealIcon kind={meal.icon} />
        <h3>{meal.name}</h3>
        <p>{meal.side}</p>
      </button>
      <div className="meal-tags">
        <span>
          {meal.category === "Bez masa" && <Leaf size={11} />} {meal.category}
        </span>
        <span title="Alergeny hlavního jídla">A: {meal.allergens}</span>
      </div>
      {isStaff ? (
        <button className="meal-choice" onClick={onDetail}>
          <Pencil size={14} /> Upravit jídlo
        </button>
      ) : (
        <div className="meal-actions">
          <button
            disabled={isPending}
            className="meal-choice"
            onClick={onSelect}
          >
            {isSelected ? (
              <>
                <Check size={14} /> Vybrané jídlo
              </>
            ) : (
              "Vybrat jídlo"
            )}
          </button>
          <button
            className="rating-button"
            aria-label={`Ohodnotit ${meal.name}`}
            onClick={onDetail}
          >
            <Star size={16} />
          </button>
        </div>
      )}
    </article>
  );
}
