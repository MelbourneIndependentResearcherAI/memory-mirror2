
import { createClient } from '@supabase/supabase-js';

// Support both VITE_ prefixed (local dev) and non-prefixed (Base44 secrets exposed via backend)
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  '';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  '';

let supabase = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized');
  } catch (err) {
    console.warn('Supabase initialization failed:', err.message);
  }
} else {
  console.warn('⚠️ Supabase URL or Anon Key not found. Auth features will use Base44 auth only.');
}

export { supabase };
