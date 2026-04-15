import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "../../../components/layout/AppShell";
import { Button } from "../../../components/ui/Button";
import { getFromStorage, setToStorage, todayStr } from "../../../utils/localStorage";
import type { Task, Priority, TaskFolder } from "../../../types/appTypes";
import clsx from "clsx";
import { ClarioLogo } from "../../../components/ui/ClarioLogo";

const PRIORITY_OPTIONS: { value: Priority; label: string; dotClass: string }[] = [
  { value: "high", label: "High", dotClass: "bg-primary" },
  { value: "medium", label: "Medium", dotClass: "bg-tertiary-fixed-dim" },
  { value: "low", label: "Low", dotClass: "bg-outline-variant" },
];

const FOLDER_DOT_COLORS = [
  "bg-indigo-400", "bg-teal-400", "bg-rose-400",
  "bg-amber-400", "bg-violet-400", "bg-slate-400",
];

function usePomodoro() {
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
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return {
    display: fmt(seconds),
    isRunning,
    toggle: () => setIsRunning((r) => !r),
    reset: () => { setIsRunning(false); setSeconds(25 * 60); },
  };
}

export default function TasksPage() {
  const today = todayStr();
  const timer = usePomodoro();

  const [tasks, setTasks] = useState<Task[]>(() =>
    getFromStorage<Task[]>("clario_tasks", [])
  );
  const [folders, setFolders] = useState<TaskFolder[]>(() =>
    getFromStorage<TaskFolder[]>("clario_task_folders", [])
  );

  const [activeFolder, setActiveFolder] = useState<string | null>(null); // null = All Tasks
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [newFolderId, setNewFolderId] = useState<string>("");
  const [newDeadline, setNewDeadline] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  // View mode: "tasks" | "folders"
  const [view, setView] = useState<"tasks" | "folders">("tasks");

  // Folder creation state
  const [showFolderCreate, setShowFolderCreate] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderColorIdx, setFolderColorIdx] = useState(0);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showFolderCreate) folderInputRef.current?.focus();
  }, [showFolderCreate]);

  // ── Derived task groups ──────────────────────────────────────────────────
  const visibleTasks = activeFolder
    ? tasks.filter((t) => t.folder_id === activeFolder)
    : tasks;

  const todayTasks = visibleTasks.filter((t) => !t.completed && t.created_at.startsWith(today));
  const upcoming = visibleTasks.filter((t) => !t.completed && !t.created_at.startsWith(today));
  const done = visibleTasks.filter((t) => t.completed);

  // ── Task actions ─────────────────────────────────────────────────────────
  const toggleTask = useCallback(
    (id: string) => {
      const updated = tasks.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, completed_at: !t.completed ? new Date().toISOString() : undefined }
          : t
      );
      setTasks(updated);
      setToStorage("clario_tasks", updated);
    },
    [tasks]
  );

  const addTask = useCallback(() => {
    const title = newTitle.trim();
    if (!title) return;
    const task: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      priority: newPriority,
      created_at: new Date().toISOString(),
      folder_id: newFolderId || undefined,
      deadline: newDeadline || undefined,
    };
    const updated = [...tasks, task];
    setTasks(updated);
    setToStorage("clario_tasks", updated);
    setNewTitle("");
    setNewDeadline("");
    setShowAdd(false);
  }, [tasks, newTitle, newPriority, newFolderId, newDeadline]);

  const deleteTask = useCallback(
    (id: string) => {
      const updated = tasks.filter((t) => t.id !== id);
      setTasks(updated);
      setToStorage("clario_tasks", updated);
    },
    [tasks]
  );

  // ── Folder actions ───────────────────────────────────────────────────────
  const createFolder = useCallback(() => {
    const name = folderName.trim();
    if (!name) return;
    const folder: TaskFolder = {
      id: Date.now().toString(),
      name,
      color: FOLDER_DOT_COLORS[folderColorIdx],
    };
    const updated = [...folders, folder];
    setFolders(updated);
    setToStorage("clario_task_folders", updated);
    setFolderName("");
    setShowFolderCreate(false);
    setActiveFolder(folder.id);
  }, [folders, folderName, folderColorIdx]);

  const deleteFolder = useCallback(
    (id: string) => {
      // Remove folder from tasks but keep the tasks
      const updatedTasks = tasks.map((t) =>
        t.folder_id === id ? { ...t, folder_id: undefined } : t
      );
      setTasks(updatedTasks);
      setToStorage("clario_tasks", updatedTasks);
      const updatedFolders = folders.filter((f) => f.id !== id);
      setFolders(updatedFolders);
      setToStorage("clario_task_folders", updatedFolders);
      if (activeFolder === id) setActiveFolder(null);
    },
    [tasks, folders, activeFolder]
  );

  const allDone = tasks.filter((t) => t.completed).length;
  const allOpen = tasks.filter((t) => !t.completed).length;

  // ── Smart Prioritization ──────────────────────────────────────────────────
  const [taskView, setTaskView] = useState<"date" | "priority">("date");

  const hour = new Date().getHours();
  const timeOfDay =
    hour >= 5 && hour < 12 ? "morning" : hour >= 12 && hour < 17 ? "afternoon" : "evening";
  const suggestedPriority: Priority =
    timeOfDay === "morning" ? "high" : timeOfDay === "afternoon" ? "medium" : "low";
  const suggestedTask =
    visibleTasks.find((t) => !t.completed && t.priority === suggestedPriority) ??
    visibleTasks.find((t) => !t.completed);
  const PRIORITY_COUNTS = {
    high:   visibleTasks.filter((t) => !t.completed && t.priority === "high").length,
    medium: visibleTasks.filter((t) => !t.completed && t.priority === "medium").length,
    low:    visibleTasks.filter((t) => !t.completed && t.priority === "low").length,
  };
  const SUGGEST_MESSAGES: Record<string, string> = {
    morning:   "You perform better in the morning — tackle your hardest task first.",
    afternoon: "Keep the momentum going — work through your medium-priority tasks.",
    evening:   "Wind down productively — clear low-effort tasks before the day ends.",
  };
  const PRIORITY_GROUPS: { priority: Priority; label: string; dotClass: string; emptyText: string }[] = [
    { priority: "high",   label: "High Priority",   dotClass: "bg-primary",             emptyText: "No high-priority tasks." },
    { priority: "medium", label: "Medium Priority",  dotClass: "bg-tertiary-fixed-dim",  emptyText: "No medium-priority tasks." },
    { priority: "low",    label: "Low Priority",     dotClass: "bg-outline-variant",     emptyText: "No low-priority tasks." },
  ];

  // ── Sub-components ───────────────────────────────────────────────────────
  function TaskItem({ task, showPriority = true }: { task: Task; showPriority?: boolean }) {
    const dot = PRIORITY_OPTIONS.find((p) => p.value === task.priority)?.dotClass ?? "bg-outline-variant";
    const folder = folders.find((f) => f.id === task.folder_id);

    const now = new Date();
    const deadlineDate = task.deadline ? new Date(task.deadline) : null;
    const isOverdue = deadlineDate && !task.completed && deadlineDate < now;
    const isDueSoon = deadlineDate && !task.completed && !isOverdue &&
      deadlineDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000;
    const deadlineLabel = deadlineDate
      ? deadlineDate.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : null;

    return (
      <div className={clsx(
        "group flex items-start gap-4 p-4 rounded-xl transition-colors",
        isOverdue
          ? "bg-error/5 border border-error/20 hover:bg-error/10"
          : "bg-surface-container-lowest hover:bg-surface-bright"
      )}>
        {showPriority && <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${dot}`} />}
        <div className="flex-1 min-w-0">
          <span
            className={clsx("block text-sm font-medium truncate", task.completed ? "line-through text-on-surface-variant" : "text-on-surface")}
          >
            {task.title}
          </span>
          <div className="flex items-center flex-wrap gap-2 mt-0.5">
            {folder && !activeFolder && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold">
                <span className={`w-1.5 h-1.5 rounded-full ${folder.color}`} />
                <span className="text-on-surface-variant">{folder.name}</span>
              </span>
            )}
            {deadlineLabel && (
              <span className={clsx(
                "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full",
                isOverdue  && "bg-error/15 text-error",
                isDueSoon  && !isOverdue && "bg-tertiary-fixed-dim/30 text-on-surface-variant",
                !isOverdue && !isDueSoon && "bg-surface-container text-on-surface-variant/70",
              )}>
                <span className="material-symbols-outlined text-[10px]">schedule</span>
                {isOverdue && "Overdue · "}{deadlineLabel}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => toggleTask(task.id)}
          className={clsx(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 mt-0.5",
            task.completed ? "bg-primary border-primary" : "border-outline-variant group-hover:border-primary"
          )}
        >
          {task.completed && (
            <span className="material-symbols-outlined text-on-primary text-[11px]">check</span>
          )}
        </button>
        <button
          onClick={() => deleteTask(task.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface-variant hover:text-error mt-0.5"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    );
  }

  return (
    <AppShell>
      {/* Top bar */}
      <header className="hidden md:flex sticky top-0 z-40 glass-nav justify-between items-center px-10 h-16 border-b border-surface-container-high/50">
        <div className="flex items-center gap-6">
          <div className="h-10 w-36 md:h-12 md:w-52 overflow-hidden">
          <ClarioLogo className="h-full w-full" />
        </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-slate-500 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-slate-500 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-on-surface">Focus &amp; Tasks</h2>
            <p className="text-on-surface-variant mt-1 font-medium">Your sanctuary for deep work and intentional progress.</p>
          </div>
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-surface-container-low rounded-xl p-1 self-start sm:self-auto">
            <button
              onClick={() => setView("tasks")}
              className={clsx(
                "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                view === "tasks"
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <span className="material-symbols-outlined text-[15px]">checklist</span>
              Tasks
            </button>
            <button
              onClick={() => setView("folders")}
              className={clsx(
                "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                view === "folders"
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <span className="material-symbols-outlined text-[15px]">folder_open</span>
              Folders
              {folders.length > 0 && (
                <span className="ml-0.5 opacity-60 font-normal">{folders.length}</span>
              )}
            </button>
          </div>
        </div>

        {/* ── Folder bar ────────────────────────────────────────────────── */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {/* All Tasks chip */}
          <button
            onClick={() => setActiveFolder(null)}
            className={clsx(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all",
              activeFolder === null
                ? "bg-primary text-on-primary border-primary shadow-sm"
                : "bg-surface-container-lowest text-on-surface-variant border-surface-container-high hover:border-primary/40 hover:text-primary"
            )}
          >
            <span className="material-symbols-outlined text-[14px]">grid_view</span>
            All Tasks
            <span className="opacity-60 font-normal">{tasks.filter(t => !t.completed).length}</span>
          </button>

          {/* New folder button / inline form */}
          {showFolderCreate ? (
            <div className="flex items-center gap-2 bg-surface-container-lowest border border-surface-container-high rounded-2xl px-3 py-2 shadow-sm">
              {/* Color swatches */}
              <div className="flex gap-1">
                {FOLDER_DOT_COLORS.map((c, i) => (
                  <button
                    key={c}
                    onClick={() => setFolderColorIdx(i)}
                    className={clsx(
                      "w-3.5 h-3.5 rounded-full transition-transform",
                      c,
                      folderColorIdx === i ? "ring-2 ring-offset-1 ring-primary scale-110" : "hover:scale-110"
                    )}
                  />
                ))}
              </div>
              <input
                ref={folderInputRef}
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") createFolder();
                  if (e.key === "Escape") setShowFolderCreate(false);
                }}
                placeholder="Folder name…"
                className="text-xs bg-transparent text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none w-32"
              />
              <button
                onClick={createFolder}
                disabled={!folderName.trim()}
                className="text-primary disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
              </button>
              <button
                onClick={() => { setShowFolderCreate(false); setFolderName(""); }}
                className="text-on-surface-variant hover:text-error"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowFolderCreate(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-on-surface-variant border border-dashed border-surface-container-high hover:border-primary/50 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">create_new_folder</span>
              New Folder
            </button>
          )}
        </div>

        {/* ── Folders grid view ──────────────────────────────────────── */}
        {view === "folders" && (
          <div className="mb-10">
            {folders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-surface-container text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3">folder_open</span>
                <p className="text-sm font-semibold text-on-surface-variant">No folders yet</p>
                <p className="text-xs text-on-surface-variant/60 mt-1 mb-4">Create a folder to start grouping your tasks.</p>
                <button
                  onClick={() => setShowFolderCreate(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-semibold shadow-sm"
                >
                  <span className="material-symbols-outlined text-[15px]">create_new_folder</span>
                  New Folder
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {folders.map((folder) => {
                  const total = tasks.filter((t) => t.folder_id === folder.id).length;
                  const open = tasks.filter((t) => t.folder_id === folder.id && !t.completed).length;
                  const completed = total - open;
                  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
                  const recentTasks = tasks
                    .filter((t) => t.folder_id === folder.id && !t.completed)
                    .slice(0, 3);
                  return (
                    <button
                      key={folder.id}
                      onClick={() => { setActiveFolder(folder.id); setView("tasks"); }}
                      className="group relative text-left bg-surface-container-lowest hover:bg-surface-bright rounded-2xl p-5 shadow-[0_4px_16px_rgba(42,52,57,0.05)] hover:shadow-[0_8px_24px_rgba(42,52,57,0.10)] transition-all active:scale-[0.98] flex flex-col gap-3"
                    >
                      {/* Delete button */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }}
                        onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), deleteFolder(folder.id))}
                        title="Delete folder"
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-error/80 hover:text-on-primary"
                      >
                        <span className="material-symbols-outlined text-[13px]">delete</span>
                      </div>

                      {/* Folder icon + color dot */}
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-surface-container`}>
                          <span className="material-symbols-outlined text-[20px] text-on-surface-variant"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >folder</span>
                        </div>
                        <span className={`w-2.5 h-2.5 rounded-full ${folder.color}`} />
                      </div>

                      {/* Name + counts */}
                      <div>
                        <p className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">{folder.name}</p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">
                          {open} open · {completed} done
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      {/* Task previews */}
                      {recentTasks.length > 0 && (
                        <ul className="space-y-1">
                          {recentTasks.map((t) => (
                            <li key={t.id} className="flex items-center gap-1.5 text-[11px] text-on-surface-variant truncate">
                              <span className="w-1 h-1 rounded-full bg-outline-variant shrink-0" />
                              {t.title}
                            </li>
                          ))}
                          {open > 3 && (
                            <li className="text-[11px] text-primary font-medium">+{open - 3} more</li>
                          )}
                        </ul>
                      )}

                      {total === 0 && (
                        <p className="text-[11px] text-on-surface-variant/50 italic">No tasks yet</p>
                      )}
                    </button>
                  );
                })}

                {/* New folder card */}
                <button
                  onClick={() => setShowFolderCreate(true)}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-surface-container-high hover:border-primary/40 hover:bg-primary/5 text-on-surface-variant hover:text-primary transition-all p-5 min-h-[160px]"
                >
                  <span className="material-symbols-outlined text-3xl">create_new_folder</span>
                  <span className="text-xs font-semibold">New Folder</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Tasks + timer grid (hidden in folders view) ───────────────── */}
        <div className={clsx("grid grid-cols-12 gap-8 items-start", view === "folders" && "hidden")}>
          {/* Left: Task list */}
          <section className="col-span-12 lg:col-span-6 space-y-8">

            {/* Add task button */}
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowAdd((v) => !v)}>
                <span className="material-symbols-outlined text-[16px]">add</span>
                New Task
              </Button>
            </div>

            {showAdd && (
              <div className="p-5 bg-surface-container-lowest rounded-2xl shadow-[0_4px_12px_rgba(42,52,57,0.06)] space-y-3">
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder="Task name…"
                  className="w-full text-sm bg-surface-container-low rounded-xl px-4 py-2.5 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="flex flex-wrap gap-2 items-center">
                  {PRIORITY_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setNewPriority(p.value)}
                      className={clsx(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        newPriority === p.value
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                      )}
                    >
                      <div className={`w-2 h-2 rounded-full ${p.dotClass}`} />
                      {p.label}
                    </button>
                  ))}
                </div>
                {/* Folder picker */}
                {folders.length > 0 && (
                  <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-surface-container">
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mr-1">Folder</span>
                    <button
                      onClick={() => setNewFolderId("")}
                      className={clsx(
                        "px-3 py-1 rounded-full text-xs font-medium border transition-all",
                        !newFolderId
                          ? "bg-primary text-on-primary border-primary"
                          : "bg-surface-container text-on-surface-variant border-transparent hover:border-primary/30"
                      )}
                    >
                      None
                    </button>
                    {folders.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setNewFolderId(f.id)}
                        className={clsx(
                          "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all",
                          newFolderId === f.id
                            ? "bg-primary text-on-primary border-primary"
                            : "bg-surface-container text-on-surface-variant border-transparent hover:border-primary/30"
                        )}
                      >
                        <span className={`w-2 h-2 rounded-full ${f.color}`} />
                        {f.name}
                      </button>
                    ))}
                  </div>
                )}
                {/* Deadline picker */}
                <div className="flex flex-col gap-1 pt-1 border-t border-surface-container">
                  <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[13px]">event</span>
                    Deadline (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="text-sm bg-surface-container-low rounded-xl px-4 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 w-full"
                  />
                  {newDeadline && (
                    <button
                      onClick={() => setNewDeadline("")}
                      className="self-start text-[11px] text-on-surface-variant hover:text-error flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px]">close</span>
                      Clear deadline
                    </button>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button size="sm" onClick={addTask} disabled={!newTitle.trim()}>
                    Add Task
                  </Button>
                </div>
              </div>
            )}

            {/* View toggle: By Date / By Priority */}
            <div className="flex items-center gap-1 bg-surface-container-low rounded-xl p-1 self-start">
              <button
                onClick={() => setTaskView("date")}
                className={clsx(
                  "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  taskView === "date"
                    ? "bg-surface-container-lowest text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                By Date
              </button>
              <button
                onClick={() => setTaskView("priority")}
                className={clsx(
                  "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  taskView === "priority"
                    ? "bg-surface-container-lowest text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                <span className="material-symbols-outlined text-[14px]">filter_list</span>
                By Priority
              </button>
            </div>

            <AnimatePresence mode="wait">
            {taskView === "priority" ? (
              <motion.div
                key="priority"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="space-y-8"
              >
                {PRIORITY_GROUPS.map(({ priority, label, dotClass, emptyText }) => {
                  const group = visibleTasks.filter((t) => !t.completed && t.priority === priority);
                  return (
                    <div key={priority}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${dotClass}`} />
                          <span className="text-[11px] font-bold tracking-[0.1em] text-on-surface-variant uppercase">
                            {label}
                          </span>
                        </div>
                        <span className="text-[11px] text-primary font-bold">{group.length}</span>
                      </div>
                      <div className="space-y-2">
                        {group.length === 0 ? (
                          <p className="text-sm text-on-surface-variant/50 py-2 italic">{emptyText}</p>
                        ) : (
                          group.map((t) => <TaskItem key={t.id} task={t} />)
                        )}
                      </div>
                    </div>
                  );
                })}
                {/* Done */}
                {done.length > 0 && (
                  <div>
                    <div className="mb-3">
                      <span className="text-[11px] font-bold tracking-[0.1em] text-on-surface-variant uppercase">Done</span>
                    </div>
                    <div className="space-y-2">
                      {done.slice(0, 5).map((t) => (
                        <TaskItem key={t.id} task={t} showPriority={false} />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="date"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="space-y-8"
              >
            {/* Today */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold tracking-[0.1em] text-on-surface-variant uppercase">Today</span>
                <span className="text-[11px] text-primary font-bold">{todayTasks.length} Tasks</span>
              </div>
              <div className="space-y-2">
                {todayTasks.length === 0 && (
                  <p className="text-sm text-on-surface-variant py-2">No tasks for today yet.</p>
                )}
                {todayTasks.map((t) => (
                  <TaskItem key={t.id} task={t} />
                ))}
              </div>
            </div>

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <div className="mb-3">
                  <span className="text-[11px] font-bold tracking-[0.1em] text-on-surface-variant uppercase">Upcoming</span>
                </div>
                <div className="space-y-2 opacity-70">
                  {upcoming.map((t) => (
                    <TaskItem key={t.id} task={t} />
                  ))}
                </div>
              </div>
            )}

            {/* Done */}
            {done.length > 0 && (
              <div>
                <div className="mb-3">
                  <span className="text-[11px] font-bold tracking-[0.1em] text-on-surface-variant uppercase">Done</span>
                </div>
                <div className="space-y-2">
                  {done.slice(0, 5).map((t) => (
                    <TaskItem key={t.id} task={t} showPriority={false} />
                  ))}
                </div>
              </div>
            )}
              </motion.div>
            )}
            </AnimatePresence>
          </section>

          {/* Right: Focus timer */}
          <section className="col-span-12 lg:col-span-6 space-y-5">

            {/* Smart Prioritization banner */}
            {visibleTasks.some((t) => !t.completed) && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, ease: "easeOut" }}
                className="relative overflow-hidden rounded-2xl bg-primary-container/40 border border-primary/10 p-5 shadow-[0_4px_16px_rgba(42,52,57,0.06)]"
              >
                <span className="material-symbols-outlined text-primary text-[100px] absolute -right-3 -top-3 opacity-[0.07] pointer-events-none select-none">
                  auto_awesome
                </span>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-primary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[20px]">tips_and_updates</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                      Smart Prioritization
                    </span>
                    <p className="text-sm text-on-surface-variant mt-0.5">{SUGGEST_MESSAGES[timeOfDay]}</p>
                    {suggestedTask && (
                      <div className="mt-3 flex items-center gap-2.5 bg-surface-container-lowest rounded-xl px-3 py-2.5 border border-primary/10">
                        <span className="material-symbols-outlined text-primary text-[16px]">chevron_right</span>
                        <span className="text-sm font-semibold text-on-surface flex-1 truncate">
                          {suggestedTask.title}
                        </span>
                        <span className={clsx(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                          suggestedTask.priority === "high"   && "bg-primary/15 text-primary",
                          suggestedTask.priority === "medium" && "bg-tertiary-fixed-dim/30 text-on-surface-variant",
                          suggestedTask.priority === "low"    && "bg-surface-container text-on-surface-variant/60",
                        )}>
                          {suggestedTask.priority}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {(["high", "medium", "low"] as Priority[]).map((p) => (
                        <span
                          key={p}
                          className={clsx(
                            "flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full",
                            p === "high"   && "bg-primary/10 text-primary",
                            p === "medium" && "bg-surface-container text-on-surface-variant",
                            p === "low"    && "bg-surface-container text-on-surface-variant/60",
                          )}
                        >
                          <span className={clsx(
                            "w-1.5 h-1.5 rounded-full",
                            p === "high"   && "bg-primary",
                            p === "medium" && "bg-tertiary-fixed-dim",
                            p === "low"    && "bg-outline-variant",
                          )} />
                          {PRIORITY_COUNTS[p]} {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_12px_40px_rgba(42,52,57,0.04)] flex flex-col items-center gap-5 text-center">
              <div className="flex gap-6 text-on-surface-variant">
                <span className="material-symbols-outlined">local_drink</span>
                <span className="material-symbols-outlined">notifications</span>
                <span className="material-symbols-outlined">wb_sunny</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                Deep Focus Session
              </span>
              <p className="text-7xl font-bold tracking-tight text-on-surface tabular-nums">{timer.display}</p>
              <div className="flex gap-4 items-center">
                <button
                  onClick={timer.reset}
                  className="p-2.5 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant"
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
                <button className="p-2.5 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant">
                  <span className="material-symbols-outlined">skip_next</span>
                </button>
              </div>
              <div className="px-4 py-2 bg-surface-container-low rounded-full text-xs text-on-surface-variant font-medium flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                {todayTasks[0]?.title ?? "No active task"}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_12px_40px_rgba(42,52,57,0.04)]">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                  Total Completed
                </span>
                <p className="text-3xl font-bold text-on-surface mt-1">{allDone}</p>
                <span className="text-sm text-on-surface-variant">tasks done</span>
              </div>
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_12px_40px_rgba(42,52,57,0.04)]">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                  Remaining
                </span>
                <p className="text-3xl font-bold text-on-surface mt-1">{allOpen}</p>
                <span className="text-sm text-on-surface-variant">open tasks</span>
              </div>
            </div>

            {/* Folder summary */}
            {folders.length > 0 && (
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_12px_40px_rgba(42,52,57,0.04)]">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold block mb-4">
                  Folders
                </span>
                <div className="space-y-2.5">
                  {folders.map((f) => {
                    const open = tasks.filter((t) => t.folder_id === f.id && !t.completed).length;
                    const total = tasks.filter((t) => t.folder_id === f.id).length;
                    const pct = total === 0 ? 0 : Math.round(((total - open) / total) * 100);
                    return (
                      <button
                        key={f.id}
                        onClick={() => setActiveFolder(activeFolder === f.id ? null : f.id)}
                        className="w-full text-left group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${f.color}`} />
                            <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{f.name}</span>
                          </div>
                          <span className="text-xs text-on-surface-variant">{open} open</span>
                        </div>
                        <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
