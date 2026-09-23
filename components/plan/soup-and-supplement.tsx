import { AllergenList } from "@/components/meals/allergen-list";
import { MealIcon } from "@/components/meals/meal-icon";
import type { Meal } from "@/lib/meals";

export type SoupAndSupplementProps = {
  soup: Meal | null;
  supplement: string;
};

/**
 * The part of the lunch both options share.
 */
export function SoupAndSupplement({ soup, supplement }: SoupAndSupplementProps) {
  return (
    <dl className="shared-courses">
      <div className="shared-course">
        <dt>
          <MealIcon name="SOUP" size={18} />
          Polévka
        </dt>
        <dd>
          {soup === null ? (
            <span className="meal-summary-missing">Polévka zatím nedoplněna</span>
          ) : (
            <>
              <span>{soup.name}</span> <AllergenList codes={soup.allergenCodes} />
            </>
          )}
        </dd>
      </div>
      <div className="shared-course">
        <dt>Doplněk</dt>
        <dd>{supplement}</dd>
      </div>
    </dl>
  );
}
