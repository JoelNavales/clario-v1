import { useState } from "react";
import { AppShell } from "../../../components/layout/AppShell";
import { Button } from "../../../components/ui/Button";
import { getFromStorage, setToStorage, todayStr } from "../../../utils/localStorage";
import type { MoodEntry, MoodValue } from "../../../types/appTypes";

const MOODS: { value: MoodValue; icon: string; label: string }[] = [
  { value: "heavy", icon: "sentiment_very_dissatisfied", label: "Heavy" },
  { value: "low", icon: "sentiment_dissatisfied", label: "Low" },
  { value: "balanced", icon: "sentiment_neutral", label: "Balanced" },
  { value: "good", icon: "sentiment_satisfied", label: "Good" },
  { value: "radiant", icon: "sentiment_very_satisfied", label: "Radiant" },
];

const QUOTES = [
  '"Quiet the mind, and the soul will speak."',
  '"The present moment is the only moment available to us."',
  '"You cannot stop the waves, but you can learn to surf."',
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function MoodPage() {
  const today = todayStr();
  const [moods, setMoods] = useState<MoodEntry[]>(() =>
    getFromStorage<MoodEntry[]>("clario_moods", [])
  );
  const [selected, setSelected] = useState<MoodValue | null>(
    () => (moods.find((m) => m.mood_date === today)?.mood ?? null)
  );
  const [note, setNote] = useState(
    () => moods.find((m) => m.mood_date === today)?.note ?? ""
  );
  const [saved, setSaved] = useState(false);

  const quote = QUOTES[new Date().getDay() % QUOTES.length];

  function saveEntry() {
    if (!selected) return;
    const filtered = moods.filter((m) => m.mood_date !== today);
    const entry: MoodEntry = {
      id: Date.now().toString(),
      mood: selected,
      mood_date: today,
      note,
    };
    const updated = [...filtered, entry];
    setToStorage("clario_moods", updated);
    setMoods(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const recent = [...moods]
    .sort((a, b) => new Date(b.mood_date).getTime() - new Date(a.mood_date).getTime())
    .slice(0, 7);

  const MOOD_COLOR: Record<MoodValue, string> = {
    heavy: "text-error",
    low: "text-outline",
    balanced: "text-tertiary",
    good: "text-primary-dim",
    radiant: "text-primary",
  };

  return (
    <AppShell>
      {/* Top bar */}
      <header className="hidden md:flex sticky top-0 z-40 glass-nav justify-between items-center px-10 h-16 border-b border-surface-container-high/50">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold tracking-tighter text-slate-800">Clario</span>
        </div>
        <div className="text-right">
          <p className="text-sm text-on-surface-variant font-medium">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <p className="text-xs text-primary font-medium italic">{quote}</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-12 space-y-14">
        {/* Page title */}
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[12px] uppercase tracking-[0.2em] text-on-surface-variant font-semibold">
              Self Reflection
            </span>
            <h2 className="text-5xl font-bold tracking-tight text-on-surface mt-1">Mood &amp; Wellbeing</h2>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Check-in card */}
          <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest rounded-2xl p-6 md:p-10 shadow-[0_12px_40px_rgba(42,52,57,0.04)] flex flex-col gap-8">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">How are you feeling?</h3>
              <p className="text-on-surface-variant text-sm mt-1">Tap the icon that best matches your energy.</p>
            </div>

            <div className="flex justify-between items-center">
              {MOODS.map(({ value, icon, label }) => (
                <button
                  key={value}
                  onClick={() => setSelected(value)}
                  className="group flex flex-col items-center gap-2 transition-all hover:scale-110"
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                      selected === value
                        ? "bg-primary-container"
                        : "bg-surface-container-low group-hover:bg-primary-container"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-4xl transition-colors ${
                        selected === value ? "text-primary" : "text-on-surface-variant group-hover:text-primary"
                      }`}
                      style={{ fontVariationSettings: selected === value ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {icon}
                    </span>
                  </div>
                  <span className={`text-[10px] uppercase tracking-widest font-bold transition-opacity ${selected === value ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-100 text-on-surface-variant"}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>

            {/* Note */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold">
                Evening Reflection
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's on your mind tonight?"
                rows={3}
                className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm resize-none placeholder:text-on-surface-variant/50 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>

            <Button
              onClick={saveEntry}
              disabled={!selected}
              className="w-full"
            >
              {saved ? "✓ Logged!" : "Log Entry"}
            </Button>
          </div>

          {/* AI insight callout */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            <div className="bg-primary-container rounded-2xl p-8 shadow-[0_12px_40px_rgba(42,52,57,0.04)]">
              <p className="text-[11px] uppercase tracking-widest text-on-primary-container font-bold mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                AI Insight
              </p>
              <p className="text-on-primary-container font-semibold text-lg leading-snug">
                {moods.length >= 3
                  ? "We noticed a pattern in your recent entries. Keep tracking to uncover deeper correlations."
                  : "Log your mood for a few more days to unlock personalized insights."}
              </p>
              {moods.length >= 5 && (
                <button className="mt-4 text-sm text-primary font-semibold hover:underline flex items-center gap-1">
                  View correlation report
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              )}
            </div>

            {/* Recent entries */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">
                Recent Entries
              </h4>
              {recent.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No entries yet. Log your first mood above.</p>
              ) : (
                <ul className="space-y-2">
                  {recent.map((entry) => (
                    <li key={entry.id} className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-xl shadow-[0_1px_4px_rgba(42,52,57,0.04)]">
                      <span className={`material-symbols-outlined text-2xl ${MOOD_COLOR[entry.mood]}`}>
                        {MOODS.find((m) => m.value === entry.mood)?.icon}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-on-surface capitalize">{entry.mood}</p>
                        {entry.note && <p className="text-xs text-on-surface-variant mt-0.5 truncate">{entry.note}</p>}
                      </div>
                      <span className="text-xs text-on-surface-variant shrink-0">{formatDate(entry.mood_date)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
