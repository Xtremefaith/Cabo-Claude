// Supabase client for cross-device, private-group play.
//
// Configuration comes from build-time env vars (Vite):
//   VITE_SUPABASE_URL       — your project URL
//   VITE_SUPABASE_ANON_KEY  — the publishable anon key (safe in the client;
//                             access is enforced by Row-Level Security)
//
// When these aren't set the app stays in local-only mode (see store/), so the
// arcade keeps working before the backend is wired up.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

/**
 * Ensure this device has an anonymous identity so RLS has a stable auth.uid()
 * to tie group membership to. Safe to call repeatedly.
 */
export async function ensureAnonSession(): Promise<void> {
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    await supabase.auth.signInAnonymously();
  }
}
