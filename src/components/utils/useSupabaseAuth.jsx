import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export function useSupabaseAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.auth.signUp({ email, password });
    if (err) setError(err.message);
    setLoading(false);
    return { data, error: err };
  };

  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    setLoading(false);
    return { data, error: err };
  };

  const signOut = async () => {
    setLoading(true);
    const { error: err } = await supabase.auth.signOut();
    if (err) setError(err.message);
    setLoading(false);
    return err;
  };

  return { user, loading, error, signUp, signIn, signOut };
}