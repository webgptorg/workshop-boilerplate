import MENU_DATA from "./menu-data.json";

export type Role = "pupil" | "staff" | "parent";
export type View = "menu" | "feedback" | "ideas" | "preferences";
export interface Meal {
  id: string;
  name: string;
  side: string;
  icon: string;
  allergens: string;
  source: string;
}
export interface MenuDay {
  date: string;
  soup: string;
  meals: Meal[];
}
export interface Feedback {
  id: string;
  mealId: string;
  mealName: string;
  role: Role;
  rating: number;
  comment: string;
}
export interface Idea {
  id: string;
  text: string;
  role: Role;
  status: "pending" | "accepted" | "declined";
  response: string;
}
export interface AppData {
  version: 1;
  days: MenuDay[];
  choices: Record<string, string>;
  feedback: Feedback[];
  ideas: Idea[];
  preferences: string[];
  preferenceNote: string;
}
export const USERS = {
  pupil: {
    name: "Matěj Novák",
    initials: "MN",
    label: "Žák",
    detail: "6. B",
    username: "matej",
    password: "obedy123",
  },
  staff: {
    name: "Jana Veselá",
    initials: "JV",
    label: "Jídelna",
    detail: "Vedoucí jídelny",
    username: "jidelna",
    password: "varime123",
  },
  parent: {
    name: "Petra Nováková",
    initials: "PN",
    label: "Rodič",
    detail: "Rodič Matěje Nováka",
    username: "petra",
    password: "rodina123",
  },
} as const;
export const WEEK_STARTS = [
  "2026-09-07",
  "2026-09-14",
  "2026-09-21",
  "2026-09-28",
  "2026-10-05",
  "2026-10-12",
];
export const INITIAL_WEEK = 2;
export const STORAGE_KEY = "spolecny-stul:v1";
export const INITIAL_DATA: AppData = {
  version: 1,
  days: MENU_DATA,
  choices: {},
  feedback: [],
  ideas: [],
  preferences: [],
  preferenceNote: "",
};
export const ALLERGENS =
  "1 Obiloviny obsahující lepek · 2 Korýši · 3 Vejce · 4 Ryby · 5 Arašídy · 6 Sója · 7 Mléko · 8 Skořápkové plody · 9 Celer · 10 Hořčice · 11 Sezam · 12 Oxid siřičitý a siřičitany · 13 Vlčí bob · 14 Měkkýši";
export function getWeekDays(days: MenuDay[], weekIndex: number) {
  const start = WEEK_STARTS[weekIndex];
  const end = new Date(`${start}T12:00:00`);
  end.setDate(end.getDate() + 5);
  return days.filter(
    (day) => day.date >= start && new Date(`${day.date}T12:00:00`) < end,
  );
}
export function formatDate(
  date: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "numeric" },
) {
  return new Intl.DateTimeFormat("cs-CZ", options).format(
    new Date(`${date}T12:00:00`),
  );
}
export function weekLabel(weekIndex: number) {
  const start = WEEK_STARTS[weekIndex];
  const end = new Date(`${start}T12:00:00`);
  end.setDate(end.getDate() + 4);
  return `${formatDate(start)} – ${new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "long", year: "numeric" }).format(end)}`;
}
export function isRole(value: unknown): value is Role {
  return value === "pupil" || value === "staff" || value === "parent";
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function hasStrings(value: Record<string, unknown>, keys: string[]) {
  return keys.every((key) => typeof value[key] === "string");
}
function isMenuDay(value: unknown, index: number): value is MenuDay {
  if (
    !isRecord(value) ||
    value.date !== MENU_DATA[index]?.date ||
    typeof value.soup !== "string" ||
    !Array.isArray(value.meals) ||
    value.meals.length !== 2
  )
    return false;
  return value.meals.every(
    (meal: unknown, mealIndex: number) =>
      isRecord(meal) &&
      hasStrings(meal, ["id", "name", "side", "icon", "allergens", "source"]) &&
      meal.id === MENU_DATA[index].meals[mealIndex].id,
  );
}
function isFeedback(value: unknown): value is Feedback {
  return (
    isRecord(value) &&
    hasStrings(value, ["id", "mealId", "mealName", "comment"]) &&
    isRole(value.role) &&
    typeof value.rating === "number" &&
    Number.isInteger(value.rating) &&
    value.rating >= 1 &&
    value.rating <= 5
  );
}
function isIdea(value: unknown): value is Idea {
  return (
    isRecord(value) &&
    hasStrings(value, ["id", "text", "response"]) &&
    isRole(value.role) &&
    ["pending", "accepted", "declined"].includes(String(value.status))
  );
}
function isChoices(value: unknown) {
  return (
    isRecord(value) &&
    Object.entries(value).every(([date, choice]) => {
      const day = MENU_DATA.find((day) => day.date === date);
      return (
        day !== undefined &&
        (choice === "" || day.meals.some((meal) => meal.id === choice))
      );
    })
  );
}
export function isAppData(value: unknown): value is AppData {
  return (
    isRecord(value) &&
    value.version === 1 &&
    Array.isArray(value.days) &&
    value.days.length === MENU_DATA.length &&
    value.days.every(isMenuDay) &&
    isChoices(value.choices) &&
    Array.isArray(value.feedback) &&
    value.feedback.every(isFeedback) &&
    Array.isArray(value.ideas) &&
    value.ideas.every(isIdea) &&
    Array.isArray(value.preferences) &&
    value.preferences.every((item) => typeof item === "string") &&
    typeof value.preferenceNote === "string"
  );
}
