"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabasePublicEnv } from "./env";

export function createSupabaseBrowserClient() {
  const { url, anon } = supabasePublicEnv();
  return createBrowserClient(
    url,
    anon
  );
}

