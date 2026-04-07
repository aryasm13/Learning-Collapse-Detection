"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { submitAssessmentAttempt } from "./actions";

type ClientQuestion = { id: string; question: string; options: string[] };

type Props = {
  assessment: {
    id: string;
    title: string;
    type: "quiz" | "exam";
    time_limit_seconds: number;
    max_questions: number;
  };
  attempt: { id: string; expires_at: string; started_at: string; question_ids: string[] } | null;
  finalAttempt: { id: string; score: number; submitted_at: string; duration_seconds: number | null } | null;
  history: Array<{
    id: string;
    score: number | null;
    is_final: boolean;
    submitted_at: string | null;
    started_at: string;
    expires_at: string;
    duration_seconds: number | null;
    created_at: string;
  }>;
  questions: ClientQuestion[];
};

type ActionState = { ok: true; score: number } | { ok: false; message: string } | null;

function initialState(): ActionState {
  return null;
}

function formatSeconds(total: number) {
  const m = Math.floor(total / 60);
  const s = Math.max(0, total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function AssessmentRunner({
  assessment,
  attempt,
  finalAttempt,
  history,
  questions,
}: Props) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [nowMs, setNowMs] = useState(() => new Date().getTime());
  const formRef = useRef<HTMLFormElement | null>(null);
  const startedAtMs = useMemo(
    () => (attempt ? new Date(attempt.started_at).getTime() : new Date().getTime()),
    [attempt]
  );

  const [state, action, pending] = useActionState(submitAssessmentAttempt, initialState());

  const expiresAtMs = useMemo(
    () => (attempt ? new Date(attempt.expires_at).getTime() : new Date().getTime()),
    [attempt]
  );

  const secondsLeft = useMemo(() => {
    if (!attempt) return 0;
    return Math.max(0, Math.floor((expiresAtMs - nowMs) / 1000));
  }, [attempt, expiresAtMs, nowMs]);

  const answeredCount = useMemo(
    () => Object.keys(selected).length,
    [selected]
  );

  useEffect(() => {
    if (!attempt || finalAttempt) return;
    const t = setInterval(() => setNowMs(new Date().getTime()), 1000);
    return () => clearInterval(t);
  }, [attempt, finalAttempt]);

  useEffect(() => {
    if (!attempt || finalAttempt) return;
    if (secondsLeft > 0) return;
    if (pending) return;
    if (state?.ok) return;
    // Auto-submit when time reaches zero.
    formRef.current?.requestSubmit();
  }, [attempt, finalAttempt, pending, secondsLeft, state]);

  const effectiveScore =
    (state && state.ok ? state.score : null) ?? finalAttempt?.score ?? null;

  const submissionMessage =
    state && !state.ok ? state.message : null;

  const durationSeconds = useMemo(() => {
    const d = Math.round((nowMs - startedAtMs) / 1000);
    return Math.max(0, d);
  }, [startedAtMs, nowMs]);

  if (!attempt && finalAttempt) {
    return (
      <div className="space-y-4">
        <section className="card">
          <p className="pill mb-2">Assessment</p>
          <h1 className="text-xl font-semibold text-slate-900">{assessment.title}</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your submission is already finalized for this assessment.
          </p>
        </section>
        <section className="card space-y-2 text-sm text-slate-700">
          <div className="flex items-center justify-between">
            <span>Score</span>
            <span className="font-semibold text-emerald-700">{finalAttempt.score}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Submitted</span>
            <span className="font-mono text-xs">
              {new Date(finalAttempt.submitted_at).toLocaleString()}
            </span>
          </div>
        </section>

        {history.length ? (
          <section className="card">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Attempt history
            </p>
            <ul className="mt-3 space-y-2 text-xs text-slate-700">
              {history.map((h) => (
                <li key={h.id} className="flex items-center justify-between">
                  <span className="font-mono">{h.id.slice(0, 8)}</span>
                  <span>
                    {h.is_final ? "final" : "draft"} ·{" "}
                    {h.submitted_at
                      ? `submitted (${h.score ?? 0}%)`
                      : new Date(h.expires_at).getTime() < nowMs
                        ? "expired"
                        : "active"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="card">
        <p className="text-sm font-semibold text-slate-900">Unable to start attempt</p>
        <p className="mt-1 text-xs text-slate-600">
          No active attempt is available and the system couldn&apos;t create one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="pill mb-2">Assessment</p>
            <h1 className="text-xl font-semibold text-slate-900">
              {assessment.title}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Timed attempt with randomized questions. Scoring is computed server-side.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-700">
            <p className="font-medium text-slate-900">
              Timer: <span className="font-mono">{formatSeconds(secondsLeft)}</span>
            </p>
            <p className="mt-1 text-slate-600">
              Answered {answeredCount}/{questions.length}
            </p>
          </div>
        </div>
      </section>

      <form ref={formRef} action={action} className="space-y-3">
        <input type="hidden" name="attempt_id" value={attempt.id} />
        <input type="hidden" name="duration_seconds" value={durationSeconds} />
        <input type="hidden" name="answers_json" value={JSON.stringify(selected)} />

        <section className="space-y-3">
          {questions.map((q, idx) => (
            <div key={q.id} className="card space-y-2 text-sm">
              <p className="font-medium text-slate-900">
                Q{idx + 1}/{questions.length}. {q.question}
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                {q.options.map((opt) => {
                  const isSelected = selected[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        if (effectiveScore !== null) return;
                        if (secondsLeft === 0) return;
                        setSelected((prev) => ({ ...prev, [q.id]: opt }));
                      }}
                      className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                        isSelected
                          ? "border-emerald-400 bg-emerald-50 text-slate-900"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <section className="flex items-center justify-between gap-3 text-xs">
          <p className="text-slate-600">
            Submitting finalizes this attempt. The platform prevents repeated final
            submissions to keep behavior signals realistic.
          </p>
          <button
            type="submit"
            disabled={pending || effectiveScore !== null}
            className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {effectiveScore !== null ? "Submitted" : pending ? "Submitting..." : "Submit"}
          </button>
        </section>

        {submissionMessage ? (
          <section className="card border border-rose-200 bg-rose-50 text-xs text-rose-700">
            {submissionMessage}
          </section>
        ) : null}

        {effectiveScore !== null ? (
          <section className="card space-y-1 text-xs text-slate-700">
            <p className="font-semibold text-slate-900">Attempt report</p>
            <p>
              Score:{" "}
              <span className="font-semibold text-emerald-700">{effectiveScore}%</span>
            </p>
            <p>
              Time taken:{" "}
              <span className="font-mono">
                {Math.floor(durationSeconds / 60)}m {durationSeconds % 60}s
              </span>
            </p>
          </section>
        ) : null}
      </form>

      {history.length ? (
        <section className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Attempt history
          </p>
          <ul className="mt-3 space-y-2 text-xs text-slate-700">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between">
                <span className="font-mono">{h.id.slice(0, 8)}</span>
                <span>
                  {h.is_final ? "final" : "draft"} ·{" "}
                  {h.submitted_at
                    ? `submitted (${h.score ?? 0}%)`
                    : new Date(h.expires_at).getTime() < nowMs
                      ? "expired"
                      : "active"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

