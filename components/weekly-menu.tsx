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
  weekIndex: number;
  setWeekIndex: (index: number) => void;
  isPending: boolean;
  save: SaveAction;
  onDetail: (meal: Meal) => void;
};
export function WeeklyMenu({
  data,
  weekIndex,
  setWeekIndex,
  isPending,
  save,
  onDetail,
}: MenuProps) {
  const IS_STAFF = (data.user?.role === "staff" || data.user?.role === "manager");
  const DATES = getDates(data.weeks[weekIndex]);
  const WEEK_MEALS = data.meals.filter((meal) => DATES.includes(meal.date));
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
            disabled={weekIndex === 0}
            aria-label="Předchozí týden"
            onClick={() => setWeekIndex(weekIndex - 1)}
          >
            <ChevronLeft size={18} />
          </button>
          <CalendarDays size={19} />
          <h2>{WEEK_LABEL}</h2>
          <button
            className="icon-button"
            disabled={weekIndex === data.weeks.length - 1}
            aria-label="Další týden"
            onClick={() => setWeekIndex(weekIndex + 1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="week-meta">
          {weekIndex === 0 && <span className="this-week">Tento týden</span>}
          <span>
            {IS_STAFF
              ? `${WEEK_MEALS.length} jídel v nabídce`
              : `${SELECTED_COUNT} z ${new Set(WEEK_MEALS.map((meal) => meal.date)).size} obědů vybráno`}
          </span>
        </div>
      </div>
      <div className="menu-grid">
        {DATES.map((date, index) => (
          <section
            key={date}
            className={`day-column ${date === "2026-09-23" ? "today" : ""}`}
            aria-label={DAYS[index]}
          >
            <div className="day-heading">
              <h2>{DAYS[index]}</h2>
              <span>
                {Number(date.slice(8))}. {Number(date.slice(5, 7))}.
                {date === "2026-09-23" && <b>Dnes</b>}
              </span>
            </div>
            {WEEK_MEALS.filter((meal) => meal.date === date).map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                isStaff={IS_STAFF}
                isSelected={data.selections[date] === meal.id}
                isPending={isPending}
                onSelect={() =>
                  void save({ action: "select", mealId: meal.id })
                }
                onDetail={() => onDetail(meal)}
              />
            ))}
            {WEEK_MEALS.some((meal) => meal.date === date) ? (
              <div className="soup">
                <span>
                  <ChefHat size={14} /> Polévka
                </span>
                <p>{WEEK_MEALS.find((meal) => meal.date === date)?.soup}</p>
              </div>
            ) : (
              <div className="holiday">
                <Leaf size={30} />
                <strong>Státní svátek</strong>
                <p>Jídelna nevaří</p>
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
