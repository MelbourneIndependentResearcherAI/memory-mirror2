
let supabase = null;

try {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    // Supabase will be imported lazily when needed
    import('@supabase/supabase-js').then(({ createClient }) => {
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }).catch(err => {
      console.warn('Failed to load Supabase:', err.message);
    });
  }
} catch (err) {
  console.warn('Supabase initialization failed:', err.message);
}

export { supabase };
