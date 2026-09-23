"use client";
import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChefHat,
  Leaf,
  Sprout,
  Clock3,
} from "lucide-react";
import type { AppData, Meal } from "@/lib/types";
import { MealCard } from "./meal-card";
import type { SaveAction } from "./forms";
import { ConsumerBasketPanel } from "./consumer-basket-panel";
import { Button } from "./ui/button";
const DAYS = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek"];
const MONTHS = [
  "ledna",
  "února",
  "března",
  "dubna",
  "května",
  "června",
  "července",
  "srpna",
  "září",
  "října",
  "listopadu",
  "prosince",
];
function getDates(week: string) {
  return DAYS.map((_, index) => {
    const DATE = new Date(`${week}T12:00:00Z`);
    DATE.setUTCDate(DATE.getUTCDate() + index);
    return DATE.toISOString().slice(0, 10);
  });
}
type MenuProps = {
  data: AppData;
  weekStart: string;
  setWeekStart: (weekStart: string) => void;
  isPending: boolean;
  save: SaveAction;
  onDetail: (meal: Meal) => void;
};
export function WeeklyMenu({
  data,
  weekStart,
  setWeekStart,
  isPending,
  save,
  onDetail,
}: MenuProps) {
  const [historicalSelection, setHistoricalSelection] = useState<{ weekStart: string; revisionId: number; meals: Meal[] } | null>(null);
  const IS_STAFF = (data.user?.role === "staff" || data.user?.role === "manager");
  const WEEK_START = weekStart;
  const DATES = getDates(WEEK_START);
  const HISTORICAL_SELECTION = historicalSelection?.weekStart === WEEK_START ? historicalSelection : null;
  const historicalMeals = HISTORICAL_SELECTION?.meals ?? null;
  const historicalRevisionId = HISTORICAL_SELECTION?.revisionId ?? null;
  const WEEK_MEALS = (historicalMeals ?? data.meals).filter((meal) => DATES.includes(meal.date));
  const MENU_WEEK = data.menuWeeks.find((week) => week.weekStart === WEEK_START);
  const IS_PUBLISHED = MENU_WEEK?.status === "published";
  const ACTIVE_REVISION = MENU_WEEK?.revisions.find((revision) => revision.id === (historicalRevisionId ?? MENU_WEEK.revisions[0]?.id));
  const SELECTED_COUNT = DATES.filter((date) => data.selections[date]).length;
  const START = new Date(`${DATES[0]}T12:00:00Z`);
  const END = new Date(`${DATES[4]}T12:00:00Z`);
  const WEEK_LABEL = `${START.getUTCDate()}.${START.getUTCMonth() !== END.getUTCMonth() ? ` ${MONTHS[START.getUTCMonth()]}` : ""} – ${END.getUTCDate()}. ${MONTHS[END.getUTCMonth()]} ${END.getUTCFullYear()}`;
  return (
    <>
      <div className="week-toolbar">
        <div className="week-control">
          <button
            className="icon-button"
            aria-label="Předchozí týden"
            onClick={() => setWeekStart(shiftWeek(WEEK_START, -7))}
          >
            <ChevronLeft size={18} />
          </button>
          <CalendarDays size={19} />
          <h2>{WEEK_LABEL}</h2>
          <label className="sr-only" htmlFor="menu-date">Vybrat datum</label>
          <input id="menu-date" aria-label="Vybrat datum" type="date" value={WEEK_START} onChange={(event) => setWeekStart(getWeekStart(event.target.value))} />
          <button
            className="icon-button"
            aria-label="Další týden"
            onClick={() => setWeekStart(shiftWeek(WEEK_START, 7))}
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="week-meta">
          {WEEK_START === getCurrentWeekStart() && <span className="this-week">Tento týden</span>}
          <span>
            {IS_STAFF
              ? `${WEEK_MEALS.length} jídel v nabídce`
              : `${SELECTED_COUNT} z ${new Set(WEEK_MEALS.map((meal) => meal.date)).size} obědů vybráno`}
          </span>
          {IS_STAFF && MENU_WEEK && <span>{({draft:"Rozpracováno",ready:"Čeká na schválení",approved:"Schváleno",published:"Zveřejněno"})[MENU_WEEK.status]}</span>}
        </div>
      </div>
      {IS_STAFF && MENU_WEEK && <div className="menu-workflow">
        {MENU_WEEK.status === "draft" && <Button variant="secondary" onClick={() => void save({action:"submitWeek",weekStart:WEEK_START})}>Odeslat ke schválení</Button>}
        {data.user?.role === "manager" && MENU_WEEK.status === "ready" && <Button variant="secondary" onClick={() => void save({action:"approveWeek",weekStart:WEEK_START})}>Schválit</Button>}
        {data.user?.role === "manager" && MENU_WEEK.status === "approved" && <Button onClick={() => void save({action:"publishWeek",weekStart:WEEK_START})}>Zveřejnit a otevřít výběr</Button>}
        {IS_PUBLISHED && <>
          <button className="text-button" onClick={() => { const TEXT = DATES.filter((date)=>WEEK_MEALS.some((meal)=>meal.date===date)).map((date)=>{const DAY_MEALS=WEEK_MEALS.filter((meal)=>meal.date===date);const LABEL=new Date(`${date}T12:00:00Z`).toLocaleDateString("cs-CZ",{weekday:"long",day:"2-digit",month:"2-digit",year:"numeric"});return `${LABEL}\n${DAY_MEALS.map((meal)=>`Oběd ${meal.slot}\t${meal.soup} ${meal.name} ${meal.allergens}, ${meal.side}`).join("\n")}`;}).join("\n\n"); const DOWNLOAD_URL = window.URL.createObjectURL(new Blob([TEXT],{type:"text/plain;charset=utf-8"})); const LINK=document.createElement("a"); LINK.href=DOWNLOAD_URL; LINK.download=`jidelnicek-${WEEK_START}.txt`; LINK.click(); window.URL.revokeObjectURL(DOWNLOAD_URL); }}>Export pro iCanteen</button>
          <button className="text-button" onClick={() => window.print()}>Tisk týdne</button>
        </>}
      </div>}
      {MENU_WEEK && MENU_WEEK.revisions.length > 0 && <label className="revision-picker">Verze jídelníčku<select value={historicalRevisionId ?? ""} onChange={(event)=>{const REVISION=MENU_WEEK.revisions.find((revision)=>revision.id===Number(event.target.value));setHistoricalSelection(REVISION?{weekStart:WEEK_START,revisionId:REVISION.id,meals:(JSON.parse(REVISION.snapshot) as {meals:Meal[]}).meals}:null);}}><option value="">Aktuální verze</option>{MENU_WEEK.revisions.map((revision,index)=><option key={revision.id} value={revision.id}>Vydání {MENU_WEEK.revisions.length-index}{revision.reason?` · ${revision.reason}`:""}</option>)}</select></label>}
      {ACTIVE_REVISION && MENU_WEEK?.status === "published" && (() => { const SNAPSHOT=JSON.parse(ACTIVE_REVISION.snapshot) as {ruleSet:{id:string};basketResults:{message?:string};costResults:{message?:string}};return <details className="revision-facts"><summary>Podklady této verze</summary><p>Sada pravidel: {SNAPSHOT.ruleSet.id}</p><p>Spotřební koš: {SNAPSHOT.basketResults.message ?? "Výpočet není zaznamenán."}</p><p>Cena: {SNAPSHOT.costResults.message ?? "Výpočet není zaznamenán."}</p></details>; })()}
      <div className="menu-grid">
        {DATES.map((date, index) => (
          <section
            key={date}
            className={`day-column ${date === new Date().toISOString().slice(0, 10) ? "today" : ""}`}
            aria-label={DAYS[index]}
          >
            <div className="day-heading">
              <h2>{DAYS[index]}</h2>
              <span>
                {Number(date.slice(8))}. {Number(date.slice(5, 7))}.
                {date === new Date().toISOString().slice(0, 10) && <b>Dnes</b>}
              </span>
            </div>
            {WEEK_MEALS.filter((meal) => meal.date === date).map((meal) => (
              <div key={meal.id}>
              <MealCard
                meal={meal}
                isStaff={IS_STAFF}
                isSelected={data.selections[date] === meal.id}
                isPending={isPending}
                isReadOnly={Boolean(HISTORICAL_SELECTION)}
                onSelect={() =>
                  void save({ action: "select", mealId: meal.id })
                }
                onDetail={() => onDetail(meal)}
              />
              {IS_PUBLISHED && <details className="meal-reason"><summary>Proč je tu tohle?</summary><RevisionMealReason revision={ACTIVE_REVISION} meal={meal} /></details>}
              </div>
            ))}
            {(data.user ? WEEK_MEALS.some((meal) => meal.date === date) : data.mealAvailability[date] === true) ? (
              data.user ? (
              <div className="soup">
                <span>
                  <ChefHat size={14} /> Polévka
                </span>
                <p>{WEEK_MEALS.find((meal) => meal.date === date)?.soup}</p>
              </div>
              ) : <div className="holiday"><ChefHat size={30} /><strong>Jídelníček k dispozici</strong></div>
            ) : (
              <div className="holiday">
                <Leaf size={30} />
                <strong>Jídelníček není k dispozici</strong>
              </div>
            )}
          </section>
        ))}
      </div>
      <div className="menu-footnote">
        <span>
          <Leaf size={14} /> Ke každému obědu ovoce nebo zelenina.
        </span>
        <span>
          Voda a neslazený čaj <span aria-hidden="true">·</span> A = alergeny
          hlavního jídla
        </span>
      </div>
      {data.user && !IS_STAFF && <MonthOverview meals={data.meals} weekStart={WEEK_START} />}
      {IS_STAFF && <ConsumerBasketPanel data={data} weekDates={DATES} />}
      <div className="bottom-grid">
        <section className="overview-panel">
          <div className="section-heading">
            <h2>
              <Sprout size={20} /> Pestrost týdne
            </h2>
            <span className="subtle-label">Nabídka jídel</span>
          </div>
          <div className="variety-grid">
            {[
              { label: "Bez masa", category: "Bez masa", icon: "🥬" },
              { label: "Ryby", category: "Ryba", icon: "🐟" },
              { label: "Luštěniny", category: "Luštěniny", icon: "🫘" },
              { label: "Sladká jídla", category: "Sladké", icon: "🥣" },
            ].map((item) => (
              <div key={item.label}>
                <span className="variety-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <strong>
                  {
                    new Set(WEEK_MEALS.filter((meal) => meal.category === item.category).map((meal) => meal.date)).size
                  }
                  ×
                </strong>
                <small>{item.label}</small>
              </div>
            ))}
          </div>
          <p className="panel-note">
            Pestrost nabídky, nikoli plnění spotřebního koše.
          </p>
        </section>
        <section className="info-panel">
          <div className="section-heading">
            <h2>
              <Clock3 size={19} />{" "}
              {IS_STAFF ? "Podklady pro plánování" : "Informace k obědům"}
            </h2>
          </div>
          {IS_STAFF ? (
            <>
              {data.preferencesList.map((preference) => (
                <p key={preference.dinerName}>
                  <strong>{preference.dinerName}:</strong> {preference.text}
                </p>
              ))}
            </>
          ) : (
            <>
              <div className="info-line">
                <span>Výdej obědů</span>
                <strong>11:30–14:00</strong>
              </div>
              <div className="info-line">
                <span>Strávník</span>
                <strong>{data.diners.find((diner) => diner.id === data.activeDinerId)?.name || "Vyberte strávníka"}{data.diners.find((diner) => diner.id === data.activeDinerId)?.className ? ` · ${data.diners.find((diner) => diner.id === data.activeDinerId)?.className}` : ""}</strong>
              </div>
              <p className="panel-note">
                Výběr v této ukázce se nepřenáší do iCanteen.
              </p>
            </>
          )}
        </section>
      </div>
    </>
  );
}

