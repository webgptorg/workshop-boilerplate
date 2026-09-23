import type { Meal } from "./types";
export type Proposal = { meal: Meal; reason: string; isMatch: boolean };
export function proposeMeal(text: string, meals: Meal[]): Proposal {
  const NORMALIZED = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const PATTERNS: [RegExp, string][] = [
    [/spaget|testovin|carbonar|bolo[nň]/, "pasta"],
    [/ryb|losos|file/, "fish"],
    [/kure|kari/, "chicken"],
    [/cock|lustenin/, "lentils"],
    [/rizot|ryz/, "rice"],
    [/kapust|placick/, "greens"],
    [/kuskus|tunak/, "salad"],
    [/sladk|mak|dukat/, "sweet"],
    [/rajsk|kulick/, "meatballs"],
    [/zampion|houb/, "mushroom"],
  ];
  const MATCH = PATTERNS.find(([pattern]) => pattern.test(NORMALIZED));
  const MEAL =
    meals.find((meal) => meal.icon === MATCH?.[1]) ||
    meals.find((meal) => meal.icon === "pasta") ||
    meals[0];
  return {
    meal: MEAL,
    isMatch: Boolean(MATCH),
    reason: MATCH
      ? `Námětu odpovídá jídlo „${MEAL.name}“ ze startovního katalogu. Použijeme jeho uvedené suroviny; gramáže a proveditelnost musí ověřit jídelna.`
      : `Pro tento námět nemáme recepturu. Jako dostupnou alternativu navrhujeme „${MEAL.name}“. Před zařazením můžete návrh upravit.`,
  };
}
