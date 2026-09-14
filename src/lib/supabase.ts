import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Helper to verify if real, valid Supabase environment variables are present and not standard placeholders
export const isSupabaseConfigured = (): boolean => {
  if (!rawUrl || !rawKey) return false;
  if (
    rawUrl.includes('your-supabase-project') ||
    rawUrl.includes('YOUR_SUPABASE') ||
    rawKey.includes('your-anon-key') ||
    rawKey.includes('YOUR_SUPABASE')
  ) {
    return false;
  }
  try {
    const parsed = new URL(rawUrl);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && Boolean(parsed.hostname);
  } catch {
    return false;
  }
};

// Safely create client instance (will use dummy values if unconfigured to prevent throw)
const createSafeClient = (): SupabaseClient => {
  if (isSupabaseConfigured()) {
    try {
      return createClient(rawUrl, rawKey);
    } catch (err) {
      console.warn('Invalid Supabase configuration URL or key. Falling back to dummy client:', err);
    }
  }
  return createClient('https://placeholder.supabase.co', 'placeholder-key');
};

export const supabase = createSafeClient();

