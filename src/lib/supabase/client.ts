import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase browser client — use in Client Components.
 * Uses anon key; respects Row Level Security.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  return createBrowserClient(url, key)
}
