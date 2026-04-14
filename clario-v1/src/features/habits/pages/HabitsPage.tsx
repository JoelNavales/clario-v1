import { useState, useCallback } from "react";
import { AppShell } from "../../../components/layout/AppShell";
import { Button } from "../../../components/ui/Button";
import { getFromStorage, setToStorage, todayStr } from "../../../utils/localStorage";
import type { Habit, HabitLog } from "../../../types/appTypes";

function getLastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split("T")[0];
  }).reverse();
}

function getCompletionIntensity(count: number, totalHabits: number): string {
  if (count === 0) return "bg-surface-container";
  const pct = count / Math.max(totalHabits, 1);
  if (pct < 0.25) return "bg-primary/20";
  if (pct < 0.5) return "bg-primary/40";
  if (pct < 0.75) return "bg-primary/65";
  return "bg-primary";
}

function calculateStreak(habitLogs: HabitLog[], habits: Habit[]): number {
  if (habits.length === 0) return 0;
  const logsByDate: Record<string, number> = {};
  for (const log of habitLogs) {
    if (log.completed) logsByDate[log.log_date] = (logsByDate[log.log_date] ?? 0) + 1;
  }
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if ((logsByDate[key] ?? 0) >= 1) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export default function HabitsPage() {
  const today = todayStr();
  const [habits, setHabits] = useState<Habit[]>(() =>
    getFromStorage<Habit[]>("clario_habits", [])
  );
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>(() =>
    getFromStorage<HabitLog[]>("clario_habit_logs", [])
  );
  const [newTitle, setNewTitle] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const todayLogs = habitLogs.filter((l) => l.log_date === today);
  const completedToday = todayLogs.filter((l) => l.completed).length;
  const percentage = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;
  const streak = calculateStreak(habitLogs, habits);
  const last30 = getLastNDays(30);

  const habitsByDay = last30.reduce<Record<string, number>>((acc, day) => {
    const count = habitLogs.filter((l) => l.log_date === day && l.completed).length;
    acc[day] = count;
    return acc;
  }, {});

  const toggleHabit = useCallback(
    (habitId: string) => {
      const existing = habitLogs.find((l) => l.habit_id === habitId && l.log_date === today);
      let updated: HabitLog[];
      if (existing) {
        updated = habitLogs.map((l) =>
          l.habit_id === habitId && l.log_date === today ? { ...l, completed: !l.completed } : l
        );
      } else {
        updated = [...habitLogs, { habit_id: habitId, completed: true, log_date: today }];
      }
      setHabitLogs(updated);
      setToStorage("clario_habit_logs", updated);
    },
    [habitLogs, today]
  );

  const addHabit = useCallback(() => {
    const title = newTitle.trim();
    if (!title) return;
    const habit: Habit = { id: Date.now().toString(), title, created_at: new Date().toISOString() };
    const updated = [...habits, habit];
    setHabits(updated);
    setToStorage("clario_habits", updated);
    setNewTitle("");
    setShowAdd(false);
  }, [habits, newTitle]);

  const deleteHabit = useCallback(
    (id: string) => {
      const updated = habits.filter((h) => h.id !== id);
      setHabits(updated);
      setToStorage("clario_habits", updated);
    },
    [habits]
  );

  return (
    <AppShell>
      {/* Top bar */}
      <header className="hidden md:flex sticky top-0 z-40 glass-nav justify-between items-center px-10 h-16 border-b border-surface-container-high/50">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-on-surface">Daily Routines</h2>
          <p className="text-xs text-on-surface-variant">Small steps, every single day.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-slate-500 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-10">
        <div className="grid grid-cols-12 gap-8">
          {/* Progress card */}
          <div className="col-span-12 md:col-span-8 bg-surface-container-lowest rounded-2xl p-8 shadow-[0_12px_40px_rgba(42,52,57,0.04)]">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                  Daily Completion
                </span>
                <h3 className="text-5xl font-bold mt-1 text-on-surface">{percentage}%</h3>
              </div>
              <span className="text-sm font-semibold text-primary">
                {completedToday} of {habits.length} completed
              </span>
            </div>
            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Streak card */}
          <div className="col-span-12 md:col-span-4 bg-primary-gradient rounded-2xl p-8 text-on-primary relative overflow-hidden shadow-[0_12px_40px_rgba(73,75,214,0.25)]">
            <span className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Current Momentum</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-5xl font-bold">{streak}</span>
              <span className="text-xl font-medium opacity-80">day streak</span>
            </div>
            <div className="absolute -right-3 -bottom-3 opacity-10">
              <span
                className="material-symbols-outlined text-8xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
            </div>
            <div className="mt-5 flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className={`w-6 h-1 rounded-full ${i < Math.min(streak, 5) ? "bg-white" : "bg-white/30"}`}
                />
              ))}
            </div>
          </div>

          {/* Habit checklist */}
          <div className="col-span-12 md:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">checklist</span>
                The Daily Checklist
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdd((v) => !v)}
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Habit
              </Button>
            </div>

            {/* Inline add form */}
            {showAdd && (
              <div className="flex gap-2 p-4 bg-surface-container-low rounded-xl">
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addHabit()}
                  placeholder="e.g. Morning Meditation (15 min)"
                  className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
                />
                <Button size="sm" onClick={addHabit} disabled={!newTitle.trim()}>
                  Save
                </Button>
              </div>
            )}

            {habits.length === 0 ? (
              <div className="py-10 text-center rounded-2xl border-2 border-dashed border-surface-container">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2">published_with_changes</span>
                <p className="text-sm text-on-surface-variant">No habits yet. Click "Add Habit" to start.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {habits.map((habit) => {
                  const log = todayLogs.find((l) => l.habit_id === habit.id);
                  const done = log?.completed ?? false;
                  return (
                    <li
                      key={habit.id}
                      className="group flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest shadow-[0_1px_4px_rgba(42,52,57,0.04)] hover:shadow-[0_4px_12px_rgba(42,52,57,0.06)] transition-all"
                    >
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                          done ? "bg-primary border-primary" : "border-outline-variant hover:border-primary"
                        }`}
                      >
                        {done && <span className="material-symbols-outlined text-on-primary text-[13px]">check</span>}
                      </button>
                      <span className={`flex-1 text-sm font-medium transition-all ${done ? "line-through text-on-surface-variant" : "text-on-surface"}`}>
                        {habit.title}
                      </span>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-error p-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete_outline</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Right column: History */}
          <div className="col-span-12 md:col-span-5 space-y-6">
            {/* Completion history grid */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_12px_40px_rgba(42,52,57,0.04)]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                  Completion History
                </span>
                <span className="text-[10px] text-on-surface-variant">Last 30 Days</span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {last30.map((day) => (
                  <div
                    key={day}
                    title={day}
                    className={`h-5 rounded-sm transition-all ${getCompletionIntensity(habitsByDay[day] ?? 0, habits.length)}`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-on-surface-variant">Less</span>
                <div className="flex gap-1 items-center">
                  <div className="w-3 h-3 rounded-sm bg-surface-container" />
                  <div className="w-3 h-3 rounded-sm bg-primary/30" />
                  <div className="w-3 h-3 rounded-sm bg-primary/60" />
                  <div className="w-3 h-3 rounded-sm bg-primary" />
                </div>
                <span className="text-[10px] text-on-surface-variant">More</span>
              </div>
            </div>

            {/* Focus Insight */}
            <div className="bg-surface-container-low rounded-2xl p-6">
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                Focus Insight
              </span>
              <p className="text-sm font-medium text-on-surface mt-2 leading-relaxed">
                {completedToday > 0
                  ? `You've completed ${completedToday} out of ${habits.length} habits today. Keep going!`
                  : "Start your habits today to build momentum and track your progress."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
