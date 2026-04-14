import type { MoodEntry, HabitLog, Task } from "../../../types/appTypes";
import { setToStorage } from "../../../utils/localStorage";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InsightInput {
  moods: MoodEntry[];
  habits: { id: string; title: string }[];
  habitLogs: HabitLog[];
  tasks: Task[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getMoodScore(mood: string): number {
  switch (mood.toLowerCase()) {
    case "happy":
    case "good":
    case "radiant":
      return 1;
    case "neutral":
    case "balanced":
      return 0;
    case "sad":
    case "heavy":
    case "low":
    case "stressed":
      return -1;
    default:
      return 0;
  }
}

export function getRecentMoods(moods: MoodEntry[], count = 5): MoodEntry[] {
  return [...moods]
    .sort((a, b) => new Date(b.mood_date).getTime() - new Date(a.mood_date).getTime())
    .slice(0, count);
}

export function countCompletedHabitsPerDay(habitLogs: HabitLog[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const log of habitLogs) {
    if (log.completed) {
      map[log.log_date] = (map[log.log_date] ?? 0) + 1;
    }
  }
  return map;
}

function getLastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function generateInsights({ moods, habits, habitLogs, tasks }: InsightInput): string[] {
  const insights: string[] = [];
  const habitsByDay = countCompletedHabitsPerDay(habitLogs);

  // A. Mood Trend
  const recentMoods = getRecentMoods(moods, 5);
  if (recentMoods.length >= 3) {
    const lowCount = recentMoods.filter((m) => getMoodScore(m.mood) < 0).length;
    if (lowCount >= 3) {
      insights.push(
        "Your mood has been low recently. Try reducing your workload and scheduling short breaks to recharge."
      );
    }
  }

  // B. Positive Habit Correlation
  const moodByDate: Record<string, number> = {};
  for (const m of moods) moodByDate[m.mood_date] = getMoodScore(m.mood);

  const sharedDays = Object.keys(habitsByDay).filter((d) => moodByDate[d] !== undefined);
  if (sharedDays.length >= 3) {
    const positiveDays = sharedDays.filter((d) => habitsByDay[d] >= 1 && moodByDate[d] > 0);
    if (positiveDays.length / sharedDays.length >= 0.5) {
      insights.push(
        "You tend to feel better on days when you complete your habits. Consistency is clearly working for you."
      );
    }
  }

  // C. Task Overload
  const incompleteTasks = tasks.filter((t) => !t.completed);
  if (incompleteTasks.length >= 5) {
    insights.push(
      `You have ${incompleteTasks.length} incomplete tasks. Consider focusing on your top 3 priorities to reduce overwhelm.`
    );
  }

  // D. Consistency
  if (moods.length >= 5) {
    const trackedDates = new Set(moods.map((m) => m.mood_date));
    const trackedLastWeek = getLastNDays(7).filter((d) => trackedDates.has(d)).length;
    if (trackedLastWeek >= 5) {
      insights.push(
        "Great job staying consistent with your mood tracking this week! Awareness is the first step."
      );
    }
  }

  // E. Productivity Pattern
  const completedWithTime = tasks.filter((t) => t.completed && t.created_at);
  if (completedWithTime.length >= 5) {
    const byHour = (start: number, end: number) =>
      completedWithTime.filter((t) => {
        const h = new Date(t.created_at).getHours();
        return h >= start && h < end;
      }).length;

    const morning = byHour(6, 12);
    const afternoon = byHour(12, 18);
    const evening = byHour(18, 24);
    const peak = Math.max(morning, afternoon, evening);

    if (peak >= 3) {
      if (peak === morning) {
        insights.push("You tend to be more productive in the mornings. Schedule your most important tasks before noon.");
      } else if (peak === afternoon) {
        insights.push("You tend to be more productive in the afternoons. Block your best time after lunch for deep work.");
      } else {
        insights.push("You tend to get things done in the evenings. Make sure you're also winding down for quality sleep.");
      }
    }
  }

  // F. High-priority backlog
  const highPending = tasks.filter((t) => !t.completed && t.priority === "high");
  if (highPending.length >= 2) {
    insights.push(
      `You have ${highPending.length} high-priority tasks still pending. Tackling these first will have the biggest impact.`
    );
  }

  // G. Habit streak / absence
  if (habits.length > 0 && habitLogs.length > 0) {
    const last7 = getLastNDays(7);
    const activeDays = last7.filter((d) => habitsByDay[d] && habitsByDay[d] > 0).length;
    if (activeDays >= 5) {
      insights.push("You've been completing habits consistently this week. Excellent discipline — keep the streak alive!");
    } else if (activeDays === 0) {
      insights.push("You haven't logged any habits this week. A single small step today can restart your momentum.");
    }
  }

  const result = insights.length > 0 ? insights : ["Start tracking more data to get insights."];
  setToStorage("clario_insights", result);
  return result;
}
