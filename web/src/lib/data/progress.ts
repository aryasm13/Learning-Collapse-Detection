import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export type ModuleProgressState = "not_started" | "in_progress" | "completed";

export type ModuleProgress = {
  module_id: string;
  progress_percent: number;
  state: ModuleProgressState;
  last_activity_at: string | null;
};

export async function computeModuleProgress({
  studentId,
  assessmentIdsByModuleId,
}: {
  studentId: string;
  assessmentIdsByModuleId: Record<string, string[]>;
}): Promise<Record<string, ModuleProgress>> {
  const admin = getSupabaseAdmin();
  const allAssessmentIds = Array.from(
    new Set(Object.values(assessmentIdsByModuleId).flat())
  );

  if (!allAssessmentIds.length) return {};

  const { data, error } = await admin
    .from("attempts")
    .select("assessment_id,started_at,submitted_at,is_final,created_at")
    .eq("student_id", studentId)
    .in("assessment_id", allAssessmentIds)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load attempts", error);
    return {};
  }

  const attempts = (data ?? []) as Array<{
    assessment_id: string;
    started_at: string;
    submitted_at: string | null;
    is_final: boolean;
    created_at: string;
  }>;

  const byAssessment = new Map<string, typeof attempts>();
  for (const a of attempts) {
    const prev = byAssessment.get(a.assessment_id);
    if (prev) prev.push(a);
    else byAssessment.set(a.assessment_id, [a]);
  }

  const moduleProgress: Record<string, ModuleProgress> = {};

  for (const [moduleId, assessmentIds] of Object.entries(assessmentIdsByModuleId)) {
    const relevant = assessmentIds.flatMap((id) => byAssessment.get(id) ?? []);
    const finalSubmitted = relevant.some((a) => a.is_final && a.submitted_at);
    const anyStarted = relevant.length > 0;
    const last = relevant[0]?.created_at ?? null;

    const state: ModuleProgressState = finalSubmitted
      ? "completed"
      : anyStarted
        ? "in_progress"
        : "not_started";

    const progress_percent = finalSubmitted ? 100 : anyStarted ? 35 : 0;

    moduleProgress[moduleId] = {
      module_id: moduleId,
      progress_percent,
      state,
      last_activity_at: last,
    };
  }

  return moduleProgress;
}

