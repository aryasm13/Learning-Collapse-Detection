"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { endExamSession, startExamSession, updateExamSession } from "./actions";

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function roundPct(x01: number) {
  return Math.round(clamp01(x01) * 100);
}

export function ExamSimulation() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [clicks, setClicks] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [focusLosses, setFocusLosses] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState<"idle" | "starting" | "active" | "ending">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  const pendingDeltasRef = useRef({
    click_count: 0,
    tab_switches: 0,
    focus_losses: 0,
    time_spent_seconds: 0,
  });

  useEffect(() => {
    if (status !== "active") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => {
    if (status !== "active") return;

    const onClick = () => {
      setClicks((c) => c + 1);
      pendingDeltasRef.current.click_count += 1;
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        setTabSwitches((x) => x + 1);
        pendingDeltasRef.current.tab_switches += 1;
      }
    };
    const onBlur = () => {
      setFocusLosses((x) => x + 1);
      pendingDeltasRef.current.focus_losses += 1;
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
    };
  }, [status]);

  // Flush deltas periodically to avoid chatty updates.
  useEffect(() => {
    if (status !== "active" || !sessionId) return;
    const t = setInterval(async () => {
      const deltas = pendingDeltasRef.current;
      pendingDeltasRef.current = {
        click_count: 0,
        tab_switches: 0,
        focus_losses: 0,
        time_spent_seconds: 0,
      };

      const dt = 5;
      deltas.time_spent_seconds += dt;
      pendingDeltasRef.current.time_spent_seconds = 0;

      const clicksPerMinute = seconds > 0 ? (clicks / seconds) * 60 : 0;
      const stress01 = clamp01(clicksPerMinute / 60 + (tabSwitches + focusLosses) / 20);
      const focus01 = clamp01(1 - (tabSwitches * 0.08 + focusLosses * 0.12));

      await updateExamSession({
        sessionId,
        deltas,
        behavior_state: {
          clicks_per_minute: Number(clicksPerMinute.toFixed(2)),
          stress_level: roundPct(stress01),
          focus_score: roundPct(focus01),
        },
      });
    }, 5000);

    return () => clearInterval(t);
  }, [clicks, focusLosses, sessionId, seconds, status, tabSwitches]);

  const clicksPerMinute = useMemo(
    () => (seconds > 0 ? (clicks / seconds) * 60 : 0),
    [clicks, seconds]
  );

  const stress01 = useMemo(
    () => clamp01(clicksPerMinute / 60 + (tabSwitches + focusLosses) / 20),
    [clicksPerMinute, focusLosses, tabSwitches]
  );

  const focus01 = useMemo(
    () => clamp01(1 - (tabSwitches * 0.08 + focusLosses * 0.12)),
    [focusLosses, tabSwitches]
  );

  async function handleStart() {
    setError(null);
    setStatus("starting");
    const res = await startExamSession();
    if (!res.ok) {
      setError(res.message);
      setStatus("idle");
      return;
    }
    setSessionId(res.session.id);
    setStartedAt(Date.now());
    setClicks(0);
    setTabSwitches(0);
    setFocusLosses(0);
    setSeconds(0);
    setStatus("active");
  }

  async function handleEnd() {
    if (!sessionId) return;
    setStatus("ending");
    setError(null);

    const payload = {
      focus_score: roundPct(focus01),
      stress_level: roundPct(stress01),
      clicks_per_minute: Number(clicksPerMinute.toFixed(2)),
      click_intensity: clicks,
      tab_switches: tabSwitches,
      focus_losses: focusLosses,
      time_spent_seconds: seconds,
      started_at_client: startedAt ? new Date(startedAt).toISOString() : null,
    };

    const res = await endExamSession({ sessionId, final_metrics: payload });
    if (!res.ok) {
      setError(res.message);
      setStatus("active");
      return;
    }
    setStatus("idle");
    setSessionId(null);
  }

  return (
    <div className="space-y-4">
      <section className="card">
        <p className="pill mb-2">Exam simulation</p>
        <h1 className="text-xl font-semibold text-slate-900">
          Real-time behavioral exam session
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          This engine tracks time spent, focus loss, tab switching, and click intensity to
          estimate stress and attention in real time.
        </p>
      </section>

      {error ? (
        <section className="card border border-rose-200 bg-rose-50 text-sm text-rose-700">
          {error}
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Session workspace</p>
            {status !== "active" ? (
              <button
                type="button"
                onClick={handleStart}
                disabled={status === "starting"}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {status === "starting" ? "Starting..." : "Start session"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEnd}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                End session
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-medium text-slate-900">Instructions</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600">
              <li>Keep this tab focused; switching tabs lowers focus score.</li>
              <li>Work steadily; rapid clicking increases stress estimate.</li>
              <li>End the session to persist metrics to your dashboard.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <p className="font-medium text-slate-900">Exam prompt</p>
            <p className="mt-2 text-sm text-slate-700">
              You are given an assessment window with limited time. Simulate how you
              would allocate attention: plan, answer, review, and submit without
              constantly context-switching.
            </p>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={status !== "active"}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Work item {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Real-time feedback
            </p>
            <div className="mt-3 space-y-3 text-sm">
              <MetricRow label="Time spent" value={`${seconds}s`} />
              <MetricRow label="Clicks" value={`${clicks}`} />
              <MetricRow label="Clicks/min" value={clicksPerMinute.toFixed(1)} />
              <MetricRow label="Tab switches" value={`${tabSwitches}`} />
              <MetricRow label="Focus losses" value={`${focusLosses}`} />
              <ProgressBar label="Focus score" value={roundPct(focus01)} />
              <ProgressBar label="Stress level" value={roundPct(stress01)} />
            </div>
          </div>

          <div className="card">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Interpretation
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-600">
              <li>
                Focus decreases when you blur the tab or switch away during the session.
              </li>
              <li>
                Stress increases with fast click cadence and frequent context switches.
              </li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-emerald-700">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-600"
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

