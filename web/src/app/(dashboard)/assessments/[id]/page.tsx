import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAuthedUser } from "@/lib/data/auth";
import { AssessmentRunner } from "./ui";

type AttemptHistoryRow = {
  id: string;
  score: number | null;
  is_final: boolean;
  submitted_at: string | null;
  started_at: string;
  expires_at: string;
  duration_seconds: number | null;
  created_at: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default async function AssessmentAttemptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: assessmentId } = await params;
  const { user } = await requireAuthedUser();
  if (!user) return notFound();

  const admin = getSupabaseAdmin();
  const { data: assessment, error: asmtError } = await admin
    .from("assessments")
    .select("id,title,type,time_limit_seconds,max_questions,module_id")
    .eq("id", assessmentId)
    .maybeSingle();

  if (asmtError || !assessment) return notFound();
  type AssessmentRow = {
    id: string;
    title: string;
    type: "quiz" | "exam";
    time_limit_seconds: number;
    max_questions: number;
    module_id: string;
  };
  const asmt = assessment as unknown as AssessmentRow;

  const { data: existingFinal } = await admin
    .from("attempts")
    .select("id,score,submitted_at,duration_seconds")
    .eq("student_id", user.id)
    .eq("assessment_id", assessmentId)
    .eq("is_final", true)
    .order("submitted_at", { ascending: false })
    .limit(1);

  const finalAttempt = existingFinal?.[0] ?? null;

  const { data: historyRows } = await admin
    .from("attempts")
    .select("id,score,is_final,submitted_at,started_at,expires_at,duration_seconds,created_at")
    .eq("student_id", user.id)
    .eq("assessment_id", assessmentId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Reuse active non-final attempt if it exists and hasn't expired.
  const { data: activeAttempts } = await admin
    .from("attempts")
    .select("id,question_ids,expires_at,started_at")
    .eq("student_id", user.id)
    .eq("assessment_id", assessmentId)
    .eq("is_final", false)
    .is("submitted_at", null)
    .order("created_at", { ascending: false })
    .limit(1);

  const active = activeAttempts?.[0] ?? null;
  const isActiveValid =
    active && new Date(active.expires_at).getTime() > new Date().getTime();

  let attempt:
    | { id: string; question_ids: string[]; expires_at: string; started_at: string }
    | null = isActiveValid
    ? {
        id: active!.id,
        question_ids: active!.question_ids ?? [],
        expires_at: active!.expires_at,
        started_at: active!.started_at,
      }
    : null;

  if (!attempt && !finalAttempt) {
    const { data: allQ, error: qidsError } = await admin
      .from("questions")
      .select("id")
      .eq("assessment_id", assessmentId);

    if (qidsError || !allQ || allQ.length === 0) return notFound();

    const allIds = (allQ as unknown as Array<{ id: string }>).map((r) => r.id);
    const picked = shuffle(allIds).slice(
      0,
      Math.min(allIds.length, asmt.max_questions ?? 5)
    );

    const startedAt = new Date();
    const expiresAt = new Date(
      startedAt.getTime() + (asmt.time_limit_seconds ?? 300) * 1000
    );

    const { data: created, error: createError } = await admin
      .from("attempts")
      .insert({
        student_id: user.id,
        assessment_id: assessmentId,
        started_at: startedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        question_ids: picked,
        answers: {},
        is_final: false,
      })
      .select("id,question_ids,expires_at,started_at")
      .single();

    if (createError || !created) {
      console.error("Failed to create attempt", createError);
      return notFound();
    }

    const createdRow = created as unknown as {
      id: string;
      question_ids: string[];
      expires_at: string;
      started_at: string;
    };

    attempt = {
      id: createdRow.id,
      question_ids: createdRow.question_ids ?? [],
      expires_at: createdRow.expires_at,
      started_at: createdRow.started_at,
    };
  }

  // Load questions for the active attempt (or show summary if already final).
  const questionIds = attempt?.question_ids ?? [];
  const { data: qs } = questionIds.length
    ? await admin
        .from("questions")
        .select("id,question,options")
        .in("id", questionIds)
    : { data: [] as Array<{ id: string; question: string; options: string[] }> };

  const questions = ((qs ?? []) as unknown as Array<{
    id: string;
    question: string;
    options: string[];
  }>)
    .map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options ?? [],
    }))
    .sort((a, b) => questionIds.indexOf(a.id) - questionIds.indexOf(b.id));

  return (
    <AssessmentRunner
      assessment={{
        id: asmt.id,
        title: asmt.title,
        type: asmt.type,
        time_limit_seconds: asmt.time_limit_seconds,
        max_questions: asmt.max_questions,
      }}
      attempt={attempt}
      finalAttempt={finalAttempt}
      history={(historyRows ?? []) as unknown as AttemptHistoryRow[]}
      questions={questions}
    />
  );
}

