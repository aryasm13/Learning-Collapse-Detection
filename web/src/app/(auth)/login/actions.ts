"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type ActionState =
  | { ok: false; message: string }
  | { ok: true; message: string }
  | null;

function deriveNameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "Student";
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  return cleaned
    ? cleaned
        .split(" ")
        .filter(Boolean)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ")
    : "Student";
}

async function ensureStudentProfile(user: { id: string; email?: string | null }) {
  const email = user.email ?? null;
  const name = email ? deriveNameFromEmail(email) : "Student";

  const admin = getSupabaseAdmin();
  const studentsTable = admin.from("students" as never) as unknown as {
    upsert: (
      values: { id: string; email: string | null; name: string },
      options: { onConflict: string }
    ) => Promise<{ error: { message: string } | null }>;
  };
  const { error } = await studentsTable.upsert(
    { id: user.id, email, name },
    { onConflict: "id" }
  );

  if (error) {
    // Don't block login if profile upsert fails; UI should degrade gracefully.
    console.error("Failed to upsert students row", error);
  }
}

export async function signInWithEmail(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    const msg = error?.message ?? "Unable to sign in";
    // Supabase sometimes returns a generic message for unconfirmed emails.
    const friendly =
      /invalid login credentials/i.test(msg) || /email not confirmed/i.test(msg)
        ? "Unable to sign in. If you just signed up, you may need to confirm your email first."
        : msg;
    return { ok: false as const, message: friendly };
  }

  await ensureStudentProfile({ id: data.user.id, email: data.user.email });
  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function signUpWithEmail(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  // If the email provider (or Supabase) rate-limits confirmations, allow opting into a
  // dev-only autoconfirm path using the service role key (server-side only).
  if (error) {
    const msg = error.message ?? "Unable to sign up";
    const isRateLimit =
      /rate limit/i.test(msg) ||
      /too many/i.test(msg) ||
      /429/.test(msg) ||
      /over email rate limit/i.test(msg);

    const allowAutoconfirm =
      process.env.AUTH_AUTOCONFIRM === "true" && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (isRateLimit && allowAutoconfirm) {
      const admin = getSupabaseAdmin();
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createErr || !created.user) {
        return {
          ok: false as const,
          message: createErr?.message ?? msg,
        };
      }

      // Now sign in normally so the browser gets a session cookie.
      const { data: signedIn, error: signInErr } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInErr || !signedIn.user) {
        return {
          ok: false as const,
          message:
            signInErr?.message ??
            "Account created, but we couldn't start a session. Try signing in again.",
        };
      }

      await ensureStudentProfile({ id: signedIn.user.id, email: signedIn.user.email });
      redirect(next.startsWith("/") ? next : "/dashboard");
    }

    if (isRateLimit) {
      return {
        ok: false as const,
        message:
          "Email rate limit exceeded while sending confirmation. Wait a few minutes and try again, or for local dev set AUTH_AUTOCONFIRM=true (and ensure SUPABASE_SERVICE_ROLE_KEY is available) in web/.env.local, then restart the dev server.",
      };
    }

    return { ok: false as const, message: msg };
  }

  // If email confirmations are enabled, user may be null until confirmed.
  if (data.user) {
    await ensureStudentProfile({ id: data.user.id, email: data.user.email });
    redirect(next.startsWith("/") ? next : "/dashboard");
  }

  // Confirmation required: don't redirect to a protected area yet.
  return {
    ok: true as const,
    message:
      "Check your email to confirm your account, then come back and sign in. (If you're rate-limited, wait a few minutes.)",
  };
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

