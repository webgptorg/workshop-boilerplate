import { addDays, parseIsoDate, type IsoDate } from "./iso-date";

const LOCALE = "cs-CZ";

const WEEKDAY_FORMAT = new Intl.DateTimeFormat(LOCALE, { weekday: "long" });
const SHORT_DATE_FORMAT = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "numeric" });
const LONG_DATE_FORMAT = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "numeric",
  year: "numeric",
});
const DATE_TIME_FORMAT = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * @example "pondělí"
 */
export function formatWeekdayName(isoDate: IsoDate): string {
  return WEEKDAY_FORMAT.format(parseIsoDate(isoDate));
}

/**
 * @example "23. 9."
 */
export function formatShortDate(isoDate: IsoDate): string {
  return SHORT_DATE_FORMAT.format(parseIsoDate(isoDate));
}

/**
 * @example "23. 9. 2026"
 */
export function formatLongDate(isoDate: IsoDate): string {
  return LONG_DATE_FORMAT.format(parseIsoDate(isoDate));
}

/**
 * @example "21. 9. – 25. 9. 2026"
 */
export function formatWeekRange(weekStartDate: IsoDate): string {
  const weekEndDate = addDays(weekStartDate, 4);
  return `${formatShortDate(weekStartDate)} – ${formatLongDate(weekEndDate)}`;
}

/**
 * @example "23. 9. 12:05"
 */
export function formatDateTime(isoDateTime: string): string {
  return DATE_TIME_FORMAT.format(new Date(isoDateTime));
}
