import { AppShell } from "../../../components/layout/AppShell";
import { Button } from "../../../components/ui/Button";
import { useInsights } from "../../../hooks/useInsights";
import { NavLink } from "react-router-dom";

export default function InsightsPage() {
  const { insights, isLoading, generate, error } = useInsights();
  const hasInsights = insights.length > 0;

  return (
    <AppShell>
      {/* Top bar */}
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
        <div className="flex items-center gap-4">
          <button className="text-slate-500 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <Button variant="ghost" size="sm" className="rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-bold px-5">
            New Entry
          </Button>
        </div>
      </header>

      <section className="px-4 md:px-12 py-6 md:py-10 max-w-7xl mx-auto">
        {/* Page title */}
        <div className="mb-12">
          <h2 className="text-5xl font-bold tracking-tight text-on-surface mb-2">Deep Insights</h2>
          <p className="text-on-surface-variant font-medium">A curated reflection of your cognitive and emotional harmony.</p>
        </div>

        <div className="grid grid-cols-12 gap-10 items-start">
          {/* Left column */}
          <aside className="col-span-12 lg:col-span-4 space-y-8">
            {/* Mood Correlation mini */}
            <div>
              <span className="text-[11px] font-bold tracking-[0.1em] text-on-surface-variant uppercase mb-4 block">
                Key Trends
              </span>
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_12px_rgba(42,52,57,0.04)]">
                <h3 className="text-sm font-semibold text-on-surface mb-4">Mood Correlation</h3>
                <div className="space-y-3">
                  {(["Habits", "Mood"] as const).map((label) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="w-14 text-[10px] font-bold text-outline-variant uppercase">{label}</span>
                      <div className="flex-1 flex gap-1">
                        {[20, 35, 50, 70, 90].map((opacity, i) => (
                          <div
                            key={i}
                            className="h-5 flex-1 rounded-sm"
                            style={{ backgroundColor: `rgba(73,75,214,${opacity / 100})` }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between mt-1">
                    {["MON", "TUE", "WED", "THU", "FRI"].map((d) => (
                      <span key={d} className="text-[9px] text-outline-variant font-medium">{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Summary card */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 shadow-[0_4px_12px_rgba(42,52,57,0.04)]">
              <p className="text-sm font-semibold text-primary flex items-center gap-1.5 mb-3">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                Personal AI Summary
              </p>
              <p className="text-sm text-on-surface leading-relaxed">
                {hasInsights
                  ? insights[0]
                  : "Generate insights to see your personal AI summary here."}
              </p>
            </div>
          </aside>

          {/* Right column */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Generate button */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-on-surface">
                {hasInsights ? `${insights.length} Insights Generated` : "Your Insights"}
              </h3>
              <Button onClick={() => void generate()} loading={isLoading}>
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                {isLoading ? "Analyzing…" : "Generate Insights"}
              </Button>
            </div>

            {error && (
              <p className="text-xs text-error">Insight generation temporarily failed. A fallback response is shown.</p>
            )}

            {/* Insights list */}
            {hasInsights && !isLoading && (
              <ul className="space-y-4">
                {insights.map((insight, i) => (
                  <li
                    key={i}
                    className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_12px_rgba(42,52,57,0.04)] flex gap-4"
                  >
                    <div className="mt-0.5 w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-[11px] font-bold text-on-surface-variant shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-on-surface">{insight}</p>
                  </li>
                ))}
              </ul>
            )}

            {/* Loading skeleton */}
            {isLoading && (
              <ul className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <li key={i} className="bg-surface-container-lowest rounded-2xl p-6 animate-pulse">
                    <div className="h-3 bg-surface-container rounded w-3/4 mb-3" />
                    <div className="h-3 bg-surface-container rounded w-1/2" />
                  </li>
                ))}
              </ul>
            )}

            {/* Empty state */}
            {!hasInsights && !isLoading && (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-container px-8 py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant">insights</span>
                </div>
                <p className="text-sm font-semibold text-on-surface-variant">No insights yet</p>
                <p className="text-xs text-on-surface-variant mt-1">Click "Generate Insights" to analyse your data.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-6 border-t border-surface-container flex justify-between items-center text-[10px] uppercase tracking-widest text-on-surface-variant">
          <span>Last synced: Today, {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          <div className="flex gap-6">
            <span className="hover:text-primary cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Data Export</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Methodology</span>
          </div>
        </footer>
      </section>
    </AppShell>
  );
}
