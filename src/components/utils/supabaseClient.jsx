
let supabase = null;

try {
  const { createClient } = await import('@supabase/supabase-js');
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    // Preserving the original warning for missing configuration
    console.warn('Supabase not configured - features requiring Supabase will not work');
  }
} catch (err) {
  console.warn('Supabase not available:', err.message);
  // Also warn that features requiring Supabase will not work if the module itself failed to load
  console.warn('Features requiring Supabase will not work due to module loading failure.');
}

export { supabase };
