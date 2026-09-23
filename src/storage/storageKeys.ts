const STORAGE_PREFIX = "spolecny-stul";

export const STORAGE_KEYS = {
  session: `${STORAGE_PREFIX}:session`,
  meals: `${STORAGE_PREFIX}:meals`,
  weekPlans: `${STORAGE_PREFIX}:week-plans`,
  mealChoices: `${STORAGE_PREFIX}:meal-choices`,
  feedback: `${STORAGE_PREFIX}:feedback`,
  ideas: `${STORAGE_PREFIX}:ideas`,
  preferences: `${STORAGE_PREFIX}:preferences`,
} as const;
