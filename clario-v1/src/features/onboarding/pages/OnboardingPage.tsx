import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { setToStorage } from "../../../utils/localStorage";
import { useTheme, type ThemeValue } from "../../../context/ThemeContext";
import { Button } from "../../../components/ui/Button";
import { ClarioLogo } from "../../../components/ui/ClarioLogo";

// ── Constants ──────────────────────────────────────────────────────────────

const THEMES: { name: string; value: ThemeValue; swatch: string; label: string }[] = [
  { name: "Indigo", value: "indigo", swatch: "bg-[#494bd6]", label: "Default" },
  { name: "Blue",   value: "blue",   swatch: "bg-[#1d4ed8]", label: "Ocean" },
  { name: "Green",  value: "green",  swatch: "bg-[#15803d]", label: "Forest" },
  { name: "Pink",   value: "pink",   swatch: "bg-[#db2777]", label: "Rose" },
  { name: "Slate",  value: "slate",  swatch: "bg-[#334155]", label: "Midnight" },
];

const STEPS = ["name", "theme", "done"] as const;
type Step = (typeof STEPS)[number];

// ── Animation variants ─────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 56, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -56, opacity: 0 }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const fadeUp = {
  hidden: { y: 18, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.42, ease: "easeOut" as const } },
};

// ── Background decoration ──────────────────────────────────────────────────

