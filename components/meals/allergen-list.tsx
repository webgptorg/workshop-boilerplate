import { getAllergenName, type AllergenCode } from "@/lib/meals";

export type AllergenListProps = {
  codes: readonly AllergenCode[];
};

/**
 * Allergen numbers the way canteens print them; the full name is in the tooltip.
 */
export function AllergenList({ codes }: AllergenListProps) {
  if (codes.length === 0) {
    return <span className="allergen-list allergen-list-empty">bez evidovaných alergenů</span>;
  }

  return (
    <span className="allergen-list" aria-label="Alergeny">
      <span className="allergen-list-label">Alergeny</span>
      {codes.map((code) => (
        <abbr key={code} className="allergen" title={getAllergenName(code)}>
          {code}
        </abbr>
      ))}
    </span>
  );
}
