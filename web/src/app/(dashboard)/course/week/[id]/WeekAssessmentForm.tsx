"use client";

import { useActionState, useState } from "react";
import { submitWeekReflection } from "./actions";

type Props = {
  week: number;
};

export default function WeekAssessmentForm({ week }: Props) {
  const [content, setContent] = useState("");
  const [state, action, pending] = useActionState(submitWeekReflection, null);

  return (
    <div className="card flex flex-col">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        Weekly assessment submission
      </p>
      <p className="mt-2 text-sm text-slate-300">
        In a few sentences, describe how demanding this week felt, what took the most
        time, and where you felt most or least confident.
      </p>

      <form action={action} className="mt-3 flex flex-1 flex-col gap-3">
        <input type="hidden" name="week" value={week} />
        <input type="hidden" name="content" value={content} />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="Example: I spent more time than expected on tuning hyperparameters, and fell behind on readings..."
          className="min-h-[120px] flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
        />

        <div className="flex items-center justify-between gap-3 text-xs">
          <p className="text-slate-400">
            Saved reflections affect your workload model and behavior insights.
          </p>
          <button
            type="submit"
            disabled={pending || !content.trim()}
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 px-4 py-1.5 font-semibold text-slate-950 shadow-md shadow-emerald-500/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Submitting..." : "Submit reflection"}
          </button>
        </div>
      </form>

      {state?.ok && (
        <p className="mt-2 text-[11px] text-emerald-300">
          Reflection saved. Workload index:{" "}
          <span className="font-semibold">{state.workload_index}%</span>.
        </p>
      )}
      {state && !state.ok && (
        <p className="mt-2 text-[11px] text-rose-300">
          {state.message}
        </p>
      )}
    </div>
  );
}

