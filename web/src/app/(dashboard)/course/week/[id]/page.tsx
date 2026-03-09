import { notFound } from "next/navigation";
import { TrackedVideoPlayer } from "@/components/video/TrackedVideoPlayer";
import WeekAssessmentForm from "./WeekAssessmentForm";

type Props = {
  params: Promise<{ id: string }>;
};

const WEEK_LABELS: Record<string, string> = {
  "1": "Foundations & onboarding",
  "2": "Conceptual load increases",
  "3": "First assessment week",
  "4": "Project ramp-up",
};

export default async function CourseWeekPage({ params }: Props) {
  const { id } = await params;
  const label = WEEK_LABELS[id];

  if (!label) {
    return notFound();
  }

  return (
    <div className="space-y-4">
      <section className="card">
        <p className="pill mb-2">Course · Week {id}</p>
        <h1 className="text-xl font-semibold text-slate-50">{label}</h1>
        <p className="mt-2 text-sm text-slate-400">
          This view is about how the week feels, not about grades. Watch the module,
          then submit a short reflection to simulate perceived workload.
        </p>
      </section>

      <section className="space-y-4">
        <TrackedVideoPlayer
          videoId={`ml-week-${id}`}
          title={`Machine Learning Techniques · Week ${id}`}
        />
        <WeekAssessmentForm week={Number(id)} />
      </section>
    </div>
  );
}

