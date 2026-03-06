import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-800/80 p-8 shadow-2xl shadow-slate-950/60">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-400 text-slate-900 font-bold">
            AW
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-50">
              Academic Workload Simulator
            </p>
            <p className="text-xs text-slate-400">
              Behavior-tracking learning simulation (not an LMS)
            </p>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-slate-50">
          Sign in to your simulation
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Use your academic email or a demo identity to explore workload patterns.
        </p>

        <form className="mt-6 space-y-4" action="/dashboard" method="get">
          <div className="space-y-1.5 text-sm">
            <label
              htmlFor="email"
              className="block text-xs font-medium uppercase tracking-wide text-slate-300"
            >
              Academic email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@university.edu"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <div className="space-y-1.5 text-sm">
            <label
              htmlFor="password"
              className="block text-xs font-medium uppercase tracking-wide text-slate-300"
            >
              Access key
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 px-3 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:brightness-110"
          >
            Enter simulation
          </button>
        </form>

        <div className="mt-5 space-y-2 rounded-2xl bg-slate-950/60 p-4 text-xs text-slate-300">
          <p className="font-medium text-slate-100">Demo mode</p>
          <p>
            No real grades are stored. This portal simulates workload, habits, and
            stress under different academic scenarios.
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Continue to{" "}
          <Link
            href="/dashboard"
            className="font-medium text-emerald-300 underline-offset-2 hover:underline"
          >
            demo dashboard
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

