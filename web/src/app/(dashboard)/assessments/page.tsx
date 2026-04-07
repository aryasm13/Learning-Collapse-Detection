import Link from "next/link";
import { fetchCourses } from "@/lib/data/courses";

export default async function AssessmentsPage() {
  const courses = await fetchCourses();
  const assessments = courses.flatMap((c) =>
    c.modules.flatMap((m) =>
      m.assessments.map((a) => ({
        ...a,
        courseTitle: c.title,
        moduleTitle: m.title,
        week: m.week,
        order: m.order,
      }))
    )
  );

  return (
    <div className="space-y-4">
      <section className="card">
        <p className="pill mb-2">Assessments</p>
        <h1 className="text-xl font-semibold text-slate-900">
          Quizzes and exam simulations generated from the database
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Each attempt creates persistent state: a timed session, randomized questions,
          and an immutable submission record.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {assessments.map((a) => (
          <article key={a.id} className="card flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {a.type}
                  </p>
                  <h2 className="mt-1 text-sm font-semibold text-slate-900">
                    {a.title}
                  </h2>
                  <p className="mt-1 text-xs text-slate-600">
                    {a.courseTitle} · Week {a.week} · Module {a.order}: {a.moduleTitle}
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600">
                  {a.max_questions} Q · {Math.round(a.time_limit_seconds / 60)} min
                </span>
              </div>
            </div>

            <Link
              href={`/assessments/${a.id}`}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Start attempt
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}

