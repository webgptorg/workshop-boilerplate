import type { AllergenCode } from "@/model/types";

export const ALLERGEN_NAMES: Readonly<Record<AllergenCode, string>> = {
  1: "Lepek",
  2: "Korýši",
  3: "Vejce",
  4: "Ryby",
  5: "Arašídy",
  6: "Sója",
  7: "Mléko",
  8: "Skořápkové plody",
  9: "Celer",
  10: "Hořčice",
  11: "Sezam",
  12: "Oxid siřičitý",
  13: "Vlčí bob",
  14: "Měkkýši",
};

export const ALL_ALLERGEN_CODES = Object.keys(ALLERGEN_NAMES).map(
  (code) => Number(code) as AllergenCode,
);
