"use client";
import Link from "next/link";
import { useState } from "react";
import { useMinute } from "./provider";
import { Icon } from "./icon";
import { CallCard } from "./call-card";
import { EmptyState, ExportMenu } from "./shared";
export function Calls({ favorites = false }: { favorites?: boolean }) {
  const { workspace, t, language } = useMinute();
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  if (!workspace) return null;
  const calls = workspace.calls
    .filter(
      (c) =>
        (!favorites || c.starred) &&
        (category === "all" || c.category === category) &&
        `${c.title} ${c.summary}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "newest"
        ? b.date.localeCompare(a.date)
        : sort === "oldest"
          ? a.date.localeCompare(b.date)
          : a.title.localeCompare(b.title),
    );
  const monthOffset = (month.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">{workspace.name.toUpperCase()}</span>
          <h1>
            {favorites
              ? t("The ones to come back to.", "K těm se chcete vrátit.")
              : t("Every conversation, kept.", "Každý rozhovor zůstává.")}
          </h1>
        </div>
        <div className="heading-actions">
          <ExportMenu />
          <a
            href={`/${workspace.id}/recording`}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-primary"
          >
            <Icon name="plus" size={17} />
            {t("New call", "Nový hovor")}
          </a>
        </div>
      </div>
      <div className="collection-toolbar">
        <label className="inline-search">
          <Icon name="search" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Search calls…", "Hledat hovory…")}
            aria-label="Search calls"
          />
        </label>
        <select
          className="select-control"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter category"
        >
          <option value="all">
            {t("All categories", "Všechny kategorie")}
          </option>
          <option value="Meeting">{t("Meeting", "Schůzka")}</option>
          <option value="Design">Design</option>
          <option value="Team">{t("Team", "Tým")}</option>
          <option value="Project">{t("Project", "Projekt")}</option>
        </select>
        <select
          className="select-control"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort calls"
        >
          <option value="newest">{t("Newest first", "Od nejnovějších")}</option>
          <option value="oldest">{t("Oldest first", "Od nejstarších")}</option>
          <option value="name">{t("By name", "Podle názvu")}</option>
        </select>
        <div className="view-toggle">
          {(["grid", "list", "calendar"] as const).map((id) => (
            <button
              key={id}
              onClick={() => setView(id)}
              aria-label={`${id} view`}
              aria-pressed={view === id}
              className={view === id ? "selected" : ""}
            >
              <Icon name={id} size={18} />
            </button>
          ))}
        </div>
      </div>
      <div className="results-label">
        {calls.length} {t(calls.length === 1 ? "call" : "calls", "hovorů")}
      </div>
      {view !== "calendar" ? (
        calls.length ? (
          <div
            className={`call-grid all-call-grid ${view === "list" ? "call-list" : ""}`}
          >
            {calls.map((c) => (
              <CallCard key={c.id} call={c} detailed={view === "list"} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={
              favorites
                ? t(
                    "Your favorite calls will be here.",
                    "Zde budou vaše oblíbené hovory.",
                  )
                : t("No calls found.", "Žádné hovory nenalezeny.")
            }
            icon="search"
          />
        )
      ) : (
        <div className="calendar-panel">
          <div className="calendar-toolbar">
            <h2>
              {month.toLocaleDateString(language === "cs" ? "cs-CZ" : "en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <div>
              <button
                className="button button-secondary"
                onClick={() =>
                  setMonth(
                    new Date(
                      new Date().getFullYear(),
                      new Date().getMonth(),
                      1,
                    ),
                  )
                }
              >
                {t("Today", "Dnes")}
              </button>
              <button
                className="icon-button"
                aria-label="Previous month"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() - 1, 1),
                  )
                }
              >
                <Icon name="chevron" className="rotate-180" />
              </button>
              <button
                className="icon-button"
                aria-label="Next month"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() + 1, 1),
                  )
                }
              >
                <Icon name="chevron" />
              </button>
            </div>
          </div>
          <div className="calendar-grid">
            {(language === "cs"
              ? ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"]
              : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            ).map((day) => (
              <div className="calendar-day-label" key={day}>
                {day}
              </div>
            ))}
            {Array.from(
              { length: Math.ceil((days + monthOffset) / 7) * 7 },
              (_, i) => {
                const day = i - monthOffset + 1;
                const date = new Date(
                  month.getFullYear(),
                  month.getMonth(),
                  day,
                );
                const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                const today = date.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={i}
                    className={`calendar-cell ${day < 1 || day > days ? "outside-month" : ""} ${today ? "is-today" : ""}`}
                  >
                    <span className="calendar-number">{date.getDate()}</span>
                    {calls
                      .filter((c) => c.date.slice(0, 10) === dateKey)
                      .map((c) => (
                        <Link
                          className={`calendar-call category-${c.category.toLowerCase()}`}
                          href={`/${workspace.id}/calls/${c.id}`}
                          key={c.id}
                        >
                          <span>
                            {new Date(c.date).toLocaleTimeString(
                              language === "cs" ? "cs-CZ" : "en-US",
                              { hour: "numeric", minute: "2-digit" },
                            )}
                          </span>
                          {c.title}
                        </Link>
                      ))}
                  </div>
                );
              },
            )}
          </div>
        </div>
      )}
    </>
  );
}
