"use client";

import { use, useEffect, useMemo, useState } from "react";

type Props = {
  params: Promise<{ week: string }>;
};

type Question = {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Which algorithm is typically used for binary classification?",
    options: ["K-Means", "Linear Regression", "Logistic Regression", "PCA"],
    correctIndex: 2,
  },
  {
    id: 2,
    text: "What does regularization primarily help with?",
    options: ["Underfitting", "Overfitting", "Feature scaling", "Data leakage"],
    correctIndex: 1,
  },
  {
    id: 3,
    text: "Which metric is most appropriate for imbalanced classes?",
    options: ["Accuracy", "MSE", "Precision/Recall", "R-squared"],
    correctIndex: 2,
  },
  {
    id: 4,
    text: "Cross‑validation is mainly used to:",
    options: [
      "Increase dataset size",
      "Tune hyperparameters robustly",
      "Reduce number of features",
      "Normalize input data",
    ],
    correctIndex: 1,
  },
  {
    id: 5,
    text: "Which of these is an unsupervised technique?",
    options: ["Logistic Regression", "Random Forest", "K-Means", "XGBoost"],
    correctIndex: 2,
  },
];

export default function AssessmentWeekPage({ params }: Props) {
  const { week } = use(params);
  const [selected, setSelected] = useState<Record<number, number | null>>({});
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted">(
    "idle"
  );
  const [score, setScore] = useState<number | null>(null);
  const [lastTimeTaken, setLastTimeTaken] = useState<number | null>(null);

  useEffect(() => {
    if (status === "submitted") return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  const formattedTime = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = (secondsLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [secondsLeft]);

  function handleSelect(questionId: number, optionIndex: number) {
    if (status === "submitted" || secondsLeft === 0) return;
    setSelected((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  async function handleSubmit() {
    if (status === "submitting" || status === "submitted") return;

    const correctCount = QUESTIONS.reduce((acc, q) => {
      const chosen = selected[q.id];
      return acc + (chosen === q.correctIndex ? 1 : 0);
    }, 0);
    const calculatedScore = Math.round((correctCount / QUESTIONS.length) * 100);
    const timeTaken = 5 * 60 - secondsLeft;

    setStatus("submitting");
    setScore(calculatedScore);
    setLastTimeTaken(timeTaken);

    try {
      await fetch("/api/quiz-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user",
          week: Number(week),
          score: calculatedScore,
          timeTaken,
        }),
      });
      setStatus("submitted");
    } catch {
      setStatus("idle");
    }
  }

  const answeredCount = Object.keys(selected).length;

  return (
    <div className="space-y-4">
      <section className="card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="pill mb-2">Assessment · Week {week}</p>
            <h1 className="text-xl font-semibold text-slate-50">
              Quick ML concept check
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              5 multiple‑choice questions to simulate assessment pressure and track your
              quiz behavior.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-950/80 px-4 py-3 text-xs text-slate-200">
            <p className="font-medium text-emerald-300">
              Timer: <span className="font-mono text-slate-50">{formattedTime}</span>
            </p>
            <p className="mt-1 text-slate-400">
              Answered {answeredCount}/{QUESTIONS.length}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {QUESTIONS.map((q) => (
          <div key={q.id} className="card space-y-2 text-sm">
            <p className="font-medium text-slate-100">
              Q{q.id}. {q.text}
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              {q.options.map((opt, idx) => {
                const isSelected = selected[q.id] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelect(q.id, idx)}
                    className={`rounded-xl border px-3 py-2 text-left text-xs transition hover:border-emerald-400/60 hover:bg-slate-900/80 ${
                      isSelected
                        ? "border-emerald-400 bg-slate-900 text-slate-50"
                        : "border-slate-700 bg-slate-950 text-slate-200"
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
        <p className="text-slate-400">
          This quiz is simulated. Submitting will mark this week&apos;s assignment as
          complete and feed your score into the analytics dashboard.
        </p>
        <button
          onClick={handleSubmit}
          disabled={status === "submitting" || status === "submitted"}
          className="inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 px-4 py-1.5 font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitted"
            ? "Assignment completed"
            : status === "submitting"
            ? "Submitting..."
            : "Submit answers"}
        </button>
      </section>

      {score !== null && lastTimeTaken !== null && (
        <section className="card space-y-1 text-xs text-slate-300">
          <p className="font-semibold text-slate-100">
            Week {week} assignment report
          </p>
          <p>
            Score: <span className="font-semibold text-emerald-300">{score}%</span>
          </p>
          <p>
            Time taken:{" "}
            <span className="font-mono">
              {Math.floor(lastTimeTaken / 60)}m {lastTimeTaken % 60}s
            </span>
          </p>
          <p className="text-slate-400">
            This is a simulated report. In a full setup, these results would aggregate
            into your workload analytics and burnout risk indicators.
          </p>
        </section>
      )}
    </div>
  );
}

