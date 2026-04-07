import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { signOut } from "@/app/(auth)/login/actions";

export async function Topbar() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let studentName: string | null = null;
  let studentEmail: string | null = null;
  if (user?.id) {
    const { data } = await getSupabaseAdmin()
      .from("students")
      .select("name,email")
      .eq("id", user.id)
      .maybeSingle();
    studentName = data?.name ?? null;
    studentEmail = data?.email ?? user.email ?? null;
  }

  const initials =
    (studentName ?? studentEmail ?? "Student")
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "ST";

  return (
    <header className="glass-panel sticky top-0 z-20 flex h-16 items-center justify-between rounded-2xl px-4">
      <div className="flex items-center gap-2 text-sm text-slate-700">
        <span className="pill">Academic Workload Simulator</span>
        <span className="hidden text-xs text-slate-500 md:inline">
          Not an LMS – a behavior-tracking learning simulation portal.
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 md:flex">
          <span className="mr-1 h-2 w-2 rounded-full bg-emerald-600" />
          Session active
        </div>

        <Link
          href="/course"
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Courses
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-medium text-slate-900">
                {studentName ?? "Student"}
              </p>
              <p className="text-[11px] text-slate-500">{studentEmail ?? ""}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700">
              {initials}
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

