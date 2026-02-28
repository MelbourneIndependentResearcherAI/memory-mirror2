/**
 * Supabase client configuration
 *
 * Reads project URL and anonymous key from Vite environment variables so that
 * credentials are never hard-coded and can differ between environments.
 *
 * Required environment variables:
 *   VITE_SUPABASE_URL      – Supabase project URL (e.g. https://xxxx.supabase.co)
 *   VITE_SUPABASE_ANON_KEY – Supabase anonymous/public key
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase is not fully configured. " +
      "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
