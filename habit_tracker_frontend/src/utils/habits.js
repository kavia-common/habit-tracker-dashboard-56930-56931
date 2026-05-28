import { format, isAfter, parseISO, subDays } from "date-fns";

function toDateKey(d) {
  return format(d, "yyyy-MM-dd");
}

/**
 * PUBLIC_INTERFACE
 * Calculate current streak based on daily completion dates.
 */
export function calculateStreak(completionDates) {
  const set = new Set((completionDates || []).filter(Boolean));
  let streak = 0;
  let cursor = new Date();

  // streak counts back from today inclusive.
  while (set.has(toDateKey(cursor))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

/**
 * PUBLIC_INTERFACE
 * Count completions over the last N days (including today).
 */
export function countLastNDays(completionDates, days) {
  const set = new Set((completionDates || []).filter(Boolean));
  let count = 0;
  for (let i = 0; i < days; i += 1) {
    const key = toDateKey(subDays(new Date(), i));
    if (set.has(key)) count += 1;
  }
  return count;
}

/**
 * PUBLIC_INTERFACE
 * Build 7-day series for charts: labels + values.
 */
export function buildLast7DaysSeries(completionDates) {
  const set = new Set((completionDates || []).filter(Boolean));
  const labels = [];
  const values = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = subDays(new Date(), i);
    labels.push(format(d, "EEE"));
    values.push(set.has(toDateKey(d)) ? 1 : 0);
  }
  return { labels, values };
}

/**
 * PUBLIC_INTERFACE
 * Normalizes a habit object shape for UI safety.
 */
export function normalizeHabit(h) {
  const completions = Array.isArray(h?.completions) ? h.completions : [];
  return {
    id: String(h?.id ?? ""),
    name: String(h?.name ?? "Untitled habit"),
    color: String(h?.color ?? "#3B82F6"),
    goalPerWeek: Number(h?.goalPerWeek ?? 5),
    reminderTime: String(h?.reminderTime ?? ""),
    tags: Array.isArray(h?.tags) ? h.tags : [],
    notes: String(h?.notes ?? ""),
    createdAt: h?.createdAt || null,
    updatedAt: h?.updatedAt || null,
    completions,
  };
}

/**
 * PUBLIC_INTERFACE
 * Get completion date keys that are <= today (filters out future dates defensively).
 */
export function getPastCompletions(completionDates) {
  return (completionDates || [])
    .map((s) => {
      try {
        // If already date key, keep it. If ISO datetime, reduce to date.
        const d = parseISO(s);
        if (Number.isNaN(d.getTime())) return s;
        return format(d, "yyyy-MM-dd");
      } catch {
        return s;
      }
    })
    .filter((s) => {
      // Filter out future.
      try {
        const d = parseISO(s);
        if (Number.isNaN(d.getTime())) return true;
        return !isAfter(d, new Date());
      } catch {
        return true;
      }
    });
}
