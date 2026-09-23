import { Badge } from "@/components/ui";
import type { IsoDate } from "@/model/types";
import { formatDayName, formatShortDate, getTodayIsoDate } from "@/planning/calendar";

interface DayHeaderProps {
  readonly date: IsoDate;
}

export function DayHeader({ date }: DayHeaderProps) {
  const isToday = date === getTodayIsoDate();

  return (
    <header className="day-header">
      <h2 className="day-title">
        <span className="day-name">{formatDayName(date)}</span>
        <span className="day-date">{formatShortDate(date)}</span>
      </h2>
      {isToday && <Badge tone="accent">Dnes</Badge>}
    </header>
  );
}
