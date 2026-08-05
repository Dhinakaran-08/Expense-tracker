import { createClient } from '@supabase/supabase-js';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Common copy-paste mistake: pasting the REST/Auth API path (e.g.
// ".../rest/v1/") instead of the bare project URL. The client needs
// just the origin — it appends /rest/v1/, /auth/v1/, etc. itself.
if (supabaseUrl) {
  try {
    supabaseUrl = new URL(supabaseUrl).origin;
  } catch {
    // leave as-is; will fail the isSupabaseConfigured check below if invalid
  }
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(supabaseUrl) &&
  !supabaseAnonKey.includes('PASTE_YOUR_ANON_KEY') &&
  !supabaseAnonKey.includes('placeholder') &&
  !supabaseAnonKey.includes('your-anon-key')
);

if (import.meta.env.DEV && import.meta.env.VITE_SUPABASE_URL && !isSupabaseConfigured) {
  console.warn(
    '[ExpenseIQ] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY looks invalid — ' +
    'the app will fall back to local guest-mode storage instead of Supabase. ' +
    'The URL must look like https://xxxxxxxx.supabase.co with no extra path.'
  );
}

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key'
);
