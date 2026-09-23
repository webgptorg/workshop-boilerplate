export type Role = "pupil" | "staff" | "parent";
export type User = { id: number; name: string; role: Role; username: string };
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
};
export type AppData = {
  user: User | null;
  meals: Meal[];
  selections: Record<string, number>;
  feedback: Feedback[];
  ideas: Idea[];
  preferences: string;
  weeks: string[];
};
export const ROLE_LABELS: Record<Role, string> = {
  pupil: "Žák",
  staff: "Jídelna",
  parent: "Rodič",
};
