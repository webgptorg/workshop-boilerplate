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
  selections: Record<string, number>;
  feedback: Feedback[];
  ideas: Idea[];
  preferences: string;
  preferencesList: { dinerName: string; text: string }[];
  weeks: string[];
};
export const ROLE_LABELS: Record<Role, string> = {
  pupil: "Žák",
  adult: "Dospělý strávník",
  staff: "Jídelna",
  parent: "Rodič",
  manager: "Vedoucí jídelny",
};