function getCurrentWeekStart() {
  const TODAY = new Date();
  const WEEK_START = new Date(Date.UTC(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()));
  WEEK_START.setUTCDate(WEEK_START.getUTCDate() - ((WEEK_START.getUTCDay() + 6) % 7));
  return WEEK_START.toISOString().slice(0, 10);
}
function shiftWeek(weekStart: string, days: number) { const DATE = new Date(`${weekStart}T12:00:00Z`); DATE.setUTCDate(DATE.getUTCDate() + days); return DATE.toISOString().slice(0, 10); }
function getWeekStart(date: string) { const DATE = new Date(`${date}T12:00:00Z`); DATE.setUTCDate(DATE.getUTCDate() - ((DATE.getUTCDay() + 6) % 7)); return DATE.toISOString().slice(0, 10); }

function MonthOverview({ meals, weekStart }: { meals: Meal[]; weekStart: string }) {
  const MONTH = weekStart.slice(0,7);
  const MONTH_MEALS = meals.filter((meal) => meal.date.startsWith(MONTH));
  const CATEGORIES = [
    { label: "Ryby", matches: (meal: Meal) => meal.category === "Ryba" },
    { label: "Luštěniny", matches: (meal: Meal) => /čočka|čočky|fazole|hrách|cizrna|luštěnin/i.test(meal.name + " " + meal.ingredients) },
    { label: "Bezmasá jídla", matches: (meal: Meal) => meal.category === "Bez masa" },
    { label: "Sladká jídla", matches: (meal: Meal) => meal.category === "Sladké" },
  ];
  return <section className="month-overview"><h2>Přehled měsíce</h2><div className="month-bars">{CATEGORIES.map((category) => {const DAYS_COUNT=new Set(MONTH_MEALS.filter(category.matches).map((meal)=>meal.date)).size;return <div key={category.label}><span>{category.label}</span><span className="month-bar"><span style={{width:`${Math.min(100,DAYS_COUNT*12)}%`}} /></span><small>{DAYS_COUNT===0?"zatím nezařazeno":DAYS_COUNT<3?"občas":DAYS_COUNT<7?"několikrát":"často"}</small></div>;})}</div><p>Měsíční potřebu jídelny nelze z těchto údajů určit: u jídel chybí úplné receptury s gramážemi.</p></section>;
}

function RevisionMealReason({ revision, meal }: { revision: AppData["menuWeeks"][number]["revisions"][number] | undefined; meal: Meal }) {
  if (!revision) return <p>Původ námětu, přínos pro měsíc ani nahrazené jídlo nebyly v této verzi zaznamenány.</p>;
  const SNAPSHOT = JSON.parse(revision.snapshot) as { ideas?: { id: number; text: string }[]; changes?: { mealId: number; previousName: string; currentName: string }[] };
  const CHANGE = SNAPSHOT.changes?.find((change) => change.mealId === meal.id);
  const IDEA = CHANGE ? SNAPSHOT.ideas?.[0] : undefined;
  if (IDEA && CHANGE) return <p>Námět „{IDEA.text}“ změnil jídlo „{CHANGE.previousName}“ na „{CHANGE.currentName}“. Jeho přínos pro měsíc v této verzi zaznamenán není.</p>;
  if (CHANGE) return <p>Změna: „{CHANGE.previousName}“ na „{CHANGE.currentName}“. Důvod: {revision.reason ?? "neuveden"}.</p>;
  return <p>Původ námětu, přínos pro měsíc ani změna tohoto jídla nebyly v této verzi zaznamenány.</p>;
}
