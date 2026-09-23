import type { BasketGroupId, BasketRuleSet, BasketTarget } from "./types";

const GROUP_LABELS: Record<BasketGroupId, string> = {
  meat: "Maso",
  fish: "Ryby, korýši, měkkýši",
  dairy: "Mléko a mléčné výrobky",
  freeFat: "Tuky volné",
  freeSugar: "Cukry volné",
  produce: "Zelenina a ovoce",
  potato: "Brambory a ostatní hlízy",
  wholeGrain: "Celozrnné obiloviny a pseudoobiloviny",
  legume: "Luštěniny",
  egg: "Vejce",
};

const LEGACY_TARGETS: Record<string, Record<string, number>> = {
  "3-6": { meat: 55, fish: 10, dairy: 331, freeFat: 17, freeSugar: 20, produce: 220, potato: 90, legume: 10 },
  "7-10": { meat: 64, fish: 10, dairy: 74, freeFat: 12, freeSugar: 13, produce: 150, potato: 140, legume: 10 },
  "11-14": { meat: 70, fish: 10, dairy: 87, freeFat: 15, freeSugar: 16, produce: 170, potato: 160, legume: 10 },
  "15+": { meat: 75, fish: 10, dairy: 109, freeFat: 17, freeSugar: 16, produce: 190, potato: 170, legume: 10 },
};

const REGULAR_TARGETS: Record<string, Record<string, number>> = {
  "2-3-lunch": { meat: 26, fish: 6, dairy: 44, freeFat: 7, freeSugar: 6, produce: 94, potato: 53, wholeGrain: 11, legume: 7 },
  "4-6-lunch": { meat: 39, fish: 9, dairy: 67, freeFat: 10, freeSugar: 8, produce: 140, potato: 79, wholeGrain: 14, legume: 9 },
  "7-10-lunch": { meat: 46, fish: 11, dairy: 78, freeFat: 12, freeSugar: 10, produce: 162, potato: 92, wholeGrain: 17, legume: 11 },
  "11-14-lunch": { meat: 52, fish: 13, dairy: 89, freeFat: 13, freeSugar: 11, produce: 187, potato: 106, wholeGrain: 20, legume: 13 },
  "15+-lunch": { meat: 65, fish: 16, dairy: 111, freeFat: 17, freeSugar: 14, produce: 233, potato: 132, wholeGrain: 25, legume: 15 },
};

const FLEXIBLE_TARGETS: Record<string, Record<string, number>> = {
  "2-3-lunch": { meat: 9, fish: 20, legume: 20, dairy: 30, freeFat: 7, freeSugar: 6, produce: 94, potato: 22, wholeGrain: 10 },
  "4-6-lunch": { meat: 13, fish: 30, legume: 30, dairy: 45, freeFat: 10, freeSugar: 8, produce: 140, potato: 33, wholeGrain: 15 },
  "7-10-lunch": { meat: 15, fish: 35, legume: 35, dairy: 53, freeFat: 12, freeSugar: 10, produce: 162, potato: 39, wholeGrain: 18 },
  "11-14-lunch": { meat: 18, fish: 40, legume: 40, dairy: 60, freeFat: 13, freeSugar: 11, produce: 187, potato: 45, wholeGrain: 20 },
  "15+-lunch": { meat: 23, fish: 50, legume: 50, dairy: 75, freeFat: 17, freeSugar: 14, produce: 233, potato: 55, wholeGrain: 25 },
};

function targetsFor(values: Record<string, number>, page: number, isLegacy: boolean, isFlexible: boolean): Partial<Record<BasketGroupId, BasketTarget>> {
  return Object.fromEntries(Object.entries(GROUP_LABELS).map(([groupId]) => {
    const value = values[groupId];
    const minimumPercent = groupId === "freeSugar" ? 0 : isFlexible && ["meat", "fish"].includes(groupId) ? 0 : isLegacy ? 75 : 75;
    const maximumPercent = ["freeFat", "freeSugar"].includes(groupId) ? 100 : ["fish", "produce", "legume", "wholeGrain"].includes(groupId) ? null : 125;
    return [groupId, {
      amountGramsPerDinerDay: value ?? null,
      minimumPercent: value === undefined ? null : minimumPercent,
      maximumPercent: value === undefined ? null : maximumPercent,
      sourcePage: value === undefined ? null : page,
    } satisfies BasketTarget];
  })) as Partial<Record<BasketGroupId, BasketTarget>>;
}

