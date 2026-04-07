"use client";

import { useActionState, useMemo, useState } from "react";
import { signInWithEmail, signUpWithEmail } from "./actions";

type ActionState =
  | { ok: false; message: string }
  | { ok: true; message: string }
  | null;

function initialState(): ActionState {
  return null;
}

export function LoginPanel({ nextPath }: { nextPath: string }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInAction, signInPending] = useActionState(
    signInWithEmail,
    initialState()
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUpWithEmail,
    initialState()
  );

  const state = mode === "signin" ? signInState : signUpState;
  const pending = mode === "signin" ? signInPending : signUpPending;
  const action = mode === "signin" ? signInAction : signUpAction;

  const title = useMemo(
    () => (mode === "signin" ? "Sign in" : "Create your account"),
    [mode]
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-800/80 p-8 shadow-2xl shadow-slate-950/60">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-400 text-slate-900 font-bold">
              AW
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-50">
                Academic Workload Simulator
              </p>
              <p className="text-xs text-slate-400">
                Behavior-driven learning simulation platform
              </p>
            </div>
          </div>

          <div className="inline-flex rounded-2xl border border-slate-800 bg-slate-950/40 p-1 text-xs">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`rounded-xl px-3 py-1.5 font-medium transition ${
                mode === "signin"
                  ? "bg-emerald-400 text-slate-950"
                  : "text-slate-200 hover:bg-slate-900"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-xl px-3 py-1.5 font-medium transition ${
                mode === "signup"
                  ? "bg-emerald-400 text-slate-950"
                  : "text-slate-200 hover:bg-slate-900"
              }`}
            >
              Sign up
            </button>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-slate-50">{title}</h1>
        <p className="mt-1 text-sm text-slate-400">
          Use email + password. Your simulation state and analytics will persist across
          sessions.
        </p>

        <form className="mt-6 space-y-4" action={action}>
          <input type="hidden" name="next" value={nextPath} />
          <div className="space-y-1.5 text-sm">
            <label
              htmlFor="email"
              className="block text-xs font-medium uppercase tracking-wide text-slate-300"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@university.edu"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <div className="space-y-1.5 text-sm">
            <label
              htmlFor="password"
              className="block text-xs font-medium uppercase tracking-wide text-slate-300"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {state?.message && (
            <div
              className={
                state.ok
                  ? "rounded-2xl border border-emerald-900/40 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-100"
                  : "rounded-2xl border border-rose-900/40 bg-rose-950/40 px-3 py-2 text-xs text-rose-200"
              }
            >
              {state.message}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 px-3 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Working..." : mode === "signin" ? "Enter simulation" : "Create account"}
          </button>
        </form>

        <div className="mt-5 space-y-2 rounded-2xl bg-slate-950/60 p-4 text-xs text-slate-300">
          <p className="font-medium text-slate-100">Privacy & safety</p>
          <p>
            This platform models workload and behavior. Your data is stored per account
            and used to generate feedback, not to assign real grades.
          </p>
        </div>
      </div>
    </div>
  );
}

