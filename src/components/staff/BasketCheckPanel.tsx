import { BASKET_RULES_VERSION, LUNCH_COST_LIMIT_CZK_7_10 } from "@/data/basketNorms";
import { Badge, Card, type BadgeTone } from "@/components/ui";
import type { BasketStatus, WeekBasketCheck } from "@/planning/basketCheck";

interface BasketCheckPanelProps {
  readonly check: WeekBasketCheck;
}

const STATUS_LABELS: Readonly<Record<BasketStatus, string>> = {
  ok: "V toleranci",
  low: "Málo",
  high: "Moc",
  unknown: "Bez dat",
};

const STATUS_TONES: Readonly<Record<BasketStatus, BadgeTone>> = {
  ok: "success",
  low: "warning",
  high: "danger",
  unknown: "neutral",
};

const MAXIMUM_BAR_RATIO = 1.5;

function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)} %`;
}

/**
 * Estimated consumption basket of the week compared with the lunch norms.
 */
export function BasketCheckPanel({ check }: BasketCheckPanelProps) {
  return (
    <Card className="basket-panel">
      <div className="basket-panel-header">
        <h2>Spotřební koš</h2>
        <Badge tone="neutral">Odhad</Badge>
      </div>
      <p className="basket-panel-note">
        Průměr na strávníka a den za oběd 1, strávníci 7–10 let. {BASKET_RULES_VERSION}.
      </p>
      <ul className="basket-groups">
        {check.groups.map((group) => (
          <li key={group.norm.group} className="basket-group">
            <div className="basket-group-header">
              <span className="basket-group-label">{group.norm.label}</span>
              <span className="basket-group-value">
                {Math.round(group.averageGrams)} g z {group.norm.gramsPerDay} g
              </span>
              <Badge tone={STATUS_TONES[group.status]}>{STATUS_LABELS[group.status]}</Badge>
            </div>
            <div className="basket-bar" aria-hidden="true">
              <div
                className={`basket-bar-fill is-${group.status}`}
                style={{ width: `${Math.min(group.ratio, MAXIMUM_BAR_RATIO) / MAXIMUM_BAR_RATIO * 100}%` }}
              />
              <div className="basket-bar-norm" style={{ left: `${(1 / MAXIMUM_BAR_RATIO) * 100}%` }} />
            </div>
            <span className="basket-group-ratio">{formatPercent(group.ratio)} normy</span>
          </li>
        ))}
      </ul>
      <div className="basket-cost">
        <span>Suroviny na porci</span>
        <strong>{Math.round(check.cost.averageCostCzk)} Kč</strong>
        <span>
          limit {LUNCH_COST_LIMIT_CZK_7_10.minimum}–{LUNCH_COST_LIMIT_CZK_7_10.maximum} Kč
        </span>
        <Badge tone={STATUS_TONES[check.cost.status]}>{STATUS_LABELS[check.cost.status]}</Badge>
      </div>
    </Card>
  );
}
