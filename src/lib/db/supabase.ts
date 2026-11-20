import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Universal Supabase query helper for server-side code.
 * Uses admin client to bypass RLS in trusted backend routes, or server client for session-aware queries.
 */
export async function getDb(admin = false) {
  if (admin) {
    return createAdminClient()
  }
  return await createServerSupabase()
}

export { createAdminClient }
