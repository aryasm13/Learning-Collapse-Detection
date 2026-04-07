import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAuthedUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, error: error?.message ?? "Not authenticated" } as const;
  }

  return { user, error: null } as const;
}

