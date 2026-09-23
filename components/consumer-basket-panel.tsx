"use client";
import { useMemo, useState } from "react";
import { calculateConsumerBasket, getBasketStatusLabel, getChoiceMenuItems } from "@/lib/consumer-basket";
import { BASKET_RULE_SETS, getDefaultRuleSet } from "@/lib/basket-rules";
import type { AppData, BasketMenuItem, BasketRuleSet, BasketPeriodResult } from "@/lib/types";

function getMonthStart(date: string) { return `${date.slice(0, 7)}-01`; }
function getMonthDates(date: string) {
  const start = getMonthStart(date);
  const count = new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)), 0)).getUTCDate();
  return Array.from({ length: count }, (_, index) => `${start.slice(0, 8)}${String(index + 1).padStart(2, "0")}`);
}
function asMenuItems(data: AppData, meals: AppData["meals"]): BasketMenuItem[] {
  return meals.map((meal) => ({
    meal,
    recipeVersion: data.recipeVersions.find((version) => version.id === meal.recipeVersionId) ?? null,
    servings: 1,
    isOperatingDay: true,
  }));
}
function countOperatingDays(data: AppData, dates: string[]) {
  return data.operatingDates.filter((date) => dates.includes(date)).length;
}
function getRemainingDates(data: AppData, weekDates: string[], monthDates: string[]) {
  const weekSet = new Set(weekDates);
  const lastVisibleDay = weekDates.at(-1) ?? "";
  return data.operatingDates.filter((date) => monthDates.includes(date) && !weekSet.has(date) && date > lastVisibleDay);
}
function getAgeCategory(data: AppData) {
  const diner = data.diners.find((item) => item.id === data.activeDinerId);
  if (diner?.type === "adult") return "15+";
  return "7-10";
}
function addMonthAge(category: string, suffix: string) { return category === "7-10" || category === "15+" ? `${category}${suffix}` : category; }
function displayAmount(value: number) { return `${Math.round(value).toLocaleString("cs-CZ")} g`; }

function RuleSetComparison({ data, monthMeals, monthDates, ageCategory, ruleSet }: {
  data: AppData; monthMeals: AppData["meals"]; monthDates: string[]; ageCategory: string; ruleSet: BasketRuleSet;
}) {
  const monthResult = calculateConsumerBasket({
    items: getChoiceMenuItems(asMenuItems(data, monthMeals), "all-offered"),
    ageCategory: addMonthAge(ageCategory, "-lunch"), ruleSet, period: "month", operatingDayCount: countOperatingDays(data, monthDates),
  });
  return <span>{monthResult.groups.filter((group) => group.status !== "ok").length} skupin mimo limit nebo s chybějícími údaji</span>;
}

