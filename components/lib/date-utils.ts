// lib/date-utils.ts
import { differenceInYears, isValid } from "date-fns";

/**
 * Calculate full years between the given date (Date or ISO string)
 * and today. Returns 0 for invalid dates or future dates.
 *
 * @param dateOrIso Date | string (ISO) — e.g. new Date() or "2020-05-10T00:00:00.000Z"
 * @returns number of full years (integer >= 0)
 */
export function calculateYearsInService(dateOrIso: Date | string): number {
  const d = typeof dateOrIso === "string" ? new Date(dateOrIso) : dateOrIso;
  if (!isValid(d)) return 0;
  const today = new Date();
  if (d > today) return 0;
  return Math.max(0, differenceInYears(today, d));
}
