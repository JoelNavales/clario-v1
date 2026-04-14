import { useState } from "react";
import { NavLink } from "react-router-dom";
import { AppShell } from "../../../components/layout/AppShell";
import { Button } from "../../../components/ui/Button";
import { getFromStorage, setToStorage } from "../../../utils/localStorage";

const MANTRA_KEY = "clario_mantra";

const PRESET_MANTRAS = [
  "I do small things with consistency.",
  "I can pause, breathe, and reset.",
  "Progress matters more than perfection.",
  "I choose clarity over noise.",
  "I am building a calm, focused day.",
];

export default function MantraPage() {
  const [mantra, setMantra] = useState(() => getFromStorage<string>(MANTRA_KEY, PRESET_MANTRAS[0]));
  const [draft, setDraft] = useState(mantra);
  const [saved, setSaved] = useState(false);

  function saveMantra() {
    const next = draft.trim();
    if (!next) return;
    setMantra(next);
    setToStorage(MANTRA_KEY, next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <AppShell>
      <header className="hidden md:flex sticky top-0 z-40 glass-nav justify-between items-center px-12 py-5 border-b border-surface-container-high/50">
        <nav className="flex gap-8">
          <NavLink
            to="/insights/mantra"
            className={({ isActive }) =>
              isActive
                ? "text-primary border-b-2 border-primary pb-0.5 font-semibold tracking-tight text-sm"
                : "text-slate-500 font-semibold tracking-tight text-sm"
            }
          >
            Mantra
          </NavLink>
          <NavLink
            to="/insights/journal"
            className={({ isActive }) =>
              isActive
                ? "text-primary border-b-2 border-primary pb-0.5 font-semibold tracking-tight text-sm"
                : "text-slate-500 font-semibold tracking-tight text-sm"
            }
          >
            Journal
          </NavLink>
          <NavLink
            to="/insights"
            end
            className={({ isActive }) =>
              isActive
                ? "text-primary border-b-2 border-primary pb-0.5 font-semibold tracking-tight text-sm"
                : "text-slate-500 font-semibold tracking-tight text-sm"
            }
          >
            Focus
          </NavLink>
        </nav>
      </header>

      <section className="px-4 md:px-12 py-6 md:py-10 max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-on-surface">Mantra</h2>
          <p className="text-on-surface-variant">Pick words that anchor your day.</p>
        </div>

        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6">
          <p className="text-[11px] uppercase tracking-widest text-primary font-bold mb-3">Current Mantra</p>
          <p className="text-2xl md:text-3xl font-semibold leading-tight text-on-surface">{mantra}</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_12px_rgba(42,52,57,0.04)] space-y-4">
          <label className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold block">
            Write Your Own
          </label>
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Type a mantra"
          />
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-on-surface-variant">
              {saved ? "Saved" : "Pick a preset or write your own mantra."}
            </span>
            <Button onClick={saveMantra} disabled={!draft.trim()}>Save Mantra</Button>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold">Presets</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PRESET_MANTRAS.map((preset) => (
              <button
                key={preset}
                onClick={() => setDraft(preset)}
                className="text-left rounded-xl bg-surface-container-low hover:bg-surface-container px-4 py-3 text-sm text-on-surface transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
