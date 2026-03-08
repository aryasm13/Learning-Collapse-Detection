import Link from "next/link";
import { ReactNode } from "react";

export function Topbar(): ReactNode {
  return (
    <header className="glass-panel sticky top-0 z-20 flex h-16 items-center justify-between rounded-2xl px-4">
      <div className="flex items-center gap-2 text-sm text-slate-700">
        <span className="pill">Academic Workload Simulator</span>
        <span className="hidden text-xs text-slate-500 md:inline">
          Not an LMS – a behavior-tracking learning simulation portal.
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 md:flex">
          <span className="mr-1 h-2 w-2 rounded-full bg-emerald-600" />
          Simulation session active
        </div>

        <Link
          href="/course"
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          View weekly load
        </Link>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-medium text-slate-900">Alex Student</p>
            <p className="text-[11px] text-slate-500">Behavior profile: Focused</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700">
            AS
          </div>
        </div>
      </div>
    </header>
  );
}

