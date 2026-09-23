import type {
  BasketGroupId, BasketGroupResult, BasketMenuItem, BasketPeriodResult,
  BasketRuleSet, BasketTarget,
} from "./types";

export const ESTIMATE_SHARE_THRESHOLD = 0.1;
export const BASKET_START_DATE = "2026-09-01";
export const CHOICE_MENU_READINGS = ["all-offered", "selected-meals"] as const;
export type ChoiceMenuReading = (typeof CHOICE_MENU_READINGS)[number];

const GROUP_IDS: BasketGroupId[] = ["meat", "fish", "dairy", "freeFat", "freeSugar", "produce", "potato", "wholeGrain", "legume", "egg"];

function getTarget(ruleSet: BasketRuleSet, ageCategory: string, groupId: BasketGroupId): BasketTarget | null {
  return ruleSet.ageCategoryTargets[ageCategory]?.[groupId] ?? null;
}

function getBounds(target: BasketTarget | null) {
  if (!target || target.amountGramsPerDinerDay === null) return { targetGrams: null, minimumGrams: null, maximumGrams: null };
  const targetGrams = target.amountGramsPerDinerDay;
  return {
    targetGrams,
    minimumGrams: target.minimumPercent === null ? null : targetGrams * target.minimumPercent / 100,
    maximumGrams: target.maximumPercent === null ? null : targetGrams * target.maximumPercent / 100,
  };
}

function calculateGroup(
  groupId: BasketGroupId,
  items: BasketMenuItem[],
  ruleSet: BasketRuleSet,
  ageCategory: string,
  operatingDays: number,
): BasketGroupResult {
  let amountGrams = 0;
  let estimatedGrams = 0;
  let isMissingAmount = false;
  const contributingMeals = new Map<number, BasketGroupResult["contributingMeals"][number]>();

  for (const item of items) {
    if (!item.isOperatingDay || !item.recipeVersion) {
      continue;
    }
    let isGroupRecipeCovered = false;
    for (const ingredient of item.recipeVersion.ingredients) {
      const mapping = ruleSet.ingredientMappings[ingredient.ingredientId];
      if (!mapping || mapping.groupId !== groupId) continue;
      isGroupRecipeCovered = true;
      if (ingredient.amountGrams === null || mapping.coefficient === null) {
        isMissingAmount = true;
        continue;
      }
      const contribution = ingredient.amountGrams * mapping.coefficient * item.servings;
      const existing = contributingMeals.get(item.meal.id);
      amountGrams += contribution;
      if (ingredient.isEstimate) estimatedGrams += contribution;
      contributingMeals.set(item.meal.id, {
        mealId: item.meal.id,
        name: item.meal.name,
        amountGrams: (existing?.amountGrams ?? 0) + contribution,
        isEstimate: (existing?.isEstimate ?? false) || ingredient.isEstimate,
      });
    }
    if (!isGroupRecipeCovered) isMissingAmount = true;
  }

  const TARGET = getTarget(ruleSet, ageCategory, groupId);
  const BOUNDS = getBounds(TARGET);
  const normalizedAmountGrams = operatingDays > 0 ? amountGrams / operatingDays : 0;
  const normalizedEstimatedGrams = operatingDays > 0 ? estimatedGrams / operatingDays : 0;
  const estimateShare = normalizedAmountGrams === 0 ? 0 : normalizedEstimatedGrams / normalizedAmountGrams;
  const isEstimate = estimateShare > ESTIMATE_SHARE_THRESHOLD;
  let status: BasketGroupResult["status"] = "ok";
  if (!TARGET || BOUNDS.targetGrams === null || isMissingAmount || operatingDays === 0) status = "missingData";
  else if (BOUNDS.minimumGrams !== null && normalizedAmountGrams < BOUNDS.minimumGrams) status = "under";
  else if (BOUNDS.maximumGrams !== null && normalizedAmountGrams > BOUNDS.maximumGrams) status = "over";
  return {
    groupId, label: ruleSet.groupLabels[groupId], amountGrams: normalizedAmountGrams,
    ...BOUNDS, status, isEstimate, estimateShare,
    contributingMeals: [...contributingMeals.values()],
  };
}

export function calculateConsumerBasket(input: {
  items: BasketMenuItem[];
  ageCategory: string;
  ruleSet: BasketRuleSet;
  period: "week" | "month";
  operatingDayCount: number;
}): BasketPeriodResult {
  const { items, ageCategory, ruleSet, period, operatingDayCount } = input;
  return {
    ruleSetId: ruleSet.id,
    ruleSetName: ruleSet.name,
    period,
    groups: GROUP_IDS.map((groupId) => calculateGroup(groupId, items, ruleSet, ageCategory, operatingDayCount)),
  };
}

export function getBasketStatusLabel(status: BasketGroupResult["status"], isEstimate: boolean) {
  const LABELS = { ok: "v limitu", under: "pod limitem", over: "nad limitem", missingData: "chybí v pravidlech nebo receptuře" };
  return `${LABELS[status]}${isEstimate ? " · odhad" : ""}`;
}

export function getChoiceMenuItems(items: BasketMenuItem[], reading: ChoiceMenuReading): BasketMenuItem[] {
  if (reading === "all-offered") return items;
  const selected = new Map<string, BasketMenuItem>();
  for (const item of items) {
    if (item.meal.slot === 1) selected.set(item.meal.date, item);
    else if (item.meal.slot === 2 && !selected.has(item.meal.date)) selected.set(item.meal.date, item);
  }
  return [...selected.values()];
}
