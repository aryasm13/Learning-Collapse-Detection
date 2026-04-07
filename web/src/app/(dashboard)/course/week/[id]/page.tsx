import { notFound } from "next/navigation";
import { TrackedVideoPlayer } from "@/components/video/TrackedVideoPlayer";
import WeekAssessmentForm from "./WeekAssessmentForm";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CourseWeekPage({ params }: Props) {
  const { id } = await params;
  const week = Number(id);
  if (!Number.isFinite(week) || week < 1) return notFound();

  const admin = getSupabaseAdmin();
  const { data: modules, error } = await admin
    .from("modules")
    .select("id,title,order,week,course:courses(id,title)")
    .eq("week", week)
    .order("order", { ascending: true });

  if (error || !modules || modules.length === 0) return notFound();

  type ModuleRow = {
    id: string;
    title: string;
    order: number;
    week: number;
    course: { id: string; title: string } | null;
  };
  const moduleRows = modules as unknown as ModuleRow[];
  const primary = moduleRows[0];
  const courseTitle = primary?.course?.title ?? "Course";

  return (
    <div className="space-y-4">
      <section className="card">
        <p className="pill mb-2">
          {courseTitle} · Week {week}
        </p>
        <h1 className="text-xl font-semibold text-slate-900">
          Week {week} workload reflection
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Watch a tracked module segment, then submit a reflection. This is stored and
          influences your behavior insights (not a mock grade).
        </p>
      </section>

      <section className="space-y-4">
        <TrackedVideoPlayer videoId={primary.id} title={primary.title} />
        <WeekAssessmentForm week={week} />

        <div className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Modules this week
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {moduleRows.map((m) => (
              <li key={m.id} className="flex items-center justify-between">
                <span>
                  Module {m.order}: <span className="font-medium">{m.title}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

