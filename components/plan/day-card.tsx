import type { ReactNode } from "react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatShortDate, formatWeekdayName, type IsoDate } from "@/lib/dates";

export type DayTiming = "PAST" | "TODAY" | "FUTURE";

export function getDayTiming(date: IsoDate, todayIsoDate: IsoDate): DayTiming {
  if (date === todayIsoDate) {
    return "TODAY";
  }

  return date < todayIsoDate ? "PAST" : "FUTURE";
}

export type DayCardProps = {
  date: IsoDate;
  timing: DayTiming;
  closedNote: string | null;
  /**
   * Extra content in the header, right-aligned.
   */
  headerContent?: ReactNode;
  children: ReactNode;
};

/**
 * One day of the week plan: header with the date, then the role-specific content.
 */
export function DayCard({ date, timing, closedNote, headerContent, children }: DayCardProps) {
  const isClosed = closedNote !== null;

  return (
    <article
      className={cn("day-card", timing === "TODAY" && "is-today", timing === "PAST" && "is-past", isClosed && "is-closed")}
      aria-label={`${formatWeekdayName(date)} ${formatShortDate(date)}`}
    >
      <header className="day-card-header">
        <span className="day-card-date">
          <span className="day-card-weekday">{formatWeekdayName(date)}</span>
          <span className="day-card-day">{formatShortDate(date)}</span>
        </span>
        {timing === "TODAY" ? <Badge tone="tint">Dnes</Badge> : null}
        {headerContent ? <span className="day-card-header-content">{headerContent}</span> : null}
      </header>

      {isClosed ? <p className="day-card-closed">Nevaří se: {closedNote}</p> : children}
    </article>
  );
}
