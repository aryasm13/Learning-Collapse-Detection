import { ReactNode } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StudentIdSync } from "@/components/auth/StudentIdSync";
import { ensureSeedData } from "@/lib/data/seed";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Middleware already enforces auth, but we still read session here to bind
  // clickstream tracking to the real authenticated student id.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Keeps dev environments functional without manual seeding.
  await ensureSeedData();

  return (
    <DashboardShell>
      {user?.id ? <StudentIdSync studentId={user.id} /> : null}
      {children}
    </DashboardShell>
  );
}

