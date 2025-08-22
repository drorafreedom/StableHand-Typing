// src/utils/age.ts

/**
 * Age utilities:
 * - parseDOB: parses "YYYY-MM-DD" safely (from <input type="date">) without timezone shifts
 * - computeAgeFromDOB: precise integer age as of a given date (default: now)
 * - toAgeRange: bucket an age into a coarse range for analysis
 * - computeAgeAndRange: convenience wrapper that returns both
 */

// 1) Update the union type
export type AgeRange =
  | "<18"
  | "18-24"
  | "25-34"
  | "35-44"
  | "45-54"
  | "55-64"
  | "65-74"
  | "75-84"
  | "85+";


/** Parse a date coming from <input type="date"> ("YYYY-MM-DD") without TZ drift. */
export function parseDOB(value: string): Date | null {
  if (!value) return null;
  // Prefer strict split to avoid timezone surprises
  const parts = value.split("-");
  if (parts.length === 3) {
    const [yStr, mStr, dStr] = parts;
    const y = Number(yStr);
    const m = Number(mStr);
    const d = Number(dStr);
    if (
      Number.isInteger(y) &&
      Number.isInteger(m) &&
      Number.isInteger(d) &&
      y >= 1900 &&
      m >= 1 &&
      m <= 12 &&
      d >= 1 &&
      d <= 31
    ) {
      const dt = new Date(y, m - 1, d);
      // Validate that JS didn't roll the date (e.g., 2024-02-31 -> Mar 2)
      if (dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d) {
        return dt;
      }
      return null;
    }
    return null;
  }

  // Fallback: let Date try; reject invalid
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

/** Basic validity check: not in the future, not absurdly old, and parseable. */
export function isValidDOB(value: string, now: Date = new Date()): boolean {
  const dob = parseDOB(value);
  if (!dob) return false;
  if (dob.getTime() > now.getTime()) return false;
  // Older than 120 years -> reject (tune as needed)
  const tooOld = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
  if (dob < tooOld) return false;
  return true;
}

/** Compute age in whole years as of "at" (defaults to now). Returns null if invalid. */
export function computeAgeFromDOB(dobISO: string, at: Date = new Date()): number | null {
  const dob = parseDOB(dobISO);
  if (!dob) return null;
  let age = at.getFullYear() - dob.getFullYear();
  const m = at.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && at.getDate() < dob.getDate())) age--;
  return age >= 0 ? age : null;
}

/** Map a numeric age into a coarse bucket for analytics. */
// 2) Update the mapping function
export function toAgeRange(age: number | null): AgeRange | null {
  if (age == null) return null;
  if (age < 18) return "<18";
  if (age <= 24) return "18-24";
  if (age <= 34) return "25-34";
  if (age <= 44) return "35-44";
  if (age <= 54) return "45-54";
  if (age <= 64) return "55-64";
  if (age <= 74) return "65-74";
  if (age <= 84) return "75-84";
  return "85+";
}

/** Convenience: compute both age and range in one call. Returns null if DOB invalid. */
export function computeAgeAndRange(
  dobISO: string,
  at: Date = new Date()
): { age: number; ageRange: AgeRange } | null {
  const age = computeAgeFromDOB(dobISO, at);
  if (age == null) return null;
  const ageRange = toAgeRange(age)!;
  return { age, ageRange };
}