function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Large blob — top right */}
      <motion.div
        className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-primary opacity-[0.09] blur-3xl"
        animate={{ y: [0, -28, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Large blob — bottom left */}
      <motion.div
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-primary opacity-[0.07] blur-3xl"
        animate={{ y: [0, 22, 0], scale: [1, 1.09, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      {/* Small blob — mid left */}
      <motion.div
        className="absolute top-1/3 -left-10 w-32 h-32 rounded-full bg-primary opacity-[0.06] blur-2xl"
        animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />

      {/* Floating square — top right quadrant */}
      <motion.div
        className="absolute top-[18%] right-[14%] w-10 h-10 rounded-2xl bg-primary opacity-[0.1] blur-[2px]"
        animate={{ y: [0, -18, 0], rotate: [0, 14, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      {/* Floating square — bottom left quadrant */}
      <motion.div
        className="absolute bottom-[28%] left-[12%] w-7 h-7 rounded-xl bg-primary opacity-[0.1] blur-[2px]"
        animate={{ y: [0, 16, 0], rotate: [0, -12, 0] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut", delay: 3.2 }}
      />

      {/* Tiny dot — top left */}
      <motion.div
        className="absolute top-[22%] left-[26%] w-3 h-3 rounded-full bg-primary opacity-25"
        animate={{ y: [0, -14, 0], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Tiny dot — bottom right */}
      <motion.div
        className="absolute bottom-[30%] right-[22%] w-2.5 h-2.5 rounded-full bg-primary opacity-20"
        animate={{ y: [0, 12, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
      />
      {/* Tiny dot — center right */}
      <motion.div
        className="absolute top-1/2 right-[10%] w-2 h-2 rounded-full bg-primary opacity-15"
        animate={{ y: [0, -10, 0], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
    </div>
  );
}

// ── Progress dots ──────────────────────────────────────────────────────────

function ProgressDots({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 flex gap-2 items-center z-10">
      {STEPS.map((s, i) => (
        <motion.span
          key={s}
          className={`inline-block h-2 rounded-full ${
            i <= stepIndex ? "bg-primary" : "bg-on-surface/20"
          }`}
          animate={{ width: i === stepIndex ? 24 : 8, opacity: i <= stepIndex ? 1 : 0.35 }}
          initial={{ width: 8, opacity: i === 0 ? 1 : 0.35 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
        />
      ))}
    </div>
  );
}

// ── Shared input style ─────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-2xl border border-on-surface/[0.14] bg-surface px-5 py-3.5 text-base " +
  "text-on-surface placeholder:text-on-surface/35 shadow-sm " +
  "focus:outline-none " +
  "transition-all duration-200";

// ── Page ─────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { theme: selectedTheme, setTheme } = useTheme();
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [direction, setDirection] = useState(1);

  const stepIndex = STEPS.indexOf(step);

  function goForward(next: Step) {
    setDirection(1);
    setStep(next);
  }

  function handleNameNext() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setToStorage("clario_profile", { name: trimmed });
    goForward("theme");
  }

  function handleFinish() {
    setToStorage("clario_onboarded", true);
    navigate("/", { replace: true });
  }

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center px-4">
      <BackgroundOrbs />
      <ProgressDots stepIndex={stepIndex} />

      <div className="relative z-10 w-full max-w-md overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial={step === "name" ? false : "enter"}
            animate="center"
            exit="exit"
            className="w-full"
            style={{ willChange: "transform, opacity" }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
          >

            {/* ── Step 1: Name ─────────────────────────────────────────── */}
            {step === "name" && (
              <motion.div className="min-h-[28rem] space-y-8" variants={stagger} initial="hidden" animate="visible">
                <motion.div variants={fadeUp} className="space-y-3">
                  <div className="mb-6 h-14 w-56 sm:h-20 sm:w-80 overflow-hidden">
                    <ClarioLogo className="h-full w-full" />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                    Welcome to Clario
                  </h1>
                  <p className="text-on-surface-variant text-base leading-relaxed">
                    Your personal life dashboard. Let's get you set up in just a few seconds.
                  </p>
                </motion.div>

                <motion.div variants={fadeUp} className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold block">
                    What should we call you?
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={name}
                    maxLength={40}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNameNext()}
                    placeholder="Enter your name"
                    className={inputCls}
                  />
                </motion.div>

                <motion.div variants={fadeUp}>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ y: 1, scale: 0.98 }}>
                    <Button size="lg" className="w-full" disabled={!name.trim()} onClick={handleNameNext}>
                      Continue
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* ── Step 2: Theme ─────────────────────────────────────────── */}
            {step === "theme" && (
              <motion.div className="min-h-[28rem] space-y-8" variants={stagger} initial="hidden" animate="visible">
                <motion.div variants={fadeUp} className="space-y-3">
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center mb-6"
                    initial={{ scale: 0.5, rotate: -12, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.08 }}
                  >
                    <span className="material-symbols-outlined text-primary text-3xl">palette</span>
                  </motion.div>
                  <h1 className="text-3xl font-bold tracking-tight text-on-surface">Pick your vibe</h1>
                  <p className="text-on-surface-variant text-base leading-relaxed">
                    Choose a color theme that feels right. You can always change it later in Settings.
                  </p>
                </motion.div>

                <motion.div variants={fadeUp} className="grid grid-cols-5 gap-3">
                  {THEMES.map((t, i) => {
                    const isSelected = selectedTheme === t.value;
                    return (
                      <motion.button
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.14 + i * 0.055, duration: 0.32, ease: "easeOut" }}
                        whileHover={{ scale: 1.08, y: -3 }}
                        whileTap={{ scale: 0.93 }}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-colors duration-200 ${
                          isSelected
                            ? "border-primary bg-primary-container/60"
                            : "border-transparent hover:border-on-surface/15 bg-surface-container-low"
                        }`}
                      >
                        <span
                          className={`w-9 h-9 rounded-full ${t.swatch} transition-all ${
                            isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                          }`}
                        />
                        <span className="text-[10px] font-semibold text-on-surface-variant leading-tight text-center">
                          {t.label}
                        </span>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.span
                              className="material-symbols-outlined text-primary text-[14px] -mt-1"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 380, damping: 22 }}
                            >
                              check_circle
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </motion.div>

                <motion.div variants={fadeUp}>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ y: 1, scale: 0.98 }}>
                    <Button size="lg" className="w-full" onClick={() => goForward("done")}>
                      Looks good
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* ── Step 3: Done ──────────────────────────────────────────── */}
            {step === "done" && (
              <motion.div className="min-h-[28rem] space-y-8 text-center" variants={stagger} initial="hidden" animate="visible">
                <motion.div className="flex justify-center" variants={fadeUp}>
                  <motion.div
                    className="w-20 h-20 rounded-3xl bg-primary-container flex items-center justify-center"
                    initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.1 }}
                  >
                    <motion.span
                      className="material-symbols-outlined text-primary text-5xl"
                      animate={{ rotate: [0, -12, 12, -7, 7, 0] }}
                      transition={{ delay: 0.6, duration: 0.65, ease: "easeInOut" }}
                    >
                      celebration
                    </motion.span>
                  </motion.div>
                </motion.div>

                <motion.div variants={fadeUp} className="space-y-3">
                  <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                    You're all set, {name.trim()}!
                  </h1>
                  <p className="text-on-surface-variant text-base leading-relaxed">
                    Clario is ready. Start tracking your mood, habits, and tasks — all in one place.
                  </p>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <motion.div whileHover={{ y: -2 }} whileTap={{ y: 1, scale: 0.98 }}>
                    <Button size="lg" className="w-full" onClick={handleFinish}>
                      Open Clario
                      <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}


