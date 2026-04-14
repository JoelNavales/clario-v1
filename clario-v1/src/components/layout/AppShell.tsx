import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-background text-on-surface font-sans antialiased min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Page content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        {/* Mobile top bar — hidden on desktop */}
        <header className="md:hidden sticky top-0 z-30 glass-nav flex items-center justify-between px-4 h-14 border-b border-surface-container-high/50">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:bg-surface-container-low transition-colors"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
          <span className="text-base font-bold tracking-tighter text-slate-800">Clario</span>
          {/* Spacer to keep title centered */}
          <div className="w-10" />
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
