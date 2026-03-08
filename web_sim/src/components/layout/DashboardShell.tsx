import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 px-3 py-3 md:px-6 md:py-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:gap-6">
          <Topbar />
          <main className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <section className="space-y-4">{children}</section>
            <aside className="space-y-4">
              <div className="card">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Live behavior snapshot
                </p>
                <div className="mt-3 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Focus score</span>
                    <span className="font-semibold text-emerald-600">82%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full w-4/5 rounded-full bg-emerald-600" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Perceived workload</span>
                    <span className="font-semibold text-amber-600">Moderate</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Procrastination risk</span>
                    <span className="font-semibold text-rose-600">Low</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Simulation tips
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-600">
                  <li>Log short study blocks rather than long unrealistic sessions.</li>
                  <li>Record distractions honestly to calibrate your behavior profile.</li>
                  <li>
                    Use assessments and exam simulations to observe workload under pressure.
                  </li>
                </ul>
              </div>
            </aside>
          </main>
        </div>
      </div>
    </div>
  );
}

