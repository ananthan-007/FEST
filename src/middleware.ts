import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js middleware:
 * 1. Refreshes Supabase session cookies on every request.
 * 2. Enforces role-based route guards:
 *    - /admin/*         → Admin only
 *    - /volunteer/scan  → Admin or Volunteer
 *    - /dashboard, /register/* → Any authenticated user
 *
 * Role lookup uses the service-role client directly — no RPC dependency.
 * This means no SQL function needs to be deployed; it works out of the box.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — MUST be called before any route guard logic
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Unauthenticated redirect ────────────────────────────────────────────────
  const protectedPrefixes = ['/dashboard', '/register', '/admin', '/volunteer']
  const needsAuth = protectedPrefixes.some((p) => pathname.startsWith(p))

  if (needsAuth && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (!user) return supabaseResponse

  // ── Only check role for protected role-gated routes ────────────────────────
  const needsRoleCheck =
    pathname.startsWith('/admin') || pathname.startsWith('/volunteer')

  if (!needsRoleCheck) return supabaseResponse

  // ── Fetch user role using service-role client (bypasses RLS, no RPC needed) ─
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role: string = profile?.role ?? 'user'

  // ── Admin-only routes ──────────────────────────────────────────────────────
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // ── Volunteer + Admin routes ───────────────────────────────────────────────
  if (pathname.startsWith('/volunteer') && !['admin', 'volunteer'].includes(role)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
