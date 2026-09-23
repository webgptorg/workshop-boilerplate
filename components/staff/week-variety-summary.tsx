import { LUNCH_CHOICE_LABELS } from "@/components/plan/lunch-option-labels";
import { cn } from "@/lib/cn";
import type { WeekVarietySummary as WeekVarietySummaryData } from "@/lib/plan";

export type WeekVarietySummaryProps = {
  summary: WeekVarietySummaryData;
};

type SummaryItem = {
  readonly label: string;
  readonly value: string;
  readonly isAttentionNeeded: boolean;
};

function buildSummaryItems(summary: WeekVarietySummaryData): SummaryItem[] {
  const { PRIMARY, ALTERNATIVE } = summary.redMeatCountByChoice;

  return [
    {
      label: "Dny s bezmasou variantou",
      value: `${summary.daysWithMeatlessOptionCount} z ${summary.cookingDayCount}`,
      isAttentionNeeded: summary.daysWithMeatlessOptionCount < summary.cookingDayCount,
    },
    {
      label: "Rybí jídla",
      value: String(summary.fishMealCount),
      isAttentionNeeded: false,
    },
    {
      label: "Sladká hlavní jídla",
      value: String(summary.sweetMealCount),
      isAttentionNeeded: summary.sweetMealCount > 1,
    },
    {
      label: "Červené maso",
      value: `${LUNCH_CHOICE_LABELS.PRIMARY} ×${PRIMARY} · ${LUNCH_CHOICE_LABELS.ALTERNATIVE} ×${ALTERNATIVE}`,
      isAttentionNeeded: PRIMARY > 1 || ALTERNATIVE > 1,
    },
    {
      label: "Nedoplněné dny",
      value: String(summary.incompleteDayCount),
      isAttentionNeeded: summary.incompleteDayCount > 0,
    },
  ];
}

/**
 * Counts for the week next to the rules of vyhláška 107/2005 Sb. for menus with a choice.
 */
export function WeekVarietySummary({ summary }: WeekVarietySummaryProps) {
  return (
    <aside className="variety-summary" aria-label="Přehled týdne">
      <ul className="variety-summary-list">
        {buildSummaryItems(summary).map((item) => (
          <li key={item.label} className={cn("variety-summary-item", item.isAttentionNeeded && "needs-attention")}>
            <span className="variety-summary-value">{item.value}</span>
            <span className="variety-summary-label">{item.label}</span>
          </li>
        ))}
      </ul>
      <p className="variety-summary-rules">
        Vyhláška 107/2005 Sb. u jídelníčku s výběrem: bezmasá varianta každý den, ryba alespoň 1× za 2 týdny,
        červené maso nejvýše 1× týdně v každé řadě, sladký hlavní chod nejvýše 1× za 2 týdny. Spotřební koš se
        hodnotí jako měsíční průměr.
      </p>
    </aside>
  );
}
