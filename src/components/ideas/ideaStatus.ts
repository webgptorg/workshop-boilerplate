import type { BadgeTone } from "@/components/ui";
import type { MealIdeaStatus } from "@/model/types";

export const IDEA_STATUS_LABELS: Readonly<Record<MealIdeaStatus, string>> = {
  new: "Čeká na jídelnu",
  planned: "Zařazeno",
  adjusted: "Zařazeno v úpravě",
  declined: "Nezařazeno",
};

export const IDEA_STATUS_TONES: Readonly<Record<MealIdeaStatus, BadgeTone>> = {
  new: "neutral",
  planned: "success",
  adjusted: "accent",
  declined: "warning",
};

export const IDEA_STATUS_ORDER: readonly MealIdeaStatus[] = ["new", "planned", "adjusted", "declined"];
