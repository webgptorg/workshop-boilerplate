"use client";
import Link from "next/link";
import { Card } from "@/components/ui";
import type { Call } from "@/lib/minute/types";
import { durationLabel, shortDate } from "@/lib/minute/utils";
import { useMinute } from "./provider";
import { Avatar } from "./shared";
import { Icon } from "./icon";
export function CallCard({
  call,
  detailed = false,
}: {
  call: Call;
  detailed?: boolean;
}) {
  const { workspace, updateCall, t, language } = useMinute();
  const count =
    workspace?.actions.filter((a) => a.callIds.includes(call.id)).length || 0;
  const categories = {
    Meeting: t("Meeting", "Schůzka"),
    Design: t("Design", "Design"),
    Team: t("Team", "Tým"),
    Project: t("Project", "Projekt"),
  };
  return (
    <Card className={`call-card ${detailed ? "call-card-detailed" : ""}`}>
      <div className="call-card-top">
        <span
          className={`call-type-icon category-${call.category.toLowerCase()}`}
        >
          <Icon name={call.category === "Team" ? "calls" : "file"} size={21} />
        </span>
        <span
          className={`category-badge category-${call.category.toLowerCase()}`}
        >
          {categories[call.category]}
        </span>
        <button
          className={`star-button ${call.starred ? "starred" : ""}`}
          aria-label={
            call.starred
              ? t("Remove from favorites", "Odebrat z oblíbených")
              : t("Add to favorites", "Přidat do oblíbených")
          }
          onClick={() => updateCall(call.id, { starred: !call.starred })}
        >
          <Icon name="star" size={18} />
        </button>
      </div>
      <Link
        href={`/${workspace?.id}/calls/${call.id}`}
        className="call-card-link"
      >
        <h3>{call.title}</h3>
        <p>{call.summary}</p>
      </Link>
      <div className="call-metadata">
        <span>
          <Icon name="calendar" size={14} />
          {shortDate(call.date, language)}
        </span>
        <span className="meta-dot">·</span>
        <span>
          <Icon name="clock" size={14} />
          {durationLabel(call.duration)}
        </span>
        {detailed && (
          <span className="language-tag">
            {call.language.startsWith("cs") ? "CZ" : "EN"}
          </span>
        )}
      </div>
      <div className="call-card-bottom">
        <div className="avatar-stack">
          {call.participants.slice(0, 3).map((p, i) => (
            <Avatar name={p} index={i} small key={p} />
          ))}
          {call.participants.length > 3 && (
            <Avatar name={`+${call.participants.length - 3}`} index={3} small />
          )}
        </div>
        <Link
          href={`/${workspace?.id}/calls/${call.id}?tab=actions`}
          className="call-action-count"
        >
          <Icon name="check" size={15} />
          {count}{" "}
          {t(
            count === 1 ? "action item" : "action items",
            count === 1 ? "úkol" : "úkolů",
          )}
          <Icon name="chevron" size={14} />
        </Link>
      </div>
    </Card>
  );
}
