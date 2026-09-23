import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";
import type { IsoDate } from "@/model/types";
import { formatWeekRange } from "@/planning/calendar";

interface WeekNavigatorProps {
  readonly weekStart: IsoDate;
  readonly onPreviousWeek: () => void;
  readonly onNextWeek: () => void;
  readonly onCurrentWeek: () => void;
}

export function WeekNavigator({ weekStart, onPreviousWeek, onNextWeek, onCurrentWeek }: WeekNavigatorProps) {
  return (
    <div className="week-navigator">
      <Button variant="secondary" size="small" onClick={onPreviousWeek} aria-label="Předchozí týden">
        <ChevronLeft size={18} aria-hidden="true" />
      </Button>
      <button type="button" className="week-navigator-range" onClick={onCurrentWeek} title="Přejít na tento týden">
        {formatWeekRange(weekStart)}
      </button>
      <Button variant="secondary" size="small" onClick={onNextWeek} aria-label="Další týden">
        <ChevronRight size={18} aria-hidden="true" />
      </Button>
    </div>
  );
}
