/**
 * The 14 allergens that must be declared on menus (EU regulation 1169/2011),
 * numbered the way Czech school canteens print them next to each dish.
 */
export const ALLERGENS = [
  { code: 1, name: "Obiloviny obsahující lepek" },
  { code: 2, name: "Korýši" },
  { code: 3, name: "Vejce" },
  { code: 4, name: "Ryby" },
  { code: 5, name: "Arašídy" },
  { code: 6, name: "Sójové boby" },
  { code: 7, name: "Mléko" },
  { code: 8, name: "Skořápkové plody" },
  { code: 9, name: "Celer" },
  { code: 10, name: "Hořčice" },
  { code: 11, name: "Sezamová semena" },
  { code: 12, name: "Oxid siřičitý a siřičitany" },
  { code: 13, name: "Vlčí bob (lupina)" },
  { code: 14, name: "Měkkýši" },
] as const;

export type AllergenCode = (typeof ALLERGENS)[number]["code"];

export function getAllergenName(code: AllergenCode): string {
  return ALLERGENS.find((allergen) => allergen.code === code)?.name ?? `Alergen ${code}`;
}

export function isAllergenCode(value: number): value is AllergenCode {
  return ALLERGENS.some((allergen) => allergen.code === value);
}
