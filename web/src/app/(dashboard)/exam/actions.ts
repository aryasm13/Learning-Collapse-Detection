"use server";

import { requireAuthedUser } from "@/lib/data/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v
  );
}

export async function startExamSession() {
  const { user, error } = await requireAuthedUser();
  if (!user) return { ok: false as const, message: error };

  const admin = getSupabaseAdmin();
  const { data, error: createError } = await admin
    .from("exam_sessions")
    .insert({
      student_id: user.id,
      started_at: new Date().toISOString(),
      behavior_state: {},
    })
    .select("id,started_at,tab_switches,focus_losses,click_count,time_spent_seconds")
    .single();

  if (createError || !data) {
    console.error("Failed to start exam session", createError);
    return { ok: false as const, message: "Unable to start session" };
  }

  const session = data as unknown as {
    id: string;
    started_at: string;
    tab_switches: number;
    focus_losses: number;
    click_count: number;
    time_spent_seconds: number;
  };

  return { ok: true as const, session };
}

export async function updateExamSession(input: {
  sessionId: string;
  deltas: {
    click_count?: number;
    tab_switches?: number;
    focus_losses?: number;
    time_spent_seconds?: number;
  };
  behavior_state?: Record<string, unknown>;
}) {
  const { user, error } = await requireAuthedUser();
  if (!user) return { ok: false as const, message: error };
  if (!isUuid(input.sessionId)) return { ok: false as const, message: "Bad session id" };

  const admin = getSupabaseAdmin();

  const { data: current, error: loadError } = await admin
    .from("exam_sessions")
    .select("id,student_id,behavior_state,click_count,tab_switches,focus_losses,time_spent_seconds")
    .eq("id", input.sessionId)
    .maybeSingle();

  if (loadError || !current) return { ok: false as const, message: "Session not found" };
  type ExamSessionRow = {
    id: string;
    student_id: string;
    behavior_state: Record<string, unknown> | null;
    click_count: number | null;
    tab_switches: number | null;
    focus_losses: number | null;
    time_spent_seconds: number | null;
  };
  const curr = current as unknown as ExamSessionRow;

  if (curr.student_id !== user.id) return { ok: false as const, message: "Forbidden" };

  const nextState = {
    ...(curr.behavior_state ?? {}),
    ...(input.behavior_state ?? {}),
  };

  const patch: Partial<ExamSessionRow> = {
    behavior_state: nextState,
    click_count: Math.max(
      0,
      (curr.click_count ?? 0) + (input.deltas.click_count ?? 0)
    ),
    tab_switches: Math.max(
      0,
      (curr.tab_switches ?? 0) + (input.deltas.tab_switches ?? 0)
    ),
    focus_losses: Math.max(
      0,
      (curr.focus_losses ?? 0) + (input.deltas.focus_losses ?? 0)
    ),
    time_spent_seconds: Math.max(
      0,
      (curr.time_spent_seconds ?? 0) + (input.deltas.time_spent_seconds ?? 0)
    ),
  };

  const { error: updateError } = await admin
    .from("exam_sessions")
    .update(patch)
    .eq("id", input.sessionId);

  if (updateError) {
    console.error("Exam session update failed", updateError);
    return { ok: false as const, message: "Update failed" };
  }

  return { ok: true as const };
}

export async function endExamSession(input: { sessionId: string; final_metrics: Record<string, unknown> }) {
  const { user, error } = await requireAuthedUser();
  if (!user) return { ok: false as const, message: error };
  if (!isUuid(input.sessionId)) return { ok: false as const, message: "Bad session id" };

  const admin = getSupabaseAdmin();

  const { data: session, error: loadError } = await admin
    .from("exam_sessions")
    .select("id,student_id,behavior_state")
    .eq("id", input.sessionId)
    .maybeSingle();

  if (loadError || !session) return { ok: false as const, message: "Session not found" };
  const sess = session as unknown as {
    id: string;
    student_id: string;
    behavior_state: Record<string, unknown> | null;
  };
  if (sess.student_id !== user.id) return { ok: false as const, message: "Forbidden" };

  const endedAt = new Date().toISOString();
  const { error: endError } = await admin
    .from("exam_sessions")
    .update({
      ended_at: endedAt,
      behavior_state: { ...(sess.behavior_state ?? {}), ...input.final_metrics },
    })
    .eq("id", input.sessionId);

  if (endError) {
    console.error("Failed to end exam session", endError);
    return { ok: false as const, message: "Unable to end session" };
  }

  const { error: metricsError } = await admin.from("behavior_metrics").upsert(
    {
      student_id: user.id,
      session_id: input.sessionId,
      metrics: {
        source: "exam_session",
        ended_at: endedAt,
        ...input.final_metrics,
      },
    },
    { onConflict: "student_id,session_id" }
  );

  if (metricsError) console.error("Failed to persist behavior_metrics for exam", metricsError);

  return { ok: true as const };
}

