import dayjs from "dayjs";

export type DateRange = {
  start: string;
  end: string;
};

/** Format a date (or dayjs object) to a string using the given format.
 * Returns an empty string for undefined/null/invalid dates.
 */
export const formatDate = (
  date?: string | Date | dayjs.Dayjs | null,
  format = "YYYY-MM-DD"
): string => {
  if (!date) return "";
  const parsed = dayjs(date);
  if (!parsed.isValid()) return "";
  return parsed.format(format);
};

/** Format a date/time to a string including hours and minutes. */
export const formatDateTime = (
  date?: string | Date | dayjs.Dayjs | null,
  format = "YYYY-MM-DD HH:mm"
): string => {
  if (!date) return "";
  // Ensure format is a string; fallback to default if not
  const fmt = typeof format === "string" ? format : "YYYY-MM-DD HH:mm";
  const parsed = dayjs.isDayjs(date) ? (date as dayjs.Dayjs) : dayjs(date);
  if (!parsed.isValid()) return "";
  return parsed.format(fmt);
};

/** Return today range in YYYY-MM-DD format */
export const getTodayRange = (): DateRange => {
  const today = dayjs().format("YYYY-MM-DD");
  return { start: today, end: today };
};

/** Return current week range (Monday‑Sunday) */
export const getCurrentWeekRange = (): DateRange => {
  const start = dayjs().startOf("week").format("YYYY-MM-DD");
  const end = dayjs().endOf("week").format("YYYY-MM-DD");
  return { start, end };
};

/** Return current month range */
export const getCurrentMonthRange = (): DateRange => {
  const start = dayjs().startOf("month").format("YYYY-MM-DD");
  const end = dayjs().endOf("month").format("YYYY-MM-DD");
  return { start, end };
};

/** Return range for the last N days */
export const getLastDaysRange = (days: number): DateRange => {
  const start = dayjs().subtract(days, "day").format("YYYY-MM-DD");
  const end = dayjs().format("YYYY-MM-DD");
  return { start, end };
};

/** Convert date to API‑compatible YYYY‑MM‑DD string */
export const toApiDate = (date?: string | Date | dayjs.Dayjs | null): string => {
  return formatDate(date, "YYYY-MM-DD");
};

/** Convert date to ISO‑8601 string for API payloads */
export const toApiDateTime = (
  date?: string | Date | dayjs.Dayjs | null
): string => {
  if (!date) return "";
  const parsed = dayjs(date);
  if (!parsed.isValid()) return "";
  return parsed.toISOString();
};
