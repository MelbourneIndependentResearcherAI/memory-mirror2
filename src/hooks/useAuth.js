/**
 * useAuth – React hook for Supabase authentication state
 *
 * Listens to Supabase auth state changes and exposes the current user/session
 * as well as convenience wrappers for sign-up, sign-in, sign-out and password
 * reset.
 *
 * Usage:
 *   const { user, session, loading, signIn, signOut } = useAuth();
 */

import { useState, useEffect } from "react";
import { supabase } from "@/config/supabase";
import {
  signUp as authSignUp,
  signIn as authSignIn,
  signOut as authSignOut,
  resetPassword as authResetPassword,
  syncUserProfile,
} from "@/services/authService";

/**
 * @typedef {Object} UseAuthReturn
 * @property {import("@supabase/supabase-js").User|null}    user      - Current user, or null.
 * @property {import("@supabase/supabase-js").Session|null} session   - Current session, or null.
 * @property {boolean}  loading       - True while the initial session is being resolved.
 * @property {string|null} error      - Last auth error message, if any.
 * @property {Function} signUp        - (email, password, fullName?) => Promise
 * @property {Function} signIn        - (email, password) => Promise
 * @property {Function} signOut       - () => Promise
 * @property {Function} resetPassword - (email) => Promise
 */

/**
 * @returns {UseAuthReturn}
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Resolve the initial session synchronously via getSession.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to subsequent auth state changes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ------------------------------------------------------------------
  // Wrapped helpers that capture errors into local state
  // ------------------------------------------------------------------

  const signUp = async (email, password, fullName = "") => {
    setError(null);
    const response = await authSignUp(email, password, fullName);
    if (response.error) setError(response.error.message);
    return response;
  };

  const signIn = async (email, password) => {
    setError(null);
    const response = await authSignIn(email, password);
    if (response.error) setError(response.error.message);
    else if (response.data.user) {
      await syncUserProfile(response.data.user);
    }
    return response;
  };

  const signOut = async () => {
    setError(null);
    const response = await authSignOut();
    if (response.error) setError(response.error.message);
    return response;
  };

  const resetPassword = async (email) => {
    setError(null);
    const response = await authResetPassword(email);
    if (response.error) setError(response.error.message);
    return response;
  };

  return { user, session, loading, error, signUp, signIn, signOut, resetPassword };
}
