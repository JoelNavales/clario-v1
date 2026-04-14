import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { AppShell } from "../../../components/layout/AppShell";
import { Button } from "../../../components/ui/Button";
import { getFromStorage, setToStorage } from "../../../utils/localStorage";

interface JournalEntry {
  id: string;
  content: string;
  createdAt: string;
}

const JOURNAL_KEY = "clario_journal_entries";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(() =>
    getFromStorage<JournalEntry[]>(JOURNAL_KEY, [])
  );
  const [draft, setDraft] = useState("");

  function saveEntry() {
    const text = draft.trim();
    if (!text) return;

    const next: JournalEntry = {
      id: Date.now().toString(),
      content: text,
      createdAt: new Date().toISOString(),
    };

    const updated = [next, ...entries];
    setEntries(updated);
    setToStorage(JOURNAL_KEY, updated);
    setDraft("");
  }

  const totalWords = useMemo(
    () => entries.reduce((sum, entry) => sum + entry.content.split(/\s+/).filter(Boolean).length, 0),
    [entries]
  );

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
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-on-surface">Journal</h2>
            <p className="text-on-surface-variant">Capture small reflections before they fade.</p>
          </div>
          <div className="bg-surface-container-low rounded-xl px-4 py-3 text-right">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Total Words</p>
            <p className="text-xl font-semibold text-on-surface">{totalWords}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_12px_rgba(42,52,57,0.04)] space-y-4">
          <label className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold block">
            New Entry
          </label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={6}
            placeholder="How are you feeling today?"
            className="w-full rounded-xl bg-surface-container-low p-4 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
          />
          <div className="flex justify-end">
            <Button onClick={saveEntry} disabled={!draft.trim()}>
              Save Entry
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {entries.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-surface-container p-8 text-center text-on-surface-variant">
              No journal entries yet.
            </div>
          )}
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_4px_12px_rgba(42,52,57,0.04)]"
            >
              <p className="text-xs text-on-surface-variant mb-3">
                {new Date(entry.createdAt).toLocaleString([], {
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-sm leading-relaxed text-on-surface whitespace-pre-wrap">{entry.content}</p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
