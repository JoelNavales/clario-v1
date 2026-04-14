import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../../components/layout/AppShell";
import { getFromStorage, setToStorage, todayStr } from "../../../utils/localStorage";
import type { MoodEntry, MoodValue, Habit, HabitLog, Task, Profile } from "../../../types/appTypes";
import DashboardSvg from "../../../assets/Dashboard.svg";

const MOODS: { value: MoodValue; icon: string; emoji: string }[] = [
  { value: "heavy", icon: "sentiment_very_dissatisfied", emoji: "😔" },
  { value: "low", icon: "sentiment_dissatisfied", emoji: "😐" },
  { value: "balanced", icon: "sentiment_neutral", emoji: "😊" },
  { value: "good", icon: "sentiment_satisfied", emoji: "😌" },
  { value: "radiant", icon: "sentiment_very_satisfied", emoji: "🤩" },
];

function useTimer() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 0) { setIsRunning(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const reset = () => { setIsRunning(false); setSeconds(25 * 60); };
  return { display: fmt(seconds), isRunning, toggle: () => setIsRunning((r) => !r), reset };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning.";
  if (h < 18) return "Good afternoon.";
  return "Good evening.";
}

function getLocalTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const timer = useTimer();
  const [time, setTime] = useState(getLocalTime);
  const profile = getFromStorage<Profile>("clario_profile", { name: "You" });

  const moods = getFromStorage<MoodEntry[]>("clario_moods", []);
  const habits = getFromStorage<Habit[]>("clario_habits", []);
  const habitLogs = getFromStorage<HabitLog[]>("clario_habit_logs", []);
  const tasks = getFromStorage<Task[]>("clario_tasks", []);

  const today = todayStr();
  const todayLogs = habitLogs.filter((l) => l.log_date === today);
  const todayTasks = tasks.filter((t) => !t.completed).slice(0, 4);

  const todayMood = [...moods]
    .filter((m) => m.mood_date === today)
    .sort((a, b) => Number(b.id) - Number(a.id))[0];

  useEffect(() => {
    const id = setInterval(() => setTime(getLocalTime()), 30_000);
    return () => clearInterval(id);
  }, []);

  const logMood = useCallback(
    (mood: MoodValue) => {
      const existing = getFromStorage<MoodEntry[]>("clario_moods", []);
      const updated: MoodEntry[] = [
        ...existing,
        { id: Date.now().toString(), mood, mood_date: today, note: "" },
      ];
      setToStorage("clario_moods", updated);
      navigate("/mood");
    },
    [today, navigate]
  );

  const toggleHabit = useCallback(
    (habitId: string) => {
      const logs = getFromStorage<HabitLog[]>("clario_habit_logs", []);
      const existing = logs.find((l) => l.habit_id === habitId && l.log_date === today);
      let updated: HabitLog[];
      if (existing) {
        updated = logs.map((l) =>
          l.habit_id === habitId && l.log_date === today ? { ...l, completed: !l.completed } : l
        );
      } else {
        updated = [...logs, { habit_id: habitId, completed: true, log_date: today }];
      }
      setToStorage("clario_habit_logs", updated);
    },
    [today]
  );

  const PRIORITY_DOT: Record<string, string> = {
    high: "bg-primary",
    medium: "bg-tertiary-fixed-dim",
    low: "bg-outline-variant",
  };

  return (
    <AppShell>
      {/* Sticky top bar */}
      <header className="hidden md:flex sticky top-0 z-40 glass-nav justify-between items-center px-10 h-16 border-b border-surface-container-high/50">
        <div className="h-8 w-28 md:h-9 md:w-36 overflow-hidden rounded-sm">
          <img
            src={DashboardSvg}
            alt="Clario"
            className="h-full w-full object-cover [clip-path:inset(1%_4%_1%_4%)]"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="text-slate-500 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button onClick={() => navigate("/settings")} className="text-slate-500 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div
            onClick={() => navigate("/settings")}
            className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-sm cursor-pointer"
          >
            {profile.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-10 space-y-10">
        {/* Welcome */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-5xl font-bold tracking-tight text-on-surface">{getGreeting()}</h1>
            <p className="text-on-surface-variant text-lg">
              Welcome back,{" "}
              <span className="text-primary font-semibold">{profile.name}</span>. Let's make today count.
            </p>
          </div>
          <div className="bg-surface-container-low px-6 py-4 rounded-xl flex items-center gap-4 shrink-0">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Local Time</p>
              <p className="text-xl font-medium">{time}</p>
            </div>
            <span className="material-symbols-outlined text-primary text-3xl">wb_sunny</span>
          </div>
        </header>

        {/* Bento row 1 */}
        <div className="grid grid-cols-12 gap-6">
          {/* Mood Tracker */}
          <div className="col-span-12 md:col-span-7 bg-surface-container-lowest rounded-2xl p-8 flex flex-col justify-between min-h-[280px] shadow-[0_12px_40px_rgba(42,52,57,0.04)]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold">
                  Mood Tracker
                </span>
                <h3 className="text-2xl font-semibold mt-1">
                  {todayMood ? `You're feeling ${todayMood.mood}` : "How are you feeling?"}
                </h3>
              </div>
              <div className="flex gap-2">
                {MOODS.map(({ value, emoji }) => (
                  <button
                    key={value}
                    onClick={() => logMood(value)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all text-xl ${
                      todayMood?.mood === value
                        ? "bg-primary-gradient scale-110 shadow-md"
                        : "bg-surface-container-low hover:bg-primary-container"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            {/* Mood chart bars */}
            <div className="mt-6 flex items-end gap-1 h-20">
              {moods
                .slice(-7)
                .map((m, i) => {
                  const score = m.mood === "radiant" ? 100 : m.mood === "good" ? 80 : m.mood === "balanced" ? 60 : m.mood === "low" ? 40 : 20;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-t-full transition-all ${i === moods.slice(-7).length - 1 ? "bg-primary/30 border-t-2 border-primary" : "bg-surface-container-low"}`}
                      style={{ height: `${score}%` }}
                    />
                  );
                })}
              {moods.length === 0 &&
                [40, 60, 55, 80, 70, 90, 30].map((h, i) => (
                  <div key={i} className="flex-1 bg-surface-container rounded-t-full" style={{ height: `${h}%` }} />
                ))}
            </div>
          </div>

          {/* Focus Timer */}
          <div className="col-span-12 md:col-span-5 bg-surface-container-lowest rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-5 shadow-[0_12px_40px_rgba(42,52,57,0.04)]">
            <span className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold">
              Focus Timer
            </span>
            <p className="text-7xl font-bold tracking-tight text-on-surface tabular-nums">{timer.display}</p>
            <div className="flex gap-3 items-center">
              <button
                onClick={timer.reset}
                className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined">restart_alt</span>
              </button>
              <button
                onClick={timer.toggle}
                className="w-14 h-14 rounded-full bg-primary-gradient text-on-primary flex items-center justify-center shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined text-2xl">
                  {timer.isRunning ? "pause" : "play_arrow"}
                </span>
              </button>
              <button
                onClick={() => navigate("/tasks")}
                className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined">skip_next</span>
              </button>
            </div>
            <p className="text-xs text-on-surface-variant">Deep Focus Session</p>
          </div>
        </div>

        {/* Bento row 2 */}
        <div className="grid grid-cols-12 gap-6">
          {/* Daily Habits */}
          <div className="col-span-12 md:col-span-4 bg-surface-container-lowest rounded-2xl p-8 shadow-[0_12px_40px_rgba(42,52,57,0.04)]">
            <div className="flex justify-between items-center mb-5">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold">
                  Daily Habits
                </span>
                <h3 className="text-lg font-semibold mt-0.5">Consistency</h3>
              </div>
              <button
                onClick={() => navigate("/habits")}
                className="text-xs text-primary font-medium hover:underline"
              >
                View All
              </button>
            </div>
            {habits.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No habits yet. <button onClick={() => navigate("/habits")} className="text-primary underline">Add one</button>.</p>
            ) : (
              <ul className="space-y-3">
                {habits.slice(0, 4).map((habit) => {
                  const log = todayLogs.find((l) => l.habit_id === habit.id);
                  const done = log?.completed ?? false;
                  return (
                    <li
                      key={habit.id}
                      onClick={() => toggleHabit(habit.id)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${done ? "bg-primary border-primary" : "border-outline-variant group-hover:border-primary"}`}>
                        {done && <span className="material-symbols-outlined text-on-primary text-[12px]">check</span>}
                      </div>
                      <span className={`text-sm transition-all ${done ? "line-through text-on-surface-variant" : "text-on-surface"}`}>
                        {habit.title}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Tasks Focus List */}
          <div className="col-span-12 md:col-span-8 bg-surface-container-lowest rounded-2xl p-8 shadow-[0_12px_40px_rgba(42,52,57,0.04)]">
            <div className="flex justify-between items-center mb-5">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold">Tasks</span>
                <h3 className="text-lg font-semibold mt-0.5">Focus List</h3>
              </div>
              <button onClick={() => navigate("/tasks")} className="text-xs text-primary font-medium hover:underline">
                View All
              </button>
            </div>
            {todayTasks.length === 0 ? (
              <p className="text-sm text-on-surface-variant">
                All clear! <button onClick={() => navigate("/tasks")} className="text-primary underline">Add a task</button>.
              </p>
            ) : (
              <ul className="space-y-2">
                {todayTasks.map((task) => (
                  <li key={task.id} className="flex items-center gap-4 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority] ?? "bg-outline-variant"}`} />
                    <span className="flex-1 text-sm font-medium text-on-surface">{task.title}</span>
                    <span className="text-[10px] uppercase tracking-wider text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                      {task.priority}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
