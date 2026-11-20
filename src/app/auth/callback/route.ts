import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * OAuth callback handler — Supabase exchanges the code for a session here.
 * Also ensures the user profile exists in database and redirects appropriately.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data?.user) {
      try {
        const adminClient = createAdminClient()
        await adminClient.from('profiles').upsert(
          {
            id: data.user.id,
            email: data.user.email || '',
            display_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Cadet',
            role: 'user',
          },
          { onConflict: 'id', ignoreDuplicates: true }
        )
      } catch (err) {
        console.error('[auth/callback] Error syncing profile:', err)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth error — redirect to login with error flag
  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}
