"use client";

import { spaceTrim } from "spacetrim";
import { UnexpectedError } from "@/errors";
import { createContext, useContext, type ReactNode } from "react";
import { useFeedbackStore, type FeedbackStore } from "./stores/useFeedbackStore";
import { useIdeaStore, type IdeaStore } from "./stores/useIdeaStore";
import { useMealCatalogStore, type MealCatalogStore } from "./stores/useMealCatalogStore";
import { useMealChoiceStore, type MealChoiceStore } from "./stores/useMealChoiceStore";
import { usePreferencesStore, type PreferencesStore } from "./stores/usePreferencesStore";
import { useWeekPlanStore, type WeekPlanStore } from "./stores/useWeekPlanStore";

export interface AppData {
  readonly mealCatalog: MealCatalogStore;
  readonly weekPlans: WeekPlanStore;
  readonly mealChoices: MealChoiceStore;
  readonly feedback: FeedbackStore;
  readonly ideas: IdeaStore;
  readonly preferences: PreferencesStore;
  /** `true` once every store was read from the browser storage */
  readonly isHydrated: boolean;
}

const AppDataContext = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { readonly children: ReactNode }) {
  const mealCatalog = useMealCatalogStore();
  const weekPlans = useWeekPlanStore();
  const mealChoices = useMealChoiceStore();
  const feedback = useFeedbackStore();
  const ideas = useIdeaStore();
  const preferences = usePreferencesStore();

  const isHydrated =
    mealCatalog.isHydrated &&
    weekPlans.isHydrated &&
    mealChoices.isHydrated &&
    feedback.isHydrated &&
    ideas.isHydrated &&
    preferences.isHydrated;

  return (
    <AppDataContext.Provider
      value={{ mealCatalog, weekPlans, mealChoices, feedback, ideas, preferences, isHydrated }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppData {
  const appData = useContext(AppDataContext);

  if (!appData) {
    throw new UnexpectedError(
      spaceTrim(`
        Hook \`useAppData\` byl použit mimo \`AppDataProvider\`.

        **Obalte** strom komponent providerem \`AppDataProvider\`.
      `),
    );
  }

  return appData;
}
