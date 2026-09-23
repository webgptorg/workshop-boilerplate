import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";
import type { WeekNavigation } from "@/hooks/use-week-navigation";
import { formatWeekRange } from "@/lib/dates";

export type WeekNavigatorProps = {
  navigation: WeekNavigation;
};

export function WeekNavigator({ navigation }: WeekNavigatorProps) {
  const { weekStartDate, isCurrentWeek, goToPreviousWeek, goToNextWeek, goToCurrentWeek } = navigation;

  return (
    <nav className="week-navigator" aria-label="Výběr týdne">
      <Button variant="secondary" size="small" onClick={goToPreviousWeek} aria-label="Předchozí týden">
        <ChevronLeft size={18} />
      </Button>
      <span className="week-navigator-label" aria-live="polite">
        {formatWeekRange(weekStartDate)}
      </span>
      <Button variant="secondary" size="small" onClick={goToNextWeek} aria-label="Následující týden">
        <ChevronRight size={18} />
      </Button>
      {isCurrentWeek ? null : (
        <Button variant="ghost" size="small" onClick={goToCurrentWeek}>
          Tento týden
        </Button>
      )}
    </nav>
  );
}
