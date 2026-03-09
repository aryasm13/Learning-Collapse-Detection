"use client";

import { useState } from "react";

type Props = {
  week: number;
};

export default function WeekAssessmentForm({ week }: Props) {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setStatus("submitting");
      const res = await fetch("/api/weekly-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user",
          week,
          content,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setContent("");
    } catch {
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 2500);
    }
  }

  return (
    <div className="card flex flex-col">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        Weekly assessment submission
      </p>
      <p className="mt-2 text-sm text-slate-300">
        In a few sentences, describe how demanding this week felt, what took the most
        time, and where you felt most or least confident.
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-1 flex-col gap-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="Example: I spent more time than expected on tuning hyperparameters, and fell behind on readings..."
          className="min-h-[120px] flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
        />

        <div className="flex items-center justify-between gap-3 text-xs">
          <p className="text-slate-400">
            A mock score will be generated to simulate grading impact.
          </p>
          <button
            type="submit"
            disabled={status === "submitting" || !content.trim()}
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 px-4 py-1.5 font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "submitting" ? "Submitting..." : "Submit reflection"}
          </button>
        </div>
      </form>

      {status === "success" && (
        <p className="mt-2 text-[11px] text-emerald-300">
          Reflection saved. A mock grade will appear in analytics once data accumulates.
        </p>
      )}
      {status === "error" && (
        <p className="mt-2 text-[11px] text-rose-300">
          Something went wrong while saving your reflection.
        </p>
      )}
    </div>
  );
}

