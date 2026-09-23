import type { FoodGroup } from "@/model/types";

export interface FoodGroupNorm {
  readonly group: FoodGroup;
  readonly label: string;
  /** Grams per diner and day for lunch, age group 7–10 years */
  readonly gramsPerDay: number;
  /** Lower bound of the tolerance as a fraction of the norm */
  readonly minimumRatio: number;
  /** Upper bound of the tolerance as a fraction of the norm, `null` = not set */
  readonly maximumRatio: number | null;
}

/**
 * Appendix 1 of the regulation 107/2005 Sb. (version valid from 1. 9. 2025),
 * table 1 (lunch, diners 7–10 years) and table 3 (tolerance).
 */
export const LUNCH_BASKET_NORMS_7_10: readonly FoodGroupNorm[] = [
  { group: "meat", label: "Maso", gramsPerDay: 46, minimumRatio: 0.75, maximumRatio: 1.25 },
  { group: "fish", label: "Ryby", gramsPerDay: 11, minimumRatio: 0.75, maximumRatio: null },
  { group: "dairy", label: "Mléko a mléčné výrobky", gramsPerDay: 78, minimumRatio: 0.75, maximumRatio: 1.25 },
  { group: "fats", label: "Tuky volné", gramsPerDay: 12, minimumRatio: 0.75, maximumRatio: 1 },
  { group: "sugars", label: "Cukry volné", gramsPerDay: 10, minimumRatio: 0, maximumRatio: 1 },
  { group: "vegetablesAndFruit", label: "Zelenina a ovoce", gramsPerDay: 162, minimumRatio: 0.75, maximumRatio: null },
  { group: "potatoes", label: "Brambory", gramsPerDay: 92, minimumRatio: 0.75, maximumRatio: 1.25 },
  { group: "wholegrains", label: "Celozrnné obiloviny", gramsPerDay: 17, minimumRatio: 0.75, maximumRatio: null },
  { group: "legumes", label: "Luštěniny", gramsPerDay: 11, minimumRatio: 0.75, maximumRatio: null },
];

/**
 * Appendix 2 of the regulation 107/2005 Sb.: financial limit for lunch,
 * diners 7–10 years, CZK per diner and day.
 */
export const LUNCH_COST_LIMIT_CZK_7_10 = { minimum: 20, maximum: 47 } as const;

export const BASKET_RULES_VERSION = "Vyhláška 107/2005 Sb., znění od 1. 9. 2025";
