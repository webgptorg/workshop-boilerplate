import type { LunchChoice } from "@/lib/plan";

export const LUNCH_CHOICE_LABELS: Readonly<Record<LunchChoice, string>> = {
  PRIMARY: "Oběd 1",
  ALTERNATIVE: "Oběd 2",
};

export const LUNCH_CHOICE_LIST: readonly LunchChoice[] = ["PRIMARY", "ALTERNATIVE"];
