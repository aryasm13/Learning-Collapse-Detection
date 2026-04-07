import Link from "next/link";
import { requireAuthedUser } from "@/lib/data/auth";
import { fetchCourses } from "@/lib/data/courses";
import { computeModuleProgress } from "@/lib/data/progress";

export default async function CoursePage() {
  const { user } = await requireAuthedUser();

  const courses = await fetchCourses();

  const assessmentIdsByModuleId: Record<string, string[]> = {};
  for (const c of courses) {
    for (const m of c.modules) {
      assessmentIdsByModuleId[m.id] = m.assessments.map((a) => a.id);
    }
  }

  const progressByModuleId =
    user?.id && courses.length
      ? await computeModuleProgress({
          studentId: user.id,
          assessmentIdsByModuleId,
        })
      : {};

  return (
    <div className="space-y-4">
      <section className="card">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="pill mb-2">Courses</p>
            <h1 className="text-xl font-semibold text-slate-900">
              Choose a course to simulate workload and assessment pressure
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Every course, week, and assessment here is data-backed. Your progress is
              computed from your real attempts and activity history.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
            <p className="font-medium text-emerald-700">Simulation state</p>
            <p className="mt-1 text-slate-600">
              Signed in: <span className="font-semibold">{user?.email ?? "Yes"}</span>
            </p>
          </div>
        </div>
      </section>

      {courses.length === 0 ? (
        <section className="card">
          <p className="text-sm font-semibold text-slate-900">No courses found</p>
          <p className="mt-1 text-xs text-slate-600">
            Add courses/modules/assessments/questions in Supabase to start the
            simulation.
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          {courses.map((course) => {
            const weeks = new Map<number, typeof course.modules>();
            for (const m of course.modules) {
              const arr = weeks.get(m.week) ?? [];
              arr.push(m);
              weeks.set(m.week, arr);
            }

            return (
              <div key={course.id} className="space-y-3">
                <div className="card">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <p className="pill mb-2">Course</p>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {course.title}
                      </h2>
                      {course.description ? (
                        <p className="mt-1 text-sm text-slate-600">
                          {course.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700">
                      <p className="font-medium text-slate-900">Weeks</p>
                      <p className="mt-1 text-slate-600">{weeks.size}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from(weeks.entries())
                    .sort(([a], [b]) => a - b)
                    .map(([week, modules]) => {
                      const avgProgress =
                        modules.reduce((acc, m) => {
                          const p = progressByModuleId[m.id]?.progress_percent ?? 0;
                          return acc + p;
                        }, 0) / (modules.length || 1);

                      return (
                        <article
                          key={`${course.id}-${week}`}
                          className="card flex flex-col justify-between gap-4"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-sm font-semibold text-slate-900">
                                Week {week}
                              </h3>
                              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600">
                                {modules.length} module{modules.length === 1 ? "" : "s"}
                              </span>
                            </div>

                            <div className="space-y-2">
                              {modules.map((m) => {
                                const p = progressByModuleId[m.id];
                                const state = p?.state ?? "not_started";
                                const badge =
                                  state === "completed"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : state === "in_progress"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-slate-50 text-slate-600 border-slate-200";

                                const quiz = m.assessments.find((a) => a.type === "quiz");

                                return (
                                  <div
                                    key={m.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-3"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="text-xs font-medium text-slate-900">
                                          {m.title}
                                        </p>
                                        <p className="mt-0.5 text-[11px] text-slate-500">
                                          Module {m.order}
                                        </p>
                                      </div>
                                      <span
                                        className={`rounded-full border px-2 py-0.5 text-[11px] ${badge}`}
                                      >
                                        {state.replace("_", " ")}
                                      </span>
                                    </div>

                                    <div className="mt-3">
                                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                                        <span>Progress</span>
                                        <span className="font-semibold text-emerald-700">
                                          {p?.progress_percent ?? 0}%
                                        </span>
                                      </div>
                                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                        <div
                                          className="h-full rounded-full bg-emerald-600 transition-[width]"
                                          style={{
                                            width: `${Math.min(
                                              Math.max(p?.progress_percent ?? 0, 0),
                                              100
                                            )}%`,
                                          }}
                                        />
                                      </div>
                                    </div>

                                    <div className="mt-3 flex flex-col gap-2 text-xs sm:flex-row">
                                      {quiz ? (
                                        <Link
                                          href={`/assessments/${quiz.id}`}
                                          className="flex flex-1 items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 font-semibold text-white shadow-sm hover:bg-emerald-700"
                                        >
                                          Attempt quiz
                                        </Link>
                                      ) : (
                                        <span className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500">
                                          No quiz configured
                                        </span>
                                      )}

                                      <Link
                                        href={`/course/week/${week}`}
                                        className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
                                      >
                                        Week reflection
                                      </Link>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-xs text-slate-600">
                              <span>Week progress</span>
                              <span className="font-semibold text-emerald-700">
                                {Math.round(avgProgress)}%
                              </span>
                            </div>
                            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-emerald-600 transition-[width]"
                                style={{
                                  width: `${Math.min(
                                    Math.max(Math.round(avgProgress), 0),
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </article>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

