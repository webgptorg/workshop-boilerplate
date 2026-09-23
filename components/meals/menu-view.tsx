import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Leaf,
  Lightbulb,
  ShieldCheck,
  Soup,
  Sprout,
  Utensils,
} from "lucide-react";
import {
  formatDate,
  getWeekDays,
  INITIAL_WEEK,
  WEEK_STARTS,
  weekLabel,
  type AppData,
  type Meal,
  type Role,
  type View,
} from "@/lib/meal-model";
import { MealCard } from "./meal-card";
import { PlateIllustration } from "./plate-illustration";
export type ActiveDialog =
  | { kind: "detail" | "feedback" | "edit"; meal: Meal; date: string }
  | { kind: "login" | "idea" | "help" }
  | null;
export function MenuView({
  data,
  role,
  weekIndex,
  setWeekIndex,
  isLoaded,
  setDialog,
  changeView,
  selectMeal,
}: {
  data: AppData;
  role: Role;
  weekIndex: number;
  setWeekIndex: (week: number) => void;
  isLoaded: boolean;
  setDialog: (dialog: ActiveDialog) => void;
  changeView: (view: View) => void;
  selectMeal: (date: string, mealId: string) => void;
}) {
  const isStaff = role === "staff";
  const days = getWeekDays(data.days, weekIndex);
  const selectedCount = days.filter((day) =>
    day.meals.some((meal) => meal.id === data.choices[day.date]),
  ).length;
  const pendingIdeas = data.ideas.filter(
    (idea) => idea.status === "pending",
  ).length;
  return (
    <>
      <section className="welcome-banner">
        <div>
          <span className="banner-label">
            <Sprout size={16} /> {isStaff ? "PŘEHLED NABÍDKY" : "VÝBĚR OBĚDŮ"}
          </span>
          <h2>
            {isStaff
              ? "Jídelníček pro celou školu."
              : "Dvě jídla na každý školní den."}
          </h2>
          <p>
            {isStaff
              ? "Upravenou nabídku uvidí žáci i rodiče v tomto prohlížeči."
              : "Vybraný oběd se zobrazí i v přehledu rodiče."}
          </p>
          <span className="banner-bottom">
            <Check size={14} /> Společná polévka <span>·</span>{" "}
            <Leaf size={14} /> Hodnocení uvidí jídelna
          </span>
        </div>
        <PlateIllustration />
      </section>
      <div className="menu-layout">
        <section className="weekly-menu">
          <div className="week-toolbar">
            <div className="week-picker">
              <button
                className="icon-button"
                disabled={weekIndex === 0}
                aria-label="Předchozí týden"
                onClick={() => setWeekIndex(weekIndex - 1)}
              >
                <ChevronLeft size={19} />
              </button>
              <span>
                <CalendarDays size={17} />
                <strong>{weekLabel(weekIndex)}</strong>
              </span>
              <button
                className="icon-button"
                disabled={weekIndex === WEEK_STARTS.length - 1}
                aria-label="Následující týden"
                onClick={() => setWeekIndex(weekIndex + 1)}
              >
                <ChevronRight size={19} />
              </button>
            </div>
            <button
              className={`this-week ${weekIndex === INITIAL_WEEK ? "current" : ""}`}
              onClick={() => setWeekIndex(INITIAL_WEEK)}
            >
              Tento týden
            </button>
          </div>
          <div className="menu-legend">
            <span>
              <span className="legend-dot" />{" "}
              {isStaff
                ? "Nabídka pro žáky a rodiče"
                : "Kliknutím na kroužek vybereš jídlo"}
            </span>
            <span>
              <StarIcon /> Hodnocení jídla
            </span>
          </div>
          {weekIndex === 3 && (
            <div className="holiday">
              <CalendarDays size={18} />
              <strong>Pondělí 28. 9.</strong> Státní svátek · jídelna nevaří
            </div>
          )}
          {days.map((day) => (
            <section
              className={`day-section ${day.date === "2026-09-23" ? "today" : ""}`}
              key={day.date}
            >
              <div className="day-heading">
                <div>
                  <h2>{formatDate(day.date, { weekday: "long" })}</h2>
                  <span>{formatDate(day.date)}</span>
                  {day.date === "2026-09-23" && (
                    <span className="today-badge">Dnes</span>
                  )}
                </div>
                <span className="soup-label">
                  <Soup size={15} />
                  {day.soup}
                </span>
              </div>
              <div className="day-meals">
                {day.meals.map((meal, index) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    index={index}
                    isSelected={data.choices[day.date] === meal.id}
                    isStaff={isStaff}
                    isReady={isLoaded}
                    onSelect={() => selectMeal(day.date, meal.id)}
                    onDetail={() =>
                      setDialog({ kind: "detail", meal, date: day.date })
                    }
                    onFeedback={() =>
                      setDialog({ kind: "feedback", meal, date: day.date })
                    }
                    onEdit={() =>
                      setDialog({ kind: "edit", meal, date: day.date })
                    }
                  />
                ))}
              </div>
            </section>
          ))}
          <div className="menu-footnote">
            <Leaf size={15} />
            <span>
              Ke každému obědu je k dispozici voda a doplněk podle nabídky
              jídelny.
            </span>
          </div>
        </section>
        <aside className="right-column">
          <section className="panel selection-panel">
            <div className="section-heading">
              <h2>
                {isStaff
                  ? "Nabídka v týdnu"
                  : role === "parent"
                    ? "Výběr dítěte"
                    : "Můj výběr"}
              </h2>
              <span className="soft-icon">
                <Utensils size={17} />
              </span>
            </div>
            <p className="muted small">
              {isStaff
                ? `${days.length * 2} jídel v aktuálním týdnu`
                : role === "parent"
                  ? "Obědy pro Matěje Nováka"
                  : "Tvoje obědy na tento týden"}
            </p>
            <div className="selection-count">
              <strong>
                {isStaff ? days.length : selectedCount}
                <span> / {days.length}</span>
              </strong>
              <span>{isStaff ? "dnů naplánováno" : "obědů vybráno"}</span>
            </div>
            <div className="progress-track">
              <span
                style={{
                  width: `${isStaff ? 100 : (selectedCount / days.length) * 100}%`,
                }}
              />
            </div>
            <div className="selection-days">
              {days.map((day) => {
                const selectedMeal = day.meals.find(
                  (meal) => meal.id === data.choices[day.date],
                );
                return (
                  <div key={day.date}>
                    <span>{formatDate(day.date, { weekday: "short" })}</span>
                    <span>
                      {isStaff
                        ? "2 varianty"
                        : selectedMeal
                          ? selectedMeal.name
                          : "Zatím nevybráno"}
                    </span>
                    {selectedMeal || isStaff ? (
                      <Check size={14} />
                    ) : (
                      <span className="empty-circle" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="selection-note">
              <Clock3 size={15} />
              <span>
                {isStaff
                  ? "Úpravy se ukládají průběžně."
                  : "Výběr můžeš kdykoliv změnit."}
              </span>
            </div>
          </section>
          <section className="idea-callout">
            <span className="idea-bulb">
              <Lightbulb size={23} />
            </span>
            <h2>{isStaff ? "Náměty od strávníků" : "Co by sis dal příště?"}</h2>
            <p>
              {isStaff
                ? `${pendingIdeas} námětů čeká na vaši odpověď.`
                : "Pošli nám svůj nápad na jídlo. Jídelna se na něj podívá a dá ti vědět."}
            </p>
            <button
              onClick={() =>
                isStaff ? changeView("ideas") : setDialog({ kind: "idea" })
              }
            >
              {isStaff ? "Prohlédnout náměty" : "Navrhnout jídlo"}
              <ArrowRight size={16} />
            </button>
          </section>
          <section className="info-panel">
            <ShieldCheck size={20} />
            <h3>
              {isStaff ? "Podklady pro plánování" : "Alergeny a stravování"}
            </h3>
            <p>
              {isStaff
                ? "Bez gramáží, cen a počtů porcí nelze ověřit spotřební koš ani rozpočet. Tato verze eviduje nabídku a zpětnou vazbu."
                : "Čísla alergenů najdeš u každého jídla. Pro podrobnosti klikni na jeho název."}
            </p>
            <button onClick={() => setDialog({ kind: "help" })}>
              {isStaff ? "O datech a pravidlech" : "Více o jídelníčku"}
              <ChevronRight size={14} />
            </button>
          </section>
        </aside>
      </div>
    </>
  );
}
function StarIcon() {
  return (
    <span aria-hidden="true" className="legend-star">
      ☆
    </span>
  );
}
