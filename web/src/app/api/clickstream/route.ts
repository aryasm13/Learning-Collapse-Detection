import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type GenericClickEventPayload = {
  idStudent?: string | null;
  eventType: string;
  elementId?: string | null;
  elementText?: string | null;
  pageURL: string;
  sessionId: string;
  userAgent: string;
  timestamp: string;
};

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v
  );
}

function computeBehaviorMetrics(events: GenericClickEventPayload[]) {
  const ordered = events
    .slice()
    .map((e) => ({ ...e, ts: new Date(e.timestamp).getTime() }))
    .filter((e) => Number.isFinite(e.ts))
    .sort((a, b) => a.ts - b.ts);

  if (ordered.length < 2) {
    return {
      engagement_score: 0,
      procrastination_index: 0,
      cognitive_load_estimate: 0,
      clicks_per_minute: 0,
      idle_gaps: 0,
      rapid_clicks: 0,
    };
  }

  const durationMs = Math.max(ordered[ordered.length - 1].ts - ordered[0].ts, 1);
  const clicks = ordered.filter((e) => e.eventType !== "page_view").length;
  const clicksPerMinute = (clicks / durationMs) * 60_000;

  let idleGaps = 0;
  let rapidClicks = 0;
  for (let i = 1; i < ordered.length; i++) {
    const gap = ordered[i].ts - ordered[i - 1].ts;
    if (gap >= 20_000) idleGaps += 1;
    if (gap <= 250) rapidClicks += 1;
  }

  // Simple derived metrics (0..100) based on interaction rhythm.
  const engagement_score = Math.max(
    0,
    Math.min(100, Math.round((clicksPerMinute / 30) * 100))
  );
  const procrastination_index = Math.max(
    0,
    Math.min(100, Math.round((idleGaps / 8) * 100))
  );
  const cognitive_load_estimate = Math.max(
    0,
    Math.min(
      100,
      Math.round(((rapidClicks / Math.max(clicks, 1)) * 0.7 + idleGaps * 0.05) * 100)
    )
  );

  return {
    engagement_score,
    procrastination_index,
    cognitive_load_estimate,
    clicks_per_minute: Number(clicksPerMinute.toFixed(2)),
    idle_gaps: idleGaps,
    rapid_clicks: rapidClicks,
  };
}

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

function urlToSiteId(pageURL: string): string {
  let pathname = pageURL;
  try {
    pathname = new URL(pageURL).pathname;
  } catch {
    // keep as-is (already a path)
  }

  const path = (pathname || "/").split("?")[0].split("#")[0];
  const courseMatch = path.match(/^\/course\/([^\/]+)/i);
  if (courseMatch) return courseMatch[1];
  const quizMatch = path.match(/^\/quiz\/(\d+)/i);
  if (quizMatch) return `quiz_${quizMatch[1]}`;

  return path.replace(/^\/+/, "").replace(/\/+?/g, "_") || "home";
}

function timestampToCourseDay(timestampIso: string): number {
  // Day since global course start (UTC). If not provided, default to day 1.
  const start = process.env.COURSE_START_UTC;
  if (!start) return 1;
  const startDate = new Date(start);
  const ts = new Date(timestampIso);
  const diffMs = ts.getTime() - startDate.getTime();
  return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Generic UI clickstream (batched)
    const maybe = body as { events?: unknown };
    if (Array.isArray(maybe.events)) {
      const events = maybe.events as GenericClickEventPayload[];

      if (!events.length) {
        return NextResponse.json(
          { status: "error", message: "No events provided" },
          { status: 400 }
        );
      }

      // Ensure envs early (clear error if missing)
      // SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are required by supabaseAdmin
      requiredEnv("SUPABASE_URL");
      requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

      // Aggregate to (id_student, id_site, date) => sum_click
      const counts = new Map<string, { idStudent: string; idSite: string; date: number; inc: number }>();

      for (const ev of events) {
        const { idStudent, eventType, pageURL, sessionId, userAgent, timestamp } = ev;
        if (!eventType || !pageURL || !sessionId || !userAgent || !timestamp) {
          throw new Error("Missing required click event fields");
        }

        const sid = (idStudent && idStudent.trim()) || `sid:${sessionId}`;
        const site = urlToSiteId(pageURL);
        const day = timestampToCourseDay(timestamp);

        const key = `${sid}__${site}__${day}`;
        const curr = counts.get(key);
        if (curr) curr.inc += 1;
        else counts.set(key, { idStudent: sid, idSite: site, date: day, inc: 1 });
      }

      const increments = Array.from(counts.values());
      await Promise.all(
        increments.map((row) =>
          getSupabaseAdmin().rpc("increment_clickstream", {
            p_id_student: row.idStudent,
            p_id_site: row.idSite,
            p_date: row.date,
            p_inc: row.inc,
          })
        )
      );

      // Intelligence layer: derive and persist behavior metrics from raw event rhythm.
      // Only persist when we have a real authenticated student UUID.
      const byStudentSession = new Map<string, GenericClickEventPayload[]>();
      for (const ev of events) {
        const sid = (ev.idStudent && ev.idStudent.trim()) || "";
        if (!sid || !isUuid(sid) || !isUuid(ev.sessionId)) continue;
        const key = `${sid}__${ev.sessionId}`;
        const arr = byStudentSession.get(key) ?? [];
        arr.push(ev);
        byStudentSession.set(key, arr);
      }

      await Promise.all(
        Array.from(byStudentSession.entries()).map(async ([key, evs]) => {
          const [studentId, sessionId] = key.split("__");
          const metrics = computeBehaviorMetrics(evs);
          const { error } = await getSupabaseAdmin().from("behavior_metrics").upsert(
            {
              student_id: studentId,
              session_id: sessionId,
              metrics: {
                ...metrics,
                window: {
                  from: evs[0]?.timestamp,
                  to: evs[evs.length - 1]?.timestamp,
                  event_count: evs.length,
                },
              },
            },
            { onConflict: "student_id,session_id" }
          );
          if (error) console.error("Failed to upsert behavior_metrics", error);
        })
      );

      return NextResponse.json({ status: "ok", aggregated: increments.length });
    }

    return NextResponse.json(
      {
        status: "error",
        message:
          "Invalid payload. Use the batched { events: [...] } format for clickstream ingestion.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error logging clickstream event", error);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