export function ConsumerBasketPanel({ data, weekDates }: { data: AppData; weekDates: string[] }) {
  const [ruleSetId, setRuleSetId] = useState<string | null>(null);
  const [isMonthMode, setIsMonthMode] = useState(false);
  const [isSelectedMealReading, setIsSelectedMealReading] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const startRule = getDefaultRuleSet(weekDates[0]);
  const ruleSet = BASKET_RULE_SETS.find((item) => item.id === ruleSetId) ?? startRule;
  const monthDates = getMonthDates(weekDates[0]);
  const remainingDates = getRemainingDates(data, weekDates, monthDates);
  const monthMeals = data.meals.filter((meal) => monthDates.includes(meal.date));
  const rangeDates = isMonthMode ? monthDates : weekDates;
  const rangeMeals = data.meals.filter((meal) => rangeDates.includes(meal.date));
  const AGE = getAgeCategory(data);
  const READING = isSelectedMealReading ? "selected-meals" : "all-offered";
  const menuItems = useMemo(() => getChoiceMenuItems(asMenuItems(data, rangeMeals), READING), [data, rangeMeals, READING]);
  const result = calculateConsumerBasket({
    items: menuItems, ageCategory: addMonthAge(AGE, "-lunch"), ruleSet,
    period: isMonthMode ? "month" : "week", operatingDayCount: countOperatingDays(data, rangeDates),
  });
  const restDays = remainingDates.length;
  const selectedGroup = result.groups.find((group) => group.groupId === selectedGroupId);
  const allOfferedResult = calculateConsumerBasket({
    items: getChoiceMenuItems(asMenuItems(data, rangeMeals), "all-offered"),
    ageCategory: addMonthAge(AGE, "-lunch"), ruleSet, period: isMonthMode ? "month" : "week",
    operatingDayCount: countOperatingDays(data, rangeDates),
  });
  const selectedMealsResult = calculateConsumerBasket({
    items: getChoiceMenuItems(asMenuItems(data, rangeMeals), "selected-meals"),
    ageCategory: addMonthAge(AGE, "-lunch"), ruleSet, period: isMonthMode ? "month" : "week",
    operatingDayCount: countOperatingDays(data, rangeDates),
  });
  const periodLabel = isMonthMode ? "Měsíc" : "Týden";

  return <section className="consumer-basket" aria-label="Spotřební koš">
    <div className="basket-heading">
      <div><h2>Spotřební koš</h2><strong>{ruleSet.name}</strong></div>
      <label>Pravidla<select aria-label="Sada pravidel" value={ruleSet.id} onChange={(event) => setRuleSetId(event.target.value)}>
        {BASKET_RULE_SETS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select></label>
    </div>
    <div className="basket-controls">
      <div className="basket-period-switch"><button aria-pressed={!isMonthMode} onClick={() => setIsMonthMode(false)}>Týden</button><button aria-pressed={isMonthMode} onClick={() => setIsMonthMode(true)}>Měsíc</button></div>
      <label className="basket-choice-reading"><input type="checkbox" checked={isSelectedMealReading} onChange={(event) => setIsSelectedMealReading(event.target.checked)} /> Zobrazit jen vybraný chod v hlavním přehledu</label>
    </div>
    <p className="basket-interpretation">Vyhláška požaduje zachovat plnění normy při nabídce jídel na výběr, neurčuje však, zda evidovat celý objem výroby, nebo odebrané porce. Vedle sebe jsou dostupné obě čtení.</p>
    {!isMonthMode && <p className="basket-month-context">Měsíc zatím: <RuleSetComparison data={data} monthMeals={monthMeals} monthDates={monthDates} ageCategory={AGE} ruleSet={ruleSet} /> · Zbývá {restDays} provozních dnů.</p>}
    <div className="basket-groups">{result.groups.map((group) => <button className="basket-group" key={group.groupId} onClick={() => setSelectedGroupId(selectedGroupId === group.groupId ? null : group.groupId)} aria-expanded={selectedGroupId === group.groupId}>
      <span className="basket-group-title"><strong>{group.label}</strong><small>{getBasketStatusLabel(group.status, group.isEstimate)}</small></span>
      <span className="basket-progress"><i style={{ width: `${Math.max(0, Math.min(100, group.maximumGrams === null ? (group.targetGrams ? group.amountGrams / group.targetGrams * 100 : 0) : group.amountGrams / group.maximumGrams * 100))}%` }} /></span>
      <span className="basket-values">{displayAmount(group.amountGrams)} / {group.targetGrams === null ? "chybí v pravidlech" : displayAmount(group.targetGrams)} {group.minimumGrams !== null && group.maximumGrams !== null && <small>({displayAmount(group.minimumGrams)}–{displayAmount(group.maximumGrams)})</small>}</span>
      <span className="basket-contribution">{periodLabel} přidává hodnotu za {countOperatingDays(data, rangeDates)} provozních dnů</span>
    </button>)}</div>
    {selectedGroup && <ContributionList result={result} group={selectedGroup} />}
    <div className="basket-comparison"><span>Výklad výběrového menu · {periodLabel}</span><div><strong>Všechna nabízená jídla</strong><ChoiceResultSummary result={allOfferedResult} /></div><div><strong>Jídla zvolená strávníky</strong><ChoiceResultSummary result={selectedMealsResult} /></div></div>
    <div className="basket-comparison"><span>Porovnání pravidel pro měsíc</span>{BASKET_RULE_SETS.filter((item) => item.id !== ruleSet.id).map((item) => <div key={item.id}><strong>{item.name}</strong><RuleSetComparison data={data} monthMeals={monthMeals} monthDates={monthDates} ageCategory={AGE} ruleSet={item} /></div>)}</div>
    <p className="basket-data-note">Chybí v pravidlech = cílová hodnota není dostupná pro zvolenou věkovou kategorii. Chybějící gramáže receptur se nezapočítávají.</p>
  </section>;
}

function ChoiceResultSummary({ result }: { result: BasketPeriodResult }) {
  return <span>{result.groups.filter((group) => group.status !== "ok").length} skupin mimo limit nebo s chybějícími údaji</span>;
}

function ContributionList({ result, group }: { result: BasketPeriodResult; group: BasketPeriodResult["groups"][number] }) {
  return <div className="basket-contributors"><h3>{group.label}: příspěvky</h3>{group.contributingMeals.length ? group.contributingMeals.map((meal) => <p key={meal.mealId}>{meal.name} · {displayAmount(meal.amountGrams)}{meal.isEstimate ? " · odhad" : ""}</p>) : <p>Chybí gramáže receptur.</p>}<small>{result.ruleSetName}</small></div>;
}
