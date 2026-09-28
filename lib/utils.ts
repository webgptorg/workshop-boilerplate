import type { Language } from "./types";

export const uid = () => crypto.randomUUID();
export const locale = (language: Language) => (language === "cs" ? "cs-CZ" : "en-US");
export const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function dayKey(value: Date | string = new Date()) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function dateLabel(value: string, language: Language, relative = true) {
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  if (Number.isNaN(date.getTime())) return "—";
  if (relative && dayKey(date) === dayKey()) return language === "cs" ? "Dnes" : "Today";
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (relative && dayKey(date) === dayKey(tomorrow)) return language === "cs" ? "Zítra" : "Tomorrow";
  return date.toLocaleDateString(locale(language), { month: "short", day: "numeric" });
}

export const timeLabel = (value: string, language: Language) =>
  new Date(value).toLocaleTimeString(locale(language), { hour: "numeric", minute: "2-digit" });
export const clockLabel = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;

export function localDateTime(value = new Date().toISOString()) {
  const date = new Date(value);
  return `${dayKey(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function downloadText(name: string, content: string, type = "text/markdown") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
