'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Invalid email or password. Please try again.')
    } else {
      // Ensure profile row exists in database
      await fetch('/api/user/profile').catch(() => {})
      router.push(redirectTo)
      router.refresh()
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setError('')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    })
  }

  return (
    <div className="w-full max-w-sm space-y-5 bg-[#0D1321]/75 backdrop-blur-xl rounded-2xl border border-white/8 p-7 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 pb-1">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 3L5 9v10c0 9.5 6.4 18.4 15 21 8.6-2.6 15-11.5 15-21V9L20 3z" fill="#C8102E" opacity="0.2" stroke="#C8102E" strokeWidth="1.5"/>
          <path d="M20 10l-8 3.5v6c0 5.5 3.5 10.5 8 12 4.5-1.5 8-6.5 8-12v-6L20 10z" fill="#C8102E" opacity="0.5"/>
        </svg>
        <h1 className="font-serif text-2xl text-[#DDE2F6]">FEST 11.0</h1>
        <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8]">
          KERALA NCC CONCLAVE · CADET GATEWAY
        </p>
      </div>

      {/* Google Button */}
      <button
        onClick={handleGoogleLogin}
        className="h-12 w-full flex items-center justify-center gap-3 bg-[#242A39] hover:bg-[#2F3444] border border-white/10 rounded-full text-[#DDE2F6] text-sm font-medium transition"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      {/* OR Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/10"/>
        <span className="text-[#8A94A8] text-xs uppercase tracking-widest">or</span>
        <div className="flex-1 h-px bg-white/10"/>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-[#C8102E]/15 border border-[#C8102E]/30 text-[#FFB3B1] text-sm px-4 py-3 rounded-xl">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      {/* Email + Password Form */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-2 ml-5">Email</p>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full bg-[#0D1321]/70 border border-white/10 rounded-full px-5 text-[#DDE2F6] placeholder-[#8A94A8] text-sm focus:outline-none focus:ring-1 focus:ring-[#C8102E]/60"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-2 ml-5">Password</p>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full bg-[#0D1321]/70 border border-white/10 rounded-full px-5 text-[#DDE2F6] placeholder-[#8A94A8] text-sm focus:outline-none focus:ring-1 focus:ring-[#C8102E]/60"
            placeholder="••••••••"
          />
          <div className="flex justify-end mt-1 mr-1">
            <Link href="/auth/forgot-password" className="text-xs text-[#ADC6FF] hover:text-white transition">
              Forgot password?
            </Link>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-12 w-full bg-[#C8102E] hover:bg-[#A00B22] text-white font-semibold rounded-full transition shadow-[0_0_20px_rgba(200,16,46,0.4)] disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      {/* Bottom link */}
      <p className="text-center text-sm text-[#8A94A8]">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="text-[#C8102E] hover:text-[#E8203E] font-medium transition">
          Sign up
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-space-dark px-4">
      <Suspense fallback={<div className="text-[#8A94A8] text-sm">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
