import { ALLERGENS, type AllergenCode } from "@/lib/meals";

export type AllergenChecklistProps = {
  selectedCodes: readonly AllergenCode[];
  onChange: (selectedCodes: AllergenCode[]) => void;
  /**
   * Keeps input ids unique when several checklists are on one page.
   */
  idPrefix: string;
};

export function AllergenChecklist({ selectedCodes, onChange, idPrefix }: AllergenChecklistProps) {
  function toggle(code: AllergenCode, isChecked: boolean) {
    const nextCodes = isChecked
      ? [...selectedCodes, code].sort((codeA, codeB) => codeA - codeB)
      : selectedCodes.filter((selectedCode) => selectedCode !== code);

    onChange(nextCodes);
  }

  return (
    <ul className="checklist checklist-allergens">
      {ALLERGENS.map((allergen) => {
        const inputId = `${idPrefix}-allergen-${allergen.code}`;

        return (
          <li key={allergen.code}>
            <input
              id={inputId}
              type="checkbox"
              checked={selectedCodes.includes(allergen.code)}
              onChange={(event) => toggle(allergen.code, event.target.checked)}
            />
            <label htmlFor={inputId}>
              <span className="allergen">{allergen.code}</span> {allergen.name}
            </label>
          </li>
        );
      })}
    </ul>
  );
}
