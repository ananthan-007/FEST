import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cache } from 'react'

/**
 * Returns the cached admin client for this request lifecycle.
 * React cache() deduplicates across multiple calls within the same RSC render.
 */
const getCachedAdminClient = cache(() => createAdminClient())

/**
 * Verifies the current request's user has admin role.
 *
 * Performance notes:
 * - React cache() deduplicates this call per request — multiple admin API routes
 *   called in parallel still only hit the auth server once.
 * - Uses the admin (service-role) client to bypass RLS on profiles table.
 *
 * Returns the user object if admin, null otherwise.
 */
export const checkAdmin = cache(async () => {
  const supabase = await createClient()
  // getUser() makes a network call to verify the JWT token — this is the secure way.
  // The result is cached by React cache() so it's called at most once per request.
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const adminClient = getCachedAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin' ? user : null
})

/**
 * Verifies the current request's user has admin or volunteer role.
 */
export const checkVolunteer = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const adminClient = getCachedAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return ['admin', 'volunteer'].includes(profile?.role ?? '') ? user : null
})
