import type { IsoDate } from "@/model/types";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const CZECH_DAY_NAMES = ["neděle", "pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota"];

export function parseIsoDate(isoDate: IsoDate): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatIsoDate(date: Date): IsoDate {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayIsoDate(): IsoDate {
  return formatIsoDate(new Date());
}

export function addDays(isoDate: IsoDate, days: number): IsoDate {
  const date = parseIsoDate(isoDate);
  return formatIsoDate(new Date(date.getTime() + days * MILLISECONDS_PER_DAY));
}

/**
 * Monday of the week the date belongs to.
 */
export function getWeekStart(isoDate: IsoDate): IsoDate {
  const date = parseIsoDate(isoDate);
  const daysSinceMonday = (date.getDay() + 6) % 7;
  return addDays(isoDate, -daysSinceMonday);
}

export function getWorkdaysOfWeek(weekStart: IsoDate): IsoDate[] {
  return [0, 1, 2, 3, 4].map((offset) => addDays(weekStart, offset));
}

export function formatDayName(isoDate: IsoDate): string {
  return CZECH_DAY_NAMES[parseIsoDate(isoDate).getDay()];
}

/**
 * Formats the date the Czech way without the year, for example `21. 9.`
 */
export function formatShortDate(isoDate: IsoDate): string {
  const date = parseIsoDate(isoDate);
  return `${date.getDate()}. ${date.getMonth() + 1}.`;
}

export function formatWeekRange(weekStart: IsoDate): string {
  return `${formatShortDate(weekStart)} – ${formatShortDate(addDays(weekStart, 4))}`;
}

export function formatDateTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  return `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`;
}
