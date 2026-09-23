"use client";

import { useCallback } from "react";
import { INITIAL_IDEAS } from "@/data/seedFeedback";
import type { MealIdea, MealIdeaStatus } from "@/model/types";
import { STORAGE_KEYS } from "@/storage/storageKeys";
import { useStoredValue } from "@/storage/useStoredValue";
import { createId } from "./createId";

export interface IdeaStore {
  readonly ideas: readonly MealIdea[];
  readonly addIdea: (authorId: string, text: string) => void;
  readonly respondToIdea: (ideaId: string, status: MealIdeaStatus, response: string) => void;
  readonly isHydrated: boolean;
}

export function useIdeaStore(): IdeaStore {
  const { value: ideas, setValue: setIdeas, isHydrated } = useStoredValue<readonly MealIdea[]>(
    STORAGE_KEYS.ideas,
    INITIAL_IDEAS,
  );

  const addIdea = useCallback(
    (authorId: string, text: string) => {
      const createdIdea: MealIdea = {
        id: createId("idea"),
        text,
        authorId,
        createdAt: new Date().toISOString(),
        status: "new",
        response: "",
      };
      setIdeas((previousIdeas) => [...previousIdeas, createdIdea]);
    },
    [setIdeas],
  );

  const respondToIdea = useCallback(
    (ideaId: string, status: MealIdeaStatus, response: string) => {
      setIdeas((previousIdeas) =>
        previousIdeas.map((idea) => (idea.id === ideaId ? { ...idea, status, response } : idea)),
      );
    },
    [setIdeas],
  );

  return { ideas, addIdea, respondToIdea, isHydrated };
}
