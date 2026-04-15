export type MoodValue = "heavy" | "low" | "balanced" | "good" | "radiant";
export type Priority = "high" | "medium" | "low";

export interface MoodEntry {
  id: string;
  mood: MoodValue;
  mood_date: string; // ISO date string YYYY-MM-DD
  note?: string;
}

export interface Habit {
  id: string;
  title: string;
  created_at: string;
}

export interface HabitLog {
  habit_id: string;
  completed: boolean;
  log_date: string; // YYYY-MM-DD
}

export interface TaskFolder {
  id: string;
  name: string;
  color: string; // Tailwind bg class
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  created_at: string; // ISO datetime
  completed_at?: string;
  folder_id?: string;
  deadline?: string; // ISO datetime e.g. "2026-04-20T17:00"
}

export interface Profile {
  name: string;
  email?: string;
}

export interface DailyReflection {
  date: string;         // YYYY-MM-DD
  dayFeeling: MoodValue;
  aiReflection: string;
  tasksCompleted: number;
  habitsCompleted: number;
  totalHabits: number;
}
