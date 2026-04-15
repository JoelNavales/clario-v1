import type { MoodEntry, HabitLog, Task } from "../types/appTypes";
import { todayStr } from "./localStorage";

// ── Helpers ───────────────────────────────────────────────────────────────────

function offsetDay(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0]!;
}

/**
 * Given an array of YYYY-MM-DD date strings (may have duplicates),
 * returns the current consecutive-day streak ending today or yesterday.
 */
function calcStreak(rawDates: string[]): number {
  const unique = [...new Set(rawDates)].sort().reverse(); // most recent first
  if (unique.length === 0) return 0;

  const today     = todayStr();
  const yesterday = offsetDay(today, -1);

  // Streak only alive if most recent entry is today or yesterday
  if (unique[0] !== today && unique[0] !== yesterday) return 0;

  let streak = 0;
  let cursor = unique[0]!;

  for (const date of unique) {
    if (date === cursor) {
      streak++;
      cursor = offsetDay(cursor, -1);
    } else {
      // Gap found — streak broken
      break;
    }
  }

  return streak;
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Days in a row with at least one mood log. */
export function getMoodStreak(moods: MoodEntry[]): number {
  return calcStreak(moods.map((m) => m.mood_date));
}

/** Days in a row with at least one completed habit. */
export function getHabitStreak(habitLogs: HabitLog[]): number {
  return calcStreak(habitLogs.filter((l) => l.completed).map((l) => l.log_date));
}

/** Days in a row with at least one completed task. */
export function getTaskStreak(tasks: Task[]): number {
  return calcStreak(
    tasks
      .filter((t) => t.completed && t.completed_at)
      .map((t) => t.completed_at!.split("T")[0]!)
  );
}
