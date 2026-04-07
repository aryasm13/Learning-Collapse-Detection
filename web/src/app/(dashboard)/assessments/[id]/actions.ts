"use server";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAuthedUser } from "@/lib/data/auth";

function nowIso() {
  return new Date().toISOString();
}

export async function submitAssessmentAttempt(
  _prevState: { ok: true; score: number } | { ok: false; message: string } | null,
  formData: FormData
) {
  const attemptId = String(formData.get("attempt_id") ?? "").trim();
  const answersJson = String(formData.get("answers_json") ?? "{}");
  const clientDurationSeconds = Number(formData.get("duration_seconds") ?? 0);

  if (!attemptId) return { ok: false as const, message: "Missing attempt id" };

  let answers: Record<string, string> = {};
  try {
    answers = JSON.parse(answersJson);
  } catch {
    return { ok: false as const, message: "Invalid answer payload" };
  }

  const { user, error: authError } = await requireAuthedUser();
  if (!user) return { ok: false as const, message: authError };

  const admin = getSupabaseAdmin();

  // Load attempt, enforce ownership and anti-abuse constraints.
  const { data: attempt, error: attemptError } = await admin
    .from("attempts")
    .select("id,student_id,assessment_id,expires_at,submitted_at,is_final,question_ids,started_at")
    .eq("id", attemptId)
    .maybeSingle();

  if (attemptError || !attempt) {
    return { ok: false as const, message: "Attempt not found" };
  }
  const attemptRow = attempt as unknown as {
    student_id: string;
    assessment_id: string;
    expires_at: string;
    submitted_at: string | null;
    is_final: boolean;
    question_ids: string[];
    started_at: string;
  };

  if (attemptRow.student_id !== user.id) {
    return { ok: false as const, message: "Forbidden" };
  }

  if (attemptRow.submitted_at || attemptRow.is_final) {
    return { ok: false as const, message: "Attempt already submitted" };
  }

  const now = Date.now();
  const expiresAt = new Date(attemptRow.expires_at).getTime();
  if (Number.isFinite(expiresAt) && now > expiresAt) {
    return { ok: false as const, message: "Time expired" };
  }

  // Prevent multiple final submissions even if someone races.
  const { data: existingFinal } = await admin
    .from("attempts")
    .select("id")
    .eq("student_id", user.id)
    .eq("assessment_id", attemptRow.assessment_id)
    .eq("is_final", true)
    .limit(1);

  if (existingFinal && existingFinal.length > 0) {
    return { ok: false as const, message: "Final submission already exists" };
  }

  const qids = attemptRow.question_ids ?? [];
  const { data: questions, error: qError } = await admin
    .from("questions")
    .select("id,correct_answer")
    .in("id", qids);

  if (qError) {
    console.error("Failed to load correct answers", qError);
    return { ok: false as const, message: "Unable to score attempt" };
  }

  const correctById = new Map<string, string>();
  const qRows = (questions ?? []) as unknown as Array<{
    id: string;
    correct_answer: string;
  }>;
  for (const q of qRows) {
    correctById.set(q.id, q.correct_answer);
  }

  let correctCount = 0;
  for (const qid of qids) {
    const chosen = answers[qid];
    const correct = correctById.get(qid);
    if (chosen && correct && chosen === correct) correctCount += 1;
  }

  const score = Math.round((correctCount / Math.max(qids.length, 1)) * 100);
  const startedAt = new Date(attemptRow.started_at).getTime();
  const serverDurationSeconds = Number.isFinite(startedAt)
    ? Math.max(0, Math.round((now - startedAt) / 1000))
    : null;

  const duration_seconds = Number.isFinite(serverDurationSeconds)
    ? serverDurationSeconds
    : Number.isFinite(clientDurationSeconds)
      ? Math.max(0, Math.round(clientDurationSeconds))
      : null;

  const { error: updateError } = await admin
    .from("attempts")
    .update({
      answers,
      score,
      submitted_at: nowIso(),
      duration_seconds,
      is_final: true,
    })
    .eq("id", attemptId);

  if (updateError) {
    console.error("Failed to finalize attempt", updateError);
    return { ok: false as const, message: "Failed to submit attempt" };
  }

  return { ok: true as const, score };
}

