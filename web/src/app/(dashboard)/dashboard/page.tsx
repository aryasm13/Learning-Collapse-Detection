import Link from "next/link";
import { requireAuthedUser } from "@/lib/data/auth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function insightFromMetrics(m: Record<string, unknown> | null) {
  const insights: string[] = [];
  if (!m) return insights;
  const procrastination = Number(m.procrastination_index ?? 0);
  const cognitiveLoad = Number(m.cognitive_load_estimate ?? 0);
  const engagement = Number(m.engagement_score ?? 0);

  if (procrastination >= 60) {
    insights.push("You show long idle gaps — distraction may be interrupting flow.");
  }
  if (cognitiveLoad >= 60) {
    insights.push("Rapid click bursts suggest confusion or high cognitive load.");
  }
  if (engagement <= 30) {
    insights.push("Engagement is low — try shorter, more frequent study blocks.");
  }
  if (!insights.length) {
    insights.push("Your interaction rhythm looks stable in the latest session window.");
  }
  return insights;
}

export default async function DashboardPage() {
  const { user } = await requireAuthedUser();
  const admin = getSupabaseAdmin();

  const studentId = user?.id ?? "";

  const [{ data: attempts }, { data: metricsRows }, { data: clicksRows }] =
    await Promise.all([
      admin
        .from("attempts")
        .select("assessment_id,score,submitted_at,created_at,duration_seconds")
        .eq("student_id", studentId)
        .eq("is_final", true)
        .order("submitted_at", { ascending: false })
        .limit(12),
      admin
        .from("behavior_metrics")
        .select("metrics,created_at,session_id")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(1),
      admin
        .from("clickstream_data")
        .select("date,sum_click")
        .eq("id_student", studentId)
        .order("date", { ascending: false })
        .limit(7),
    ]);

  const latestMetrics =
    (metricsRows?.[0]?.metrics as unknown as Record<string, unknown> | null) ?? null;
  const insights = insightFromMetrics(latestMetrics);

  const attemptRows = (attempts ?? []) as unknown as Array<{
    score: number | null;
  }>;
  const attemptScores = attemptRows
    .filter((a) => typeof a.score === "number")
    .slice()
    .reverse()
    .map((a) => a.score as number);

  const clickDays = (clicksRows ?? []).slice().reverse() as Array<{
    date: number;
    sum_click: number;
  }>;
  const maxClicks = Math.max(1, ...clickDays.map((d) => d.sum_click ?? 0));

  return (
    <div className="space-y-4">
      <section className="card">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="pill mb-2">Learning analytics overview</p>
            <h1 className="text-xl font-semibold text-slate-900">
              Your workload, engagement, and performance — computed from real activity
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              This dashboard aggregates your attempts and interaction rhythm to generate
              behavioral feedback.
            </p>
          </div>
          <div className="space-y-2 text-xs text-right">
            <Link
              href="/course"
              className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
            >
              Go to courses
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Engagement (clicks per day)
          </p>
          <div className="mt-3 flex h-32 items-end gap-2">
            {clickDays.length ? (
              clickDays.map((d) => {
                const h = Math.round(((d.sum_click ?? 0) / maxClicks) * 100);
                return (
                  <div key={d.date} className="flex-1">
                    <div className="relative h-24 rounded-xl bg-slate-100">
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-xl bg-emerald-600"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                    <p className="mt-1 text-center text-[11px] text-slate-500">
                      D{d.date}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500">
                No clickstream yet. Navigate through the app to generate behavior data.
              </p>
            )}
          </div>
        </div>

        <div className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Assessment performance trend
          </p>
          <div className="mt-3 h-32 rounded-xl bg-slate-50">
            {attemptScores.length >= 2 ? (
              <svg viewBox="0 0 100 40" className="h-full w-full">
                <polyline
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2"
                  points={attemptScores
                    .map((score, idx) => {
                      const x = (idx / (attemptScores.length - 1 || 1)) * 100;
                      const y = 40 - (score / 100) * 30 - 5;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                />
              </svg>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-500">
                Complete at least 2 attempts to see a trend.
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Behavior snapshot (latest session)
          </p>
          {latestMetrics ? (
            <div className="mt-3 space-y-2 text-xs text-slate-700">
              {(
                [
                  ["Engagement", latestMetrics.engagement_score],
                  ["Procrastination", latestMetrics.procrastination_index],
                  ["Cognitive load", latestMetrics.cognitive_load_estimate],
                ] as Array<[string, number]>
              ).map(([label, value]) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span>{label}</span>
                    <span className="font-semibold text-emerald-700">{value}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-500">
              No derived behavior metrics yet. Generate clickstream by interacting with
              the app.
            </p>
          )}
        </div>
      </section>

      <section className="card">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Behavior insights
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {insights.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

