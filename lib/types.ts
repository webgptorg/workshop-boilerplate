export type Role = "pupil" | "adult" | "staff" | "parent" | "manager";
export type User = { id: number; name: string; role: Role; username: string; email?: string | null };
export type Meal = {
  id: number;
  date: string;
  slot: number;
  name: string;
  side: string;
  soup: string;
  icon: string;
  category: string;
  allergens: string;
  ingredients: string;
  recipeVersionId?: string | null;
};
export type RecipeIngredient = {
  ingredientId: string;
  amountGrams: number | null;
  isEstimate: boolean;
};
export type RecipeVersion = {
  id: string;
  mealId: number;
  validFrom: string;
  ingredients: RecipeIngredient[];
};
export type BasketGroupId = "meat" | "fish" | "dairy" | "freeFat" | "freeSugar" | "produce" | "potato" | "wholeGrain" | "legume" | "egg";
export type BasketTarget = {
  amountGramsPerDinerDay: number | null;
  minimumPercent: number | null;
  maximumPercent: number | null;
  sourcePage: number | null;
};
export type BasketRuleSet = {
  id: string;
  name: string;
  validFrom: string;
  validTo: string | null;
  sourceDocument: string;
  measureBasis: "purchased" | "clean";
  ageCategoryTargets: Partial<Record<string, Partial<Record<BasketGroupId, BasketTarget>>>>;
  groupLabels: Record<BasketGroupId, string>;
  ingredientMappings: Record<string, { groupId: BasketGroupId; coefficient: number | null; sourcePage: number | null }>;
};
export type BasketMenuItem = {
  meal: Meal;
  recipeVersion: RecipeVersion | null;
  servings: number;
  isOperatingDay: boolean;
};
export type BasketGroupResult = {
  groupId: BasketGroupId;
  label: string;
  amountGrams: number;
  targetGrams: number | null;
  minimumGrams: number | null;
  maximumGrams: number | null;
  status: "ok" | "under" | "over" | "missingData";
  isEstimate: boolean;
  estimateShare: number;
  contributingMeals: { mealId: number; name: string; amountGrams: number; isEstimate: boolean }[];
};
export type BasketPeriodResult = {
  ruleSetId: string;
  ruleSetName: string;
  period: "week" | "month";
  groups: BasketGroupResult[];
};
export type Feedback = {
  id: number;
  name: string;
  meal: string;
  rating: number;
  comment: string;
};
export type Idea = {
  id: number;
  text: string;
  status: string;
  response: string;
  name: string;
  proposalMetadata?: string | null;
};
export type AppData = {
  isDemoMode: boolean;
  user: User | null;
  roles: Role[];
  activeDinerId: number | null;
  canteens: { id: number; name: string; roles: Role[] }[];
  activeCanteenId: number | null;
  auditLog: { id: number; action: string; reason: string | null; createdAt: number }[];
  managedDiners: { id: number; name: string; className: string | null; dinerNumber: string; type: "pupil" | "adult"; archivedAt: number | null; parentLinks: string }[];
  managedPeople: { id: number; name: string; email: string | null; roles: Role[] }[];
  oneTimeCode?: string;
  diners: { id: number; name: string; className: string | null; type: "pupil" | "adult"; pupilUsername?: string | null }[];
  meals: Meal[];
  recipeVersions: RecipeVersion[];
  selections: Record<string, number>;
  feedback: Feedback[];
  ideas: Idea[];
  preferences: string;
  preferencesList: { dinerName: string; text: string }[];
  weeks: string[];
  operatingDates: string[];
  menuWeeks: { weekStart: string; status: "draft" | "ready" | "approved" | "published"; revisions: { id: number; reason: string | null; createdAt: number; snapshot: string }[] }[];
};
export const ROLE_LABELS: Record<Role, string> = {
  pupil: "Žák",
  adult: "Dospělý strávník",
  staff: "Jídelna",
  parent: "Rodič",
  manager: "Vedoucí jídelny",
};
