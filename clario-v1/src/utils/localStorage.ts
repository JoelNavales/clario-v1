export function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // silently fail on quota errors
  }
}

export function loadAppData() {
  return {
    moods: getFromStorage("clario_moods", []),
    habits: getFromStorage("clario_habits", []),
    habitLogs: getFromStorage("clario_habit_logs", []),
    tasks: getFromStorage("clario_tasks", []),
  };
}

/** Returns today's date as YYYY-MM-DD */
export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}
