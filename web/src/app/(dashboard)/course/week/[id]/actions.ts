"use server";

import crypto from "crypto";
import { requireAuthedUser } from "@/lib/data/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function estimateWorkloadIndex(text: string) {
  const t = text.toLowerCase();
  const words = t.split(/\s+/).filter(Boolean);
  const lengthScore = Math.min(1, words.length / 120);
  const stressWords = ["stress", "overwhelmed", "panic", "tired", "exhausted", "behind", "confused"];
  const hit = stressWords.reduce((acc, w) => acc + (t.includes(w) ? 1 : 0), 0);
  const stressScore = Math.min(1, hit / 4);
  return Math.round((lengthScore * 0.6 + stressScore * 0.4) * 100);
}

export async function submitWeekReflection(
  _prevState:
    | { ok: false; message: string }
    | { ok: true; workload_index: number }
    | null,
  formData: FormData
) {
  const { user, error } = await requireAuthedUser();
  if (!user) return { ok: false as const, message: error };

  const week = Number(formData.get("week") ?? 0);
  const content = String(formData.get("content") ?? "").trim();

  if (!Number.isFinite(week) || week < 1) {
    return { ok: false as const, message: "Invalid week" };
  }
  if (!content) return { ok: false as const, message: "Reflection is required" };

  const workload_index = estimateWorkloadIndex(content);
  const admin = getSupabaseAdmin();

  const session_id = crypto.randomUUID();
  const { error: insertError } = await admin.from("behavior_metrics").insert({
    student_id: user.id,
    session_id,
    metrics: {
      source: "weekly_reflection",
      week,
      workload_index,
      content,
      created_at: new Date().toISOString(),
    },
  });

  if (insertError) {
    console.error("Failed to store reflection", insertError);
    return { ok: false as const, message: "Unable to save reflection" };
  }

  return { ok: true as const, workload_index };
}

