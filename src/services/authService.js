/**
 * Supabase authentication service
 *
 * Wraps Supabase auth methods and keeps the public `users` profile table in
 * sync with Supabase auth.users so the rest of the app has a single place to
 * look up user metadata.
 */

import { supabase } from "@/config/supabase";

// ---------------------------------------------------------------------------
// Sign-up
// ---------------------------------------------------------------------------

/**
 * Register a new user with email and password.
 * On success the user's profile row is created in the `users` table.
 *
 * @param {string} email
 * @param {string} password
 * @param {string} [fullName]
 * @returns {Promise<import("@supabase/supabase-js").AuthResponse>}
 */
export async function signUp(email, password, fullName = "") {
  const response = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (!response.error && response.data.user) {
    await syncUserProfile(response.data.user, fullName);
  }

  return response;
}

// ---------------------------------------------------------------------------
// Sign-in
// ---------------------------------------------------------------------------

/**
 * Sign in an existing user with email and password.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("@supabase/supabase-js").AuthTokenResponsePassword>}
 */
export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

// ---------------------------------------------------------------------------
// Sign-out
// ---------------------------------------------------------------------------

/**
 * Sign out the currently authenticated user.
 *
 * @returns {Promise<import("@supabase/supabase-js").AuthResponse>}
 */
export async function signOut() {
  return supabase.auth.signOut();
}

// ---------------------------------------------------------------------------
// Current session / user
// ---------------------------------------------------------------------------

/**
 * Return the currently active session, or null if not authenticated.
 *
 * @returns {Promise<import("@supabase/supabase-js").Session|null>}
 */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Return the currently authenticated user, or null.
 *
 * @returns {Promise<import("@supabase/supabase-js").User|null>}
 */
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

/**
 * Send a password-reset email to the given address.
 *
 * @param {string} email
 * @returns {Promise<import("@supabase/supabase-js").AuthResponse>}
 */
export async function resetPassword(email) {
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

/**
 * Update the authenticated user's password (called after following the
 * password-reset link).
 *
 * @param {string} newPassword
 * @returns {Promise<import("@supabase/supabase-js").UserResponse>}
 */
export async function updatePassword(newPassword) {
  return supabase.auth.updateUser({ password: newPassword });
}

// ---------------------------------------------------------------------------
// Profile synchronisation
// ---------------------------------------------------------------------------

/**
 * Upsert a row in the public `users` table to keep it in sync with the
 * Supabase auth user record.
 *
 * @param {import("@supabase/supabase-js").User} user
 * @param {string} [fullName]
 * @returns {Promise<void>}
 */
export async function syncUserProfile(user, fullName = "") {
  const { error } = await supabase.from("users").upsert(
    {
      id: user.id,
      email: user.email,
      full_name: fullName || user.user_metadata?.full_name || "",
      avatar_url: user.user_metadata?.avatar_url ?? null,
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("Failed to sync user profile:", error.message);
  }
}
