import { motion } from "framer-motion";

interface StreakTileProps {
  label: string;
  icon: string;
  count: number;
  index: number;
}

function StreakTile({ label, icon, count, index }: StreakTileProps) {
  const isAlive = count > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 + index * 0.07, duration: 0.38, ease: "easeOut" }}
      className="relative col-span-12 md:col-span-4 bg-surface-container-lowest rounded-2xl p-6 shadow-[0_12px_40px_rgba(42,52,57,0.04)] overflow-hidden"
    >
      {/* Watermark counter */}
      <motion.span
        key={count}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute -bottom-4 -right-2 text-[120px] font-black leading-none tabular-nums select-none pointer-events-none text-on-surface/[0.05]"
        aria-hidden="true"
      >
        {count}
      </motion.span>

      {/* Icon */}
      <div className="w-10 h-10 rounded-2xl bg-primary-container flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
      </div>

      {/* Category label */}
      <span className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold">
        {label}
      </span>

      {/* Count + "days" */}
      <div className="flex items-baseline gap-2 mt-1">
        <motion.span
          key={count}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 360, damping: 22 }}
          className="text-5xl font-bold leading-none tabular-nums text-on-surface"
        >
          {count}
        </motion.span>
        <span className="text-base text-on-surface-variant font-medium">days</span>
        {isAlive && count >= 3 && (
          <motion.span
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="text-base"
          >
            🔥
          </motion.span>
        )}
      </div>

      {/* Status text */}
      <p className="text-sm text-on-surface-variant mt-1">
        {isAlive
          ? count >= 7
            ? "You're on a roll — keep going!"
            : `${count} day streak — keep it up!`
          : "Start your streak today"}
      </p>
    </motion.div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface StreakCardProps {
  moodStreak: number;
  habitStreak: number;
  taskStreak: number;
}

const TILES = [
  { key: "mood",  label: "Mood",   icon: "auto_awesome" },
  { key: "habit", label: "Habits", icon: "published_with_changes" },
  { key: "task",  label: "Tasks",  icon: "check_circle" },
] as const;

// ── Component — renders 3 independent col-span-4 bento cards ─────────────────

export function StreakCard({ moodStreak, habitStreak, taskStreak }: StreakCardProps) {
  const counts: Record<string, number> = {
    mood:  moodStreak,
    habit: habitStreak,
    task:  taskStreak,
  };

  return (
    <>
      {TILES.map((t, i) => (
        <StreakTile
          key={t.key}
          label={t.label}
          icon={t.icon}
          count={counts[t.key]!}
          index={i}
        />
      ))}
    </>
  );
}
