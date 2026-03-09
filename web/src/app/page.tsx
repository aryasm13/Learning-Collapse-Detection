export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="glass-panel w-full max-w-3xl rounded-3xl border border-slate-800/80 p-8 text-slate-50 shadow-2xl shadow-slate-950/60">
        <p className="pill mb-3">Academic Workload Simulator</p>
        <h1 className="text-2xl font-semibold leading-tight">
          A behavior-tracking learning simulation portal —{" "}
          <span className="text-emerald-300">not an LMS</span>.
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          Explore how study habits, focus, and perceived workload change across
          weeks, assessments, and exam periods. This demo emphasizes behavior
          patterns over content delivery or grading.
        </p>

        <div className="mt-6 flex flex-col gap-3 text-sm sm:flex-row">
          <a
            href="/login"
            className="flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:brightness-110"
          >
            Enter simulation
          </a>
          <a
            href="/dashboard"
            className="flex flex-1 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 font-medium text-slate-100 hover:bg-slate-800"
          >
            View demo dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
