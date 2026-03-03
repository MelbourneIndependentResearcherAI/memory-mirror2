let supabase = null;
let supabasePromise = null;

async function initSupabase() {
  if (supabasePromise) return supabasePromise;
  
  supabasePromise = (async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      }
    } catch (err) {
      console.warn('Failed to initialize Supabase:', err.message);
    }
    return supabase;
  })();
  
  return supabasePromise;
}

export { initSupabase, supabase };