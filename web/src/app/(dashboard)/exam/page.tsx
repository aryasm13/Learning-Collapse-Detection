"use client";

import { useState } from "react";

type ExamType = "CAT1" | "CAT2" | "FAT";

export default function ExamSimulationPage() {
  const [status, setStatus] = useState<Record<ExamType, string>>({
    CAT1: "Not started",
    CAT2: "Not started",
    FAT: "Not started",
  });

  async function submitScore(examType: ExamType, score: number) {
    try {
      await fetch("/api/exam-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user",
          examType,
          score,
        }),
      });
      setStatus((prev) => ({ ...prev, [examType]: "Submitted" }));
    } catch {
      setStatus((prev) => ({ ...prev, [examType]: "Error" }));
    }
  }

  return (
    <div className="space-y-4">
      <section className="card">
        <p className="pill mb-2">Exam simulation</p>
        <h1 className="text-xl font-semibold text-slate-50">
          Observe your workload under exam pressure
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Model how CAT 1, CAT 2, and FAT influence your workload, pacing, and recovery
          rather than focusing on exam content itself.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {(["CAT1", "CAT2", "FAT"] as ExamType[]).map((type) => (
          <ExamCard
            key={type}
            examType={type}
            status={status[type]}
            onSubmitted={submitScore}
          />
        ))}
      </section>
    </div>
  );
}

function ExamCard({
  examType,
  status,
  onSubmitted,
}: {
  examType: ExamType;
  status: string;
  onSubmitted: (examType: ExamType, score: number) => void;
}) {
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState<number | "">("");
  const [startedAt, setStartedAt] = useState<Date | null>(null);

  const label =
    examType === "CAT1"
      ? "CAT 1"
      : examType === "CAT2"
      ? "CAT 2"
      : "FAT (Final Assessment Test)";

  return (
    <div className="card space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <span className="rounded-full bg-slate-950/80 px-2 py-0.5 text-[11px] text-slate-300">
          {started && status === "Not started" ? "In progress" : status}
        </span>
      </div>

      <p className="text-slate-300">
        Use this card to simulate when you would start, how confident you feel, and what
        score you expect to achieve under realistic workload.
      </p>

      <div className="space-y-2 text-xs">
        <button
          type="button"
          onClick={() => {
            if (!started) {
              setStarted(true);
              setStartedAt(new Date());
            }
          }}
          className="inline-flex items-center rounded-xl bg-slate-900 px-3 py-1.5 font-semibold text-slate-100 hover:bg-slate-800"
        >
          {started ? "Session in progress" : "Start exam session"}
        </button>

        {startedAt && (
          <p className="text-slate-400">
            Session started at{" "}
            <span className="font-mono">
              {startedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </p>
        )}

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={100}
            value={score}
            onChange={(e) => {
              const v = e.target.value;
              setScore(v === "" ? "" : Number(v));
            }}
            placeholder="Mock score (0–100)"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
          />
          <button
            type="button"
            disabled={!started || score === "" || Number(score) < 0 || Number(score) > 100}
            onClick={() => score !== "" && onSubmitted(examType, Number(score))}
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 px-3 py-1.5 font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

