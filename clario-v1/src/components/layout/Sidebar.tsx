import { NavLink, useNavigate } from "react-router-dom";
import clsx from "clsx";
import { getFromStorage } from "../../utils/localStorage";
import type { Profile } from "../../types/appTypes";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "dashboard" },
  { to: "/mood", label: "Mood", icon: "auto_awesome" },
  { to: "/habits", label: "Habits", icon: "published_with_changes" },
  { to: "/tasks", label: "Tasks", icon: "check_circle" },
  { to: "/insights", label: "Insights", icon: "insights" },
  { to: "/settings", label: "Settings", icon: "settings" },
] as const;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const profile = getFromStorage<Profile>("clario_profile", { name: "You" });

  function handleNavClick() {
    // close drawer on mobile after navigation
    onClose();
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className={clsx(
          "fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Sidebar panel */}
      <aside
        className={clsx(
          "h-screen w-64 fixed left-0 top-0 bg-[#f0f4f7] flex flex-col py-8 px-4 z-50 transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="px-4 mb-10">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-800 tracking-tighter">Clario</h1>
            {/* Close button — mobile only */}
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-lg text-slate-500 hover:bg-white/50 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-medium mt-1">
            The Daily Sanctuary
          </p>
          <div className="mt-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold text-sm">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-tight">{profile.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Stay Present</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={handleNavClick}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 py-3 px-4 rounded-xl transition-all text-[13px] tracking-wide uppercase font-medium",
                  isActive
                    ? "text-primary font-bold border-r-2 border-primary bg-white/60"
                    : "text-slate-500 hover:bg-white/40"
                )
              }
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto px-2">
          <button
            onClick={() => { navigate("/mood"); onClose(); }}
            className="w-full bg-primary-gradient text-on-primary py-3 px-6 rounded-full font-semibold text-sm shadow-sm active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Entry
          </button>
        </div>
      </aside>
    </>
  );
}