const LEGACY_INGREDIENTS: BasketRuleSet["ingredientMappings"] = {
  meat: { groupId: "meat", coefficient: 1, sourcePage: 7 },
  fish: { groupId: "fish", coefficient: 1, sourcePage: 7 },
  "liquid-milk": { groupId: "dairy", coefficient: 1, sourcePage: 7 },
  "milk-powder": { groupId: "dairy", coefficient: 10, sourcePage: 7 },
  butter: { groupId: "freeFat", coefficient: 0.8, sourcePage: 7 },
  oil: { groupId: "freeFat", coefficient: 1, sourcePage: 7 },
  sugar: { groupId: "freeSugar", coefficient: 1, sourcePage: 7 },
  honey: { groupId: "freeSugar", coefficient: 0.8, sourcePage: 7 },
  vegetables: { groupId: "produce", coefficient: 1.42, sourcePage: 7 },
  fruit: { groupId: "produce", coefficient: 1, sourcePage: 7 },
  "sterilized-vegetables": { groupId: "produce", coefficient: 1.42, sourcePage: 7 },
  "dried-vegetables": { groupId: "produce", coefficient: 10, sourcePage: 7 },
  potatoes: { groupId: "potato", coefficient: 1, sourcePage: 7 },
  legumes: { groupId: "legume", coefficient: 1, sourcePage: 7 },
};

const CLEAN_INGREDIENTS: BasketRuleSet["ingredientMappings"] = {
  meat: { groupId: "meat", coefficient: 1, sourcePage: 11 },
  fish: { groupId: "fish", coefficient: 1, sourcePage: 11 },
  "liquid-milk": { groupId: "dairy", coefficient: 1, sourcePage: 11 },
  "milk-powder": { groupId: "dairy", coefficient: 10, sourcePage: 11 },
  butter: { groupId: "freeFat", coefficient: 0.8, sourcePage: 12 },
  oil: { groupId: "freeFat", coefficient: 1, sourcePage: 12 },
  "frying-oil": { groupId: "freeFat", coefficient: 0.15, sourcePage: 12 },
  sugar: { groupId: "freeSugar", coefficient: 1, sourcePage: 12 },
  honey: { groupId: "freeSugar", coefficient: 0.8, sourcePage: 12 },
  vegetables: { groupId: "produce", coefficient: 1, sourcePage: 13 },
  fruit: { groupId: "produce", coefficient: 1, sourcePage: 13 },
  "sterilized-vegetables": { groupId: "produce", coefficient: 1, sourcePage: 13 },
  potatoes: { groupId: "potato", coefficient: 1, sourcePage: 14 },
  "whole-grain": { groupId: "wholeGrain", coefficient: 1, sourcePage: 14 },
  legumes: { groupId: "legume", coefficient: 1, sourcePage: 15 },
  "canned-legumes": { groupId: "legume", coefficient: 0.4, sourcePage: 15 },
  tofu: { groupId: "legume", coefficient: 0.3, sourcePage: 15 },
};

function buildTargets(targets: Record<string, Record<string, number>>, page: number, isLegacy: boolean, isFlexible: boolean) {
  return Object.fromEntries(Object.entries(targets).map(([age, values]) => [age, targetsFor(values, page, isLegacy, isFlexible)]));
}

export const BASKET_RULE_SETS: BasketRuleSet[] = [
  {
    id: "decree-2021",
    name: "Vyhláška 107/2005 Sb. · příloha 1 (2021)",
    validFrom: "2021-09-01", validTo: "2026-08-31",
    sourceDocument: "docs/vyhlaska_starsi_verze_k_diff_pravidel_107-2005-1.9.2021.pdf",
    measureBasis: "purchased", ageCategoryTargets: buildTargets(Object.fromEntries(Object.entries(LEGACY_TARGETS).map(([age, targets]) => [age, { ...targets, ...(targets.dairy ? { dairy: targets.dairy } : {}) }])), 6, true, false),
    groupLabels: GROUP_LABELS, ingredientMappings: LEGACY_INGREDIENTS,
  },
  {
    id: "decree-2025-regular",
    name: "Vyhláška 107/2005 Sb. · běžná výživa (2025)",
    validFrom: "2025-09-01", validTo: null,
    sourceDocument: "docs/vyhlaska_107-2005-1.9.2025.pdf",
    measureBasis: "clean", ageCategoryTargets: buildTargets(REGULAR_TARGETS, 9, false, false),
    groupLabels: GROUP_LABELS, ingredientMappings: CLEAN_INGREDIENTS,
  },
  {
    id: "decree-2025-flexible",
    name: "Vyhláška 107/2005 Sb. · flexibilní výživové normy (2025)",
    validFrom: "2025-09-01", validTo: null,
    sourceDocument: "docs/vyhlaska_107-2005-1.9.2025.pdf",
    measureBasis: "clean", ageCategoryTargets: buildTargets(FLEXIBLE_TARGETS, 22, false, true),
    groupLabels: GROUP_LABELS, ingredientMappings: CLEAN_INGREDIENTS,
  },
];

export function getDefaultRuleSet(menuDate: string) {
  return BASKET_RULE_SETS.filter((ruleSet) => ruleSet.id !== "decree-2025-flexible")
    .find((ruleSet) => ruleSet.validFrom <= menuDate && (ruleSet.validTo === null || ruleSet.validTo >= menuDate))
    ?? BASKET_RULE_SETS[0];
}
