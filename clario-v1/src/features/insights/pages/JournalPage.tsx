import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "../../../components/layout/AppShell";
import { getFromStorage, setToStorage } from "../../../utils/localStorage";

interface JournalEntry {
  id: string;
  content: string;
  prompt: string | null;
  createdAt: string;
}

const JOURNAL_KEY = "clario_journal_entries";

const PROMPTS = [
  { id: "stress",    icon: "🌧️", label: "What stressed you today?" },
  { id: "grateful",  icon: "🙏", label: "What are you grateful for?" },
  { id: "smile",     icon: "😊", label: "What made you smile?" },
  { id: "different", icon: "🔄", label: "What would you do differently?" },
  { id: "win",       icon: "🏆", label: "What was your win today?" },
  { id: "free",      icon: "✏️", label: "Free write" },
] as const;

// ── DeleteConfirm ─────────────────────────────────────────────────────────────

function DeleteConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-3 mt-3 p-3 rounded-xl bg-error-container/30 border border-error/20"
    >
      <p className="text-sm text-on-surface flex-1">Delete this entry?</p>
      <button
        onClick={onConfirm}
        className="text-xs font-semibold text-error bg-error/10 hover:bg-error/20 px-3 py-1.5 rounded-lg transition-colors"
      >
        Delete
      </button>
      <button
        onClick={onCancel}
        className="text-xs font-semibold text-on-surface-variant hover:bg-surface-container px-3 py-1.5 rounded-lg transition-colors"
      >
        Cancel
      </button>
    </motion.div>
  );
}

// ── EntryCard ─────────────────────────────────────────────────────────────────

interface EntryCardProps {
  entry: JournalEntry;
  onSaveEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

function EntryCard({ entry, onSaveEdit, onDelete }: EntryCardProps) {
  const [editing, setEditing]     = useState(false);
  const [editText, setEditText]   = useState(entry.content);
  const [confirming, setConfirming] = useState(false);

  const prompt = PROMPTS.find((p) => p.id === entry.prompt);

  function handleSave() {
    const trimmed = editText.trim();
    if (!trimmed) return;
    onSaveEdit(entry.id, trimmed);
    setEditing(false);
  }

  function handleCancel() {
    setEditText(entry.content);
    setEditing(false);
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_4px_12px_rgba(42,52,57,0.04)]"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {prompt && prompt.id !== "free" && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-primary-container text-primary px-2.5 py-1 rounded-full">
              <span>{prompt.icon}</span>
              {prompt.label}
            </span>
          )}
          <span className="text-xs text-on-surface-variant">
            {new Date(entry.createdAt).toLocaleString([], {
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Action buttons */}
        {!editing && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => { setEditing(true); setConfirming(false); }}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
              title="Edit"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button
              onClick={() => { setConfirming((c) => !c); setEditing(false); }}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-error transition-colors"
              title="Delete"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Content / edit mode */}
      {editing ? (
        <div className="space-y-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={5}
            autoFocus
            className="w-full rounded-xl bg-surface-container-low border border-outline-variant p-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none resize-y"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="text-xs font-semibold text-on-surface-variant hover:bg-surface-container px-3 py-1.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!editText.trim()}
              className="text-xs font-semibold bg-primary text-on-primary disabled:opacity-40 px-4 py-1.5 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-on-surface whitespace-pre-wrap">{entry.content}</p>
      )}

      {/* Delete confirm */}
      <AnimatePresence>
        {confirming && (
          <DeleteConfirm
            onConfirm={() => onDelete(entry.id)}
            onCancel={() => setConfirming(false)}
          />
        )}
      </AnimatePresence>
    </motion.article>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(() =>
    getFromStorage<JournalEntry[]>(JOURNAL_KEY, [])
  );
  const [selectedPrompt, setSelectedPrompt] = useState<string>("free");
  const [draft, setDraft] = useState("");

  const activePrompt = PROMPTS.find((p) => p.id === selectedPrompt)!;

  function saveEntry() {
    const text = draft.trim();
    if (!text) return;
    const next: JournalEntry = {
      id: Date.now().toString(),
      content: text,
      prompt: selectedPrompt === "free" ? null : selectedPrompt,
      createdAt: new Date().toISOString(),
    };
    const updated = [next, ...entries];
    setEntries(updated);
    setToStorage(JOURNAL_KEY, updated);
    setDraft("");
  }

  function handleSaveEdit(id: string, content: string) {
    const updated = entries.map((e) => (e.id === id ? { ...e, content } : e));
    setEntries(updated);
    setToStorage(JOURNAL_KEY, updated);
  }

  function handleDelete(id: string) {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    setToStorage(JOURNAL_KEY, updated);
  }

  const totalWords = useMemo(
    () => entries.reduce((sum, e) => sum + e.content.split(/\s+/).filter(Boolean).length, 0),
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

      <section className="px-4 md:px-12 py-6 md:py-10 max-w-3xl mx-auto space-y-8">

        {/* Page header */}
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

        {/* Compose card */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_12px_rgba(42,52,57,0.04)] space-y-5">

          {/* Prompt selector */}
          <div>
            <p className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold mb-3">
              Choose a prompt
            </p>
            <div className="flex flex-wrap gap-2">
              {PROMPTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPrompt(p.id)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
                    selectedPrompt === p.id
                      ? "bg-primary-container border-primary/30 text-primary"
                      : "bg-surface-container border-transparent text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div>
            <AnimatePresence mode="wait">
              <motion.label
                key={selectedPrompt}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="text-[11px] uppercase tracking-widest text-on-surface-variant font-bold block mb-2"
              >
                {activePrompt.id === "free" ? "Your thoughts" : activePrompt.label}
              </motion.label>
            </AnimatePresence>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={5}
              placeholder={
                activePrompt.id === "free"
                  ? "Write freely…"
                  : `${activePrompt.label} Write as much or as little as you like.`
              }
              className="w-full rounded-xl bg-surface-container-low border border-outline-variant p-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none resize-y"
            />
          </div>

          <div className="flex justify-end">
            <motion.button
              onClick={saveEntry}
              disabled={!draft.trim()}
              whileHover={{ y: -2 }}
              whileTap={{ y: 1, scale: 0.98 }}
              className="bg-primary-gradient text-on-primary px-6 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-40 flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Entry
            </motion.button>
          </div>
        </div>

        {/* Entry list */}
        <div className="space-y-3">
          {entries.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-surface-container p-10 text-center text-on-surface-variant">
              <p className="text-3xl mb-2">📖</p>
              <p className="text-sm">No journal entries yet. Pick a prompt above and start writing.</p>
            </div>
          )}
          <AnimatePresence initial={false}>
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onSaveEdit={handleSaveEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      </section>
    </AppShell>
  );
}
