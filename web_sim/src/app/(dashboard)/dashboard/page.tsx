"use client";

import Link from "next/link";
import { useMemo } from "react";

const demoVideoCompletion = [72, 81, 64, 90];
const demoQuizScores = [68, 74, 80, 76];
const demoExamScores = { CAT1: 72, CAT2: 78, FAT: 84 };

export default function DashboardPage() {
  const burnoutRisk = useMemo(() => {
    const avgScore =
      (demoExamScores.CAT1 + demoExamScores.CAT2 + demoExamScores.FAT) / 3;
    const avgCompletion =
      demoVideoCompletion.reduce((a, b) => a + b, 0) / demoVideoCompletion.length;
    if (avgCompletion > 80 && avgScore < 75) return "Elevated";
    if (avgCompletion < 50) return "Low (under-engaged)";
    return "Balanced";
  }, []);

  return (
    <div className="space-y-4">
      <section className="card">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="pill mb-2">Learning analytics overview</p>
            <h1 className="text-xl font-semibold text-slate-900">
              Academic workload snapshot for Machine Learning Techniques
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              This dashboard doesn&apos;t track grades in an LMS sense – it models your
              workload, behavior, and performance patterns across videos, quizzes, and
              exams.
            </p>
          </div>
          <div className="space-y-2 text-xs text-right">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span className="text-slate-700">
                Burnout risk:{" "}
                <span className="font-semibold text-emerald-700">{burnoutRisk}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Based on demo video completion, quiz scores, and exam simulations.
            </p>
            <Link
              href="/course"
              className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
            >
              Go to Machine Learning Techniques course
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Weekly video completion %
          </p>
          <div className="mt-3 flex h-32 items-end gap-2">
            {demoVideoCompletion.map((value, idx) => (
              <div key={idx} className="flex-1">
                <div className="relative h-24 rounded-xl bg-slate-100">
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-xl bg-emerald-600"
                    style={{ height: `${value}%` }}
                  />
                </div>
                <p className="mt-1 text-center text-[11px] text-slate-500">
                  W{idx + 1}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Quiz score trend
          </p>
          <div className="mt-3 h-32 rounded-xl bg-slate-50">
            <svg viewBox="0 0 100 40" className="h-full w-full">
              <polyline
                fill="none"
                stroke="#059669"
                strokeWidth="2"
                points={demoQuizScores
                  .map((score, idx) => {
                    const x = (idx / (demoQuizScores.length - 1 || 1)) * 100;
                    const y = 40 - (score / 100) * 30 - 5;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
            </svg>
          </div>
        </div>

        <div className="card">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Exam score summary
          </p>
          <div className="mt-3 space-y-2 text-xs text-slate-700">
            {Object.entries(demoExamScores).map(([label, value]) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span>{label}</span>
                  <span className="font-semibold text-emerald-700">{value}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-600"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

