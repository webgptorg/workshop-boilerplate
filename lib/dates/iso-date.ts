/**
 * Calendar date in the `YYYY-MM-DD` format (local time, no time zone information).
 *
 * ISO dates compare correctly as plain strings, so `isoDateA < isoDateB` is safe.
 */
export type IsoDate = string;

const WEEKDAYS_PER_WEEK = 5;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function padTwoDigits(value: number): string {
  return value.toString().padStart(2, "0");
}

export function toIsoDate(date: Date): IsoDate {
  return `${date.getFullYear()}-${padTwoDigits(date.getMonth() + 1)}-${padTwoDigits(date.getDate())}`;
}

export function parseIsoDate(isoDate: IsoDate): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getTodayIsoDate(): IsoDate {
  return toIsoDate(new Date());
}

export function addDays(isoDate: IsoDate, days: number): IsoDate {
  const date = parseIsoDate(isoDate);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/**
 * Returns the Monday of the week the given date belongs to.
 */
export function getWeekStartDate(isoDate: IsoDate): IsoDate {
  const date = parseIsoDate(isoDate);
  const dayOfWeek = date.getDay(); // 0 = Sunday … 6 = Saturday
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  return addDays(isoDate, -daysSinceMonday);
}

/**
 * Returns Monday to Friday of the week starting at the given Monday.
 */
export function getWeekdayIsoDates(weekStartDate: IsoDate): IsoDate[] {
  return Array.from({ length: WEEKDAYS_PER_WEEK }, (_, index) => addDays(weekStartDate, index));
}

export function getDaysBetween(fromIsoDate: IsoDate, toIsoDate: IsoDate): number {
  const difference = parseIsoDate(toIsoDate).getTime() - parseIsoDate(fromIsoDate).getTime();
  return Math.round(difference / MILLISECONDS_PER_DAY);
}
