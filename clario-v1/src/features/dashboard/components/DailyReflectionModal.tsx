import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getFromStorage, setToStorage, todayStr } from "../../../utils/localStorage";
import type {
  MoodValue,
  MoodEntry,
  Habit,
  HabitLog,
  Task,
  DailyReflection,
} from "../../../types/appTypes";
import { getMoodScore } from "../../insights/services/aiService";

// ── Types ────────────────────────────────────────────────────────────────────

type ReflectionStep = "feeling" | "summary" | "done";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

// ── Mood config ───────────────────────────────────────────────────────────────

const MOODS: { value: MoodValue; emoji: string; label: string }[] = [
  { value: "heavy",    emoji: "😔", label: "Heavy"    },
  { value: "low",      emoji: "😐", label: "Low"      },
  { value: "balanced", emoji: "😊", label: "Balanced" },
  { value: "good",     emoji: "😌", label: "Good"     },
  { value: "radiant",  emoji: "🤩", label: "Radiant"  },
];

// ── AI reflection ─────────────────────────────────────────────────────────────

function generateReflection(
  mood: MoodValue,
  tasksCompleted: number,
  habitsCompleted: number,
  totalHabits: number,
  userName: string
): string {
  const score = getMoodScore(mood);
  const habitRatio = totalHabits > 0 ? habitsCompleted / totalHabits : 0;

  // Build a contextual reflection based on the day's data
  const parts: string[] = [];

  // Mood acknowledgement
  if (score > 0) {
    parts.push(`It sounds like today felt really good, ${userName} — that kind of energy is worth celebrating.`);
  } else if (score === 0) {
    parts.push(`A balanced day is quietly powerful, ${userName}. Steady is sustainable.`);
  } else {
    parts.push(`Heavy days are real, ${userName}. The fact that you showed up at all matters more than you think.`);
  }

  // Habits insight
  if (habitRatio >= 0.8) {
    parts.push(`You crushed your habits today (${habitsCompleted}/${totalHabits}) — that consistency compounds over time.`);
  } else if (habitRatio >= 0.5) {
    parts.push(`You completed ${habitsCompleted} of ${totalHabits} habits. Progress, not perfection.`);
  } else if (totalHabits > 0) {
    parts.push(`Habits felt harder today (${habitsCompleted}/${totalHabits} done). Tomorrow is a fresh slate.`);
  }

  // Tasks insight
  if (tasksCompleted >= 3) {
    parts.push(`You checked off ${tasksCompleted} tasks — a productive close to the day.`);
  } else if (tasksCompleted === 1 || tasksCompleted === 2) {
    parts.push(`Getting ${tasksCompleted} task${tasksCompleted > 1 ? "s" : ""} done is still movement forward.`);
  } else {
    parts.push(`Even on days with no tasks crossed off, rest and recovery count as progress.`);
  }

  // Closing encouragement
  const closings = [
    "Rest well — tomorrow you get another chance.",
    "Be kind to yourself tonight.",
    "Small steps still move you forward.",
    "You're doing better than you give yourself credit for.",
    "Reflect, reset, and come back stronger.",
  ];
  parts.push(closings[Math.floor(Math.abs(score + habitRatio * 3)) % closings.length]);

  return parts.join(" ");
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DailyReflectionModal({ isOpen, onClose, userName }: Props) {
  const [step, setStep] = useState<ReflectionStep>("feeling");
  const [dayFeeling, setDayFeeling] = useState<MoodValue | null>(null);
  const [reflection, setReflection] = useState<DailyReflection | null>(null);

  // Reset step when reopened
  useEffect(() => {
    if (isOpen) {
      setStep("feeling");
      setDayFeeling(null);
      setReflection(null);
    }
  }, [isOpen]);

  function handleFeelingSelect(mood: MoodValue) {
    setDayFeeling(mood);

    const today = todayStr();
    const habits   = getFromStorage<Habit[]>("clario_habits", []);
    const habitLogs = getFromStorage<HabitLog[]>("clario_habit_logs", []);
    const tasks     = getFromStorage<Task[]>("clario_tasks", []);
    const moods     = getFromStorage<MoodEntry[]>("clario_moods", []);

    const todayHabitLogs  = habitLogs.filter((l) => l.log_date === today);
    const habitsCompleted = todayHabitLogs.filter((l) => l.completed).length;
    const totalHabits     = habits.length;
    const tasksCompleted  = tasks.filter(
      (t) => t.completed && t.completed_at?.startsWith(today)
    ).length;

    // Also count mood entries for today
    void moods;

    const aiReflection = generateReflection(
      mood,
      tasksCompleted,
      habitsCompleted,
      totalHabits,
      userName
    );

    const entry: DailyReflection = {
      date: today,
      dayFeeling: mood,
      aiReflection,
      tasksCompleted,
      habitsCompleted,
      totalHabits,
    };

    // Persist
    const existing = getFromStorage<DailyReflection[]>("clario_reflections", []);
    const updated  = [...existing.filter((r) => r.date !== today), entry];
    setToStorage("clario_reflections", updated);

    setReflection(entry);
    setStep("summary");
  }

  function handleDone() {
    setStep("done");
    setTimeout(onClose, 400);
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit:   { opacity: 0 },
  };

  const cardVariants = {
    hidden:  { opacity: 0, y: 40, scale: 0.97 },
    visible: { opacity: 1, y: 0,  scale: 1,   transition: { type: "spring" as const, stiffness: 280, damping: 24 } },
    exit:    { opacity: 0, y: -20, scale: 0.97, transition: { duration: 0.2 } },
  };

  const stepVariants = {
    enter:  { x: 40,  opacity: 0 },
    center: { x: 0,   opacity: 1, transition: { duration: 0.3, ease: "easeOut" as const } },
    exit:   { x: -40, opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            className="relative z-10 w-full max-w-md bg-background rounded-3xl shadow-2xl overflow-hidden"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header strip */}
            <div className="bg-primary-container/60 px-7 pt-7 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">auto_stories</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">End of Day</p>
                    <h2 className="text-lg font-bold text-on-surface leading-tight">Daily Reflection</h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-on-surface/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Step content */}
            <div className="px-7 py-6 min-h-[280px] flex flex-col justify-between">
              <AnimatePresence mode="wait">

                {/* Step 1: How did your day feel? */}
                {step === "feeling" && (
                  <motion.div
                    key="feeling"
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-6"
                  >
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold text-on-surface">How did your day feel?</h3>
                      <p className="text-sm text-on-surface-variant">Pick the mood that best captures today.</p>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {MOODS.map((m) => (
                        <motion.button
                          key={m.value}
                          onClick={() => handleFeelingSelect(m.value)}
                          whileHover={{ scale: 1.1, y: -4 }}
                          whileTap={{ scale: 0.92 }}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-surface-container-low hover:bg-primary-container/50 transition-colors border-2 border-transparent hover:border-primary/20"
                        >
                          <span className="text-3xl">{m.emoji}</span>
                          <span className="text-[10px] font-semibold text-on-surface-variant">{m.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Summary */}
                {step === "summary" && reflection && (
                  <motion.div
                    key="summary"
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-5"
                  >
                    {/* Day feel */}
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {MOODS.find((m) => m.value === dayFeeling)?.emoji}
                      </span>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Today felt</p>
                        <p className="text-base font-semibold text-on-surface capitalize">{dayFeeling}</p>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-surface-container-low rounded-2xl px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-on-surface leading-none">{reflection.tasksCompleted}</p>
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-wide font-semibold mt-0.5">Tasks done</p>
                        </div>
                      </div>
                      <div className="bg-surface-container-low rounded-2xl px-4 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-[16px]">published_with_changes</span>
                        </div>
                        <div>
                          <p className="text-xl font-bold text-on-surface leading-none">
                            {reflection.habitsCompleted}/{reflection.totalHabits}
                          </p>
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-wide font-semibold mt-0.5">Habits done</p>
                        </div>
                      </div>
                    </div>

                    {/* AI reflection */}
                    <div className="bg-primary-container/30 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[16px]">auto_awesome</span>
                        <p className="text-[10px] uppercase tracking-widest text-primary font-bold">AI Reflection</p>
                      </div>
                      <p className="text-sm text-on-surface leading-relaxed">{reflection.aiReflection}</p>
                    </div>

                    <motion.button
                      onClick={handleDone}
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 1, scale: 0.98 }}
                      className="w-full bg-primary-gradient text-on-primary py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">nights_stay</span>
                      Close & Rest Well
                    </motion.button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
