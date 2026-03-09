import Link from "next/link";

type WeekConfig = {
  id: number;
  title: string;
  progress: number;
};

const WEEKS: WeekConfig[] = [
  { id: 1, title: "Week 1 · Supervised Learning Basics", progress: 45 },
  { id: 2, title: "Week 2 · Model Evaluation & Tuning", progress: 20 },
  { id: 3, title: "Week 3 · Unsupervised & Clustering", progress: 0 },
  { id: 4, title: "Week 4 · Ensembles & Wrap‑up", progress: 0 },
];

export default function CoursePage() {
  return (
    <div className="space-y-4">
      <section className="card">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="pill mb-2">Course · Machine Learning Techniques</p>
            <h1 className="text-xl font-semibold text-slate-900">
              Simulate your workload across core ML concepts
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              This course view is about{" "}
              <span className="font-semibold text-slate-900">
                how the course feels
              </span>{" "}
              — time spent, energy, and attention — not grade tracking or content
              delivery.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
            <p className="font-medium text-emerald-700">Machine Learning Techniques</p>
            <p className="mt-1 text-slate-600">
              4 simulated weeks · 3 video modules per week · quizzes & weekly reflections.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {WEEKS.map((week) => (
          <article key={week.id} className="card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-900">
                  {week.title}
                </h2>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600">
                  Week {week.id}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-600">
                Log how long each module really takes and how demanding it feels compared
                to your expectations.
              </p>

              <div className="mt-3 space-y-2 text-xs text-slate-700">
                <p className="font-medium text-slate-900">Video modules</p>
                <ul className="space-y-1">
                  <li>• Module 1 – Concept introduction</li>
                  <li>• Module 2 – Worked example or notebook walkthrough</li>
                  <li>• Module 3 – Implementation & reflection prompts</li>
                </ul>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Weekly progress</span>
                  <span className="font-semibold text-emerald-700">
                    {week.progress}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-[width]"
                    style={{ width: `${Math.min(Math.max(week.progress, 0), 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 text-xs sm:flex-row">
              <Link
                href={`/assessment/${week.id}`}
                className="flex flex-1 items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Attempt quiz
              </Link>
              <Link
                href={`/course/week/${week.id}`}
                className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
              >
                Submit weekly assessment
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

