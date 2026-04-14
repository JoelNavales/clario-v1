import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setToStorage } from "../../../utils/localStorage";
import { useTheme, type ThemeValue } from "../../../context/ThemeContext";
import { Button } from "../../../components/ui/Button";
import DashboardSvg from "../../../assets/Dashboard.svg";

const THEMES: { name: string; value: ThemeValue; swatch: string; label: string }[] = [
  { name: "Indigo", value: "indigo", swatch: "bg-[#494bd6]", label: "Default" },
  { name: "Blue",   value: "blue",   swatch: "bg-[#1d4ed8]", label: "Ocean" },
  { name: "Green",  value: "green",  swatch: "bg-[#15803d]", label: "Forest" },
  { name: "Pink",   value: "pink",   swatch: "bg-[#db2777]", label: "Rose" },
  { name: "Slate",  value: "slate",  swatch: "bg-[#334155]", label: "Midnight" },
];

type Step = "name" | "theme" | "done";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { theme: selectedTheme, setTheme } = useTheme();

  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");

  function handleNameNext() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setToStorage("clario_profile", { name: trimmed });
    setStep("theme");
  }

  function handleThemeNext() {
    setStep("done");
  }

  function handleFinish() {
    setToStorage("clario_onboarded", true);
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Progress dots */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 flex gap-2">
        {(["name", "theme", "done"] as Step[]).map((s) => (
          <span
            key={s}
            className={`inline-block h-2 rounded-full transition-all duration-300 ${
              s === step
                ? "bg-primary w-6"
                : step === "done" || (step === "theme" && s === "name")
                ? "bg-primary/40 w-2"
                : "bg-surface-container-highest w-2"
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-md">
        {/* ── Step 1: Name ── */}
        {step === "name" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3">
              <div className="mb-6 h-14 w-56 sm:h-20 sm:w-80 overflow-hidden rounded-md">
                <img
                  src={DashboardSvg}
                  alt="Clario"
                  className="h-full w-full object-cover [clip-path:inset(5%_4%_1%_4%)]"
                />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                Welcome to Clario
              </h1>
              <p className="text-on-surface-variant text-base leading-relaxed">
                Your personal life dashboard. Let's get you set up in just a few seconds.
              </p>
            </div>

            <div className="space-y-2">
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
                className="w-full bg-surface-container-low rounded-2xl px-5 py-3.5 text-base text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={!name.trim()}
              onClick={handleNameNext}
            >
              Continue
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Button>
          </div>
        )}

        {/* ── Step 2: Theme ── */}
        {step === "theme" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">palette</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                Pick your vibe
              </h1>
              <p className="text-on-surface-variant text-base leading-relaxed">
                Choose a color theme that feels right. You can always change it later in Settings.
              </p>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {THEMES.map((t) => {
                const isSelected = selectedTheme === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`group flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 border-2 ${
                      isSelected
                        ? "border-primary bg-primary-container/60"
                        : "border-transparent hover:border-surface-container-highest bg-surface-container-low"
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-full ${t.swatch} ${
                        isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                      } transition-all`}
                    />
                    <span className="text-[10px] font-semibold text-on-surface-variant leading-tight text-center">
                      {t.label}
                    </span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-primary text-[14px] -mt-1">
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <Button size="lg" className="w-full" onClick={handleThemeNext}>
              Looks good
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Button>
          </div>
        )}

        {/* ── Step 3: Done ── */}
        {step === "done" && (
          <div className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-3xl bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-5xl">celebration</span>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                You're all set, {name.trim()}!
              </h1>
              <p className="text-on-surface-variant text-base leading-relaxed">
                Clario is ready. Start tracking your mood, habits, and tasks — all in one place.
              </p>
            </div>

            <Button size="lg" className="w-full" onClick={handleFinish}>
              Open Clario
              <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
