"use client";
import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui";
import { useMinute } from "./provider";
import { Icon } from "./icon";
import { CallCard } from "./call-card";
import { Avatar, EmptyState, Today } from "./shared";
import { shortDate } from "@/lib/minute/utils";
export function Overview({ onAction }: { onAction: (id: string) => void }) {
  const { workspace, t, updateAction, language } = useMinute();
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");
  if (!workspace) return null;
  const pending = workspace.actions.filter((a) => !a.completed);
  const completed = workspace.actions.filter((a) => a.completed).length;
  const minutes = Math.round(
    workspace.calls.reduce((sum, c) => sum + c.duration, 0) / 60,
  );
  const sorted = [...workspace.calls].sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);
  const calls = sorted
    .filter((c) =>
      filter === "starred"
        ? c.starred
        : filter === "week"
          ? new Date(c.date) >= startOfWeek
          : true,
    )
    .slice(0, 4);
  const base = `/${workspace.id}`;
  return (
    <>
      <div className="page-heading overview-heading">
        <div>
          <span className="eyebrow">
            {t("WORKSPACE OVERVIEW", "PŘEHLED PRACOVNÍHO PROSTORU")}
          </span>
          <h1>
            {t(
              "Good conversations. Nothing lost.",
              "Dobré rozhovory. Nic se neztratí.",
            )}
          </h1>
        </div>
        <span className="date-pill">
          <Icon name="calendar" size={16} />
          <Today />
        </span>
      </div>
      <section className="recording-hero">
        <div className="hero-content">
          <span className="hero-kicker">
            <span className="status-dot" />
            {t("READY WHEN YOU ARE", "PŘIPRAVENO, AŽ BUDETE VY")}
          </span>
          <h2>
            {t(
              "Be in the conversation.\nKeep every good idea.",
              "Buďte součástí rozhovoru.\nUchovejte každý dobrý nápad.",
            )}
          </h2>
          <div className="hero-buttons">
            <a
              href={`${base}/recording`}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-primary"
            >
              <Icon name="mic" size={19} />
              {t("Record a call", "Nahrát hovor")}
              <Icon name="arrow" size={19} />
            </a>
            <a
              href={`${base}/recording?mode=upload`}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-secondary"
            >
              <Icon name="upload" size={18} />
              {t("Upload audio", "Nahrát soubor")}
            </a>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="floating-note note-top">
            <span className="tiny-note-icon">
              <Icon name="checkmark" size={13} />
            </span>
            {t("A good idea, captured.", "Dobrý nápad zachycen.")}
          </div>
          <div className="wave-card">
            <div className="wave-card-header">
              <span className="recording-light" />
              {t("A moment worth keeping", "Chvíle k zapamatování")}
              <span>00:42</span>
            </div>
            <div className="audio-wave">
              {Array.from({ length: 41 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    height: `${Math.round(12 + Math.abs(Math.sin(i * 1.8) * Math.cos(i * 0.4)) * 53)}px`,
                    opacity: Number(
                      (0.4 + Math.sin(i * 0.9) * 0.2 + 0.3).toFixed(2),
                    ),
                  }}
                />
              ))}
            </div>
            <div className="wave-card-bottom">
              <span className="wave-line" />
              <Icon name="mic" size={17} />
              <span className="wave-line" />
            </div>
          </div>
          <div className="floating-note note-bottom">
            <span className="tiny-note-icon sparkle-icon">
              <Icon name="sparkles" size={15} />
            </span>
            {t("Words become next steps.", "Ze slov jsou další kroky.")}
          </div>
          <span className="art-star star-one">✳</span>
          <span className="art-star star-two">✧</span>
        </div>
      </section>
      <div className="stats-grid">
        <Card className="stat-card">
          <span className="stat-icon">
            <Icon name="calls" size={20} />
          </span>
          <div>
            <span className="stat-label">
              {t("Conversations", "Rozhovory")}
            </span>
            <div className="stat-value">
              {workspace.calls.length}
              <span>{t("calls worth keeping", "uložených hovorů")}</span>
            </div>
          </div>
          <span className="stat-decoration">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
        </Card>
        <Card className="stat-card">
          <span className="stat-icon">
            <Icon name="check" size={20} />
          </span>
          <div>
            <span className="stat-label">
              {t("A little follow-through", "Od slov k činům")}
            </span>
            <div className="stat-value">
              {pending.length}
              <span>{t("open action items", "otevřených úkolů")}</span>
            </div>
          </div>
          <span className="stat-mini-label">
            {completed} {t("done", "hotovo")}
          </span>
        </Card>
        <Card className="stat-card">
          <span className="stat-icon">
            <Icon name="clock" size={20} />
          </span>
          <div>
            <span className="stat-label">
              {t("Time well spent", "Dobře strávený čas")}
            </span>
            <div className="stat-value">
              {Math.floor(minutes / 60)}
              <small>h</small> {minutes % 60}
              <small>m</small>
              <span>{t("of good conversation", "rozhovorů")}</span>
            </div>
          </div>
        </Card>
      </div>
      <div className="overview-columns">
        <section className="recent-section">
          <div className="section-heading">
            <h2>
              {t("Recent calls", "Poslední hovory")}
              <span className="count-badge">{workspace.calls.length}</span>
            </h2>
            <Link className="text-link" href={`${base}/calls`}>
              {t("View all calls", "Všechny hovory")}
              <Icon name="arrow" size={17} />
            </Link>
          </div>
          <div className="calls-toolbar">
            <div className="filter-tabs">
              {[
                ["all", t("All calls", "Všechny")],
                ["week", t("This week", "Tento týden")],
                ["starred", t("Starred", "Oblíbené")],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={filter === id ? "selected" : ""}
                >
                  {id === "starred" && <Icon name="star" size={14} />} {label}
                </button>
              ))}
            </div>
            <div className="view-toggle">
              <button
                title={t("Card view", "Karty")}
                aria-label="Card view"
                aria-pressed={view === "grid"}
                onClick={() => setView("grid")}
                className={view === "grid" ? "selected" : ""}
              >
                <Icon name="grid" size={17} />
              </button>
              <button
                title={t("Detailed view", "Podrobný seznam")}
                aria-label="Detailed view"
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
                className={view === "list" ? "selected" : ""}
              >
                <Icon name="list" size={18} />
              </button>
            </div>
          </div>
          <div className={`call-grid ${view === "list" ? "call-list" : ""}`}>
            {calls.map((call) => (
              <CallCard key={call.id} call={call} detailed={view === "list"} />
            ))}
          </div>
          {!calls.length && (
            <EmptyState
              title={t(
                "No calls here just yet.",
                "Zatím tu nejsou žádné hovory.",
              )}
            />
          )}
          <div className="sample-note">
            <span className="status-dot" />
            {t(
              "A few sample calls to make yourself at home.",
              "Ukázkové hovory pro první seznámení.",
            )}
            <Link href={`${base}/calls/first-minute`}>
              {t("Take a quick tour", "Krátká prohlídka")}
              <Icon name="arrow" size={13} />
            </Link>
          </div>
        </section>
        <aside className="follow-through">
          <div className="section-heading">
            <h2>{t("Next on your list", "Další na řadě")}</h2>
            <span className="count-badge">{pending.length}</span>
          </div>
          <Card className="action-preview">
            <div className="action-preview-heading">
              <Icon name="sparkles" size={21} />
              <span>
                {t("From words to next steps", "Od slov k dalším krokům")}
              </span>
            </div>
            <div className="preview-actions">
              {pending.slice(0, 4).map((action, index) => (
                <div className="preview-action" key={action.id}>
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={action.completed}
                    onChange={() =>
                      updateAction(
                        action.id,
                        { completed: true },
                        "Marked complete",
                      )
                    }
                    aria-label={`${t("Complete", "Dokončit")} ${action.title}`}
                  />
                  <div>
                    <button
                      className="action-title-button"
                      onClick={() => onAction(action.id)}
                    >
                      {action.title}
                    </button>
                    <Link
                      className="action-call-label"
                      href={`${base}/calls/${action.callIds[0]}`}
                    >
                      {
                        workspace.calls.find((c) => c.id === action.callIds[0])
                          ?.title
                      }
                    </Link>
                    <div className="action-assignee">
                      <Avatar name={action.assignee} index={index} small />
                      <span>
                        {action.assignee || t("Unassigned", "Nepřiřazeno")}
                      </span>
                      {action.dueDate && (
                        <span className="action-due">
                          <Icon name="calendar" size={12} />
                          {shortDate(action.dueDate, language)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {!pending.length && (
                <EmptyState
                  title={t("All caught up.", "Vše hotovo.")}
                  icon="check"
                />
              )}
            </div>
            <Link className="action-preview-footer" href={`${base}/actions`}>
              {t("View all action items", "Zobrazit všechny úkoly")}
              <Icon name="arrow" size={17} />
            </Link>
          </Card>
        </aside>
      </div>
    </>
  );
}
