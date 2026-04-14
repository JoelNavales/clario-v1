import { useState } from "react";
import { AppShell } from "../../../components/layout/AppShell";
import { Button } from "../../../components/ui/Button";
import { getFromStorage, setToStorage } from "../../../utils/localStorage";
import { useTheme, type ThemeValue } from "../../../context/ThemeContext";
import type { Profile } from "../../../types/appTypes";

const THEMES = [
  { name: "Indigo", value: "indigo" as ThemeValue, swatch: "bg-[#494bd6]", label: "Default" },
  { name: "Blue", value: "blue" as ThemeValue, swatch: "bg-[#1d4ed8]", label: "Ocean" },
  { name: "Green", value: "green" as ThemeValue, swatch: "bg-[#15803d]", label: "Forest" },
  { name: "Pink", value: "pink" as ThemeValue, swatch: "bg-[#db2777]", label: "Rose" },
  { name: "Slate", value: "slate" as ThemeValue, swatch: "bg-[#334155]", label: "Midnight" },
];

export default function SettingsPage() {
  const { theme: selectedTheme, setTheme } = useTheme();
  const [profile, setProfile] = useState<Profile>(() =>
    getFromStorage<Profile>("clario_profile", { name: "You", email: "" })
  );
  const [draft, setDraft] = useState<Profile>({ ...profile });
  const [saved, setSaved] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  function saveProfile() {
    setToStorage("clario_profile", draft);
    setProfile(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function discardChanges() {
    setDraft({ ...profile });
  }

  function pickTheme(value: ThemeValue) {
    setTheme(value);
    // collapse after a brief moment so the user sees the selection
    setTimeout(() => setThemeOpen(false), 400);
  }

  const activeTheme = THEMES.find((t) => t.value === selectedTheme) ?? THEMES[0];

  return (
    <AppShell>
      {/* Top bar */}
      <header className="hidden md:flex sticky top-0 z-40 glass-nav items-center justify-between px-10 h-16 border-b border-surface-container-high/50">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-on-surface">Settings</h2>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 md:px-10 py-6 md:py-12 space-y-8">
            {/* Profile section */}
            <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_4px_12px_rgba(42,52,57,0.04)]">
              <h3 className="text-base font-bold text-on-surface mb-6">Profile Settings</h3>

              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-2xl">
                  {(draft.name || "Y").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">Your Avatar</p>
                  <p className="text-xs text-on-surface-variant">Initials generated from your display name.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={draft.email ?? ""}
                    onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </section>

            {/* Preferences / Notifications */}
            <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_4px_12px_rgba(42,52,57,0.04)]">
              <h3 className="text-base font-bold text-on-surface mb-6">Preferences</h3>
              <div className="space-y-5">
                {[
                  { label: "Daily Reminders", desc: "Gentle nudges for your morning routine and mood check-in.", on: true },
                  { label: "Weekly Reports", desc: "A summary of your focus hours and wellness insights.", on: true },
                  { label: "Focus Alerts", desc: "Notifications for Deep Focus sessions and breaks.", on: false },
                ].map(({ label, desc, on }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-on-surface">{label}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{desc}</p>
                    </div>
                    <div
                      className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${
                        on ? "bg-primary" : "bg-surface-container-high"
                      } relative`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                          on ? "left-6" : "left-1"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Theme picker (collapsible) */}
            <section className="bg-surface-container-lowest rounded-2xl shadow-[0_4px_12px_rgba(42,52,57,0.04)] overflow-hidden">
              {/* Header row — always visible */}
              <button
                onClick={() => setThemeOpen((v) => !v)}
                className="w-full flex items-center justify-between px-8 py-5 text-left transition-colors hover:bg-surface-container-low/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full ${activeTheme.swatch} shadow-sm`} />
                  <div>
                    <p className="text-sm font-semibold text-on-surface">Theme</p>
                    <p className="text-xs text-on-surface-variant">{activeTheme.name} — {activeTheme.label}</p>
                  </div>
                </div>
                <span
                  className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${
                    themeOpen ? "rotate-180" : "rotate-0"
                  }`}
                >
                  expand_more
                </span>
              </button>

              {/* Collapsible grid */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  themeOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-8 pb-7 pt-1">
                  <p className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold mb-4">
                    Choose a Theme
                  </p>
                  <div className="grid grid-cols-5 gap-3">
                    {THEMES.map((theme) => {
                      const isSelected = selectedTheme === theme.value;
                      return (
                        <button
                          key={theme.value}
                          onClick={() => pickTheme(theme.value)}
                          className="flex flex-col items-center gap-2 group"
                        >
                          <div
                            className={`w-10 h-10 rounded-full ${theme.swatch} transition-all duration-200 ${
                              isSelected
                                ? "ring-2 ring-offset-2 ring-primary scale-110 shadow-md"
                                : "group-hover:scale-105"
                            }`}
                          >
                            {isSelected && (
                              <span className="flex items-center justify-center h-full material-symbols-outlined text-white text-[16px]">
                                check
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-medium transition-colors ${
                              isSelected ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface"
                            }`}
                          >
                            {theme.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* Action buttons */}
            <div className="flex justify-end gap-4 pt-2">
              <Button variant="secondary" onClick={discardChanges}>
                Discard Changes
              </Button>
              <Button onClick={saveProfile}>
                {saved ? "✓ Saved!" : "Save Preferences"}
              </Button>
            </div>
      </div>
    </AppShell>
  );
}
