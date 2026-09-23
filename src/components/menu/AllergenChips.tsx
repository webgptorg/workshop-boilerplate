import { ALLERGEN_NAMES } from "@/data/allergens";
import type { AllergenCode } from "@/model/types";

interface AllergenChipsProps {
  readonly allergens: readonly AllergenCode[];
}

export function AllergenChips({ allergens }: AllergenChipsProps) {
  if (allergens.length === 0) {
    return null;
  }

  return (
    <ul className="allergen-chips" aria-label="Alergeny">
      {allergens.map((allergen) => (
        <li key={allergen} className="allergen-chip" title={ALLERGEN_NAMES[allergen]}>
          {allergen}
        </li>
      ))}
    </ul>
  );
}
