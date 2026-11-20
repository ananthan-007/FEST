'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    // Step 1: sign up (email confirmation disabled in Supabase dashboard)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        // No emailRedirectTo — confirmation is turned off on the dashboard
      },
    })

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes('already registered')) {
        setError('This email is already registered. Please sign in instead.')
      } else {
        setError(signUpError.message)
      }
      setLoading(false)
      return
    }

    // Step 2: if Supabase still returned a session (confirm disabled), we're in
    // If not (confirm still on), sign in immediately with the same credentials
    if (!signUpData.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        // Confirmation email is likely still enabled — inform user
        setError('Account created! Check your email for a confirmation link, then sign in.')
        setLoading(false)
        return
      }
    }

    // Step 3: seed the profile row
    await fetch('/api/user/profile').catch(() => {})

    // Step 4: redirect to profile completion
    router.push('/dashboard/profile?new=1')
    router.refresh()
    setLoading(false)
  }

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050A18] px-4">
      <div className="w-full max-w-sm space-y-5 bg-[#0D1321]/75 backdrop-blur-xl rounded-2xl border border-white/8 p-7 shadow-2xl">

        {/* Header */}
        <div className="flex flex-col items-center gap-2 pb-1">
          <svg width="40" height="40" viewBox="0 0 40 46" fill="none">
            <path d="M20 2L4 8v12c0 11 7 20.5 16 23.5C29 40.5 36 31 36 20V8L20 2z" fill="#C8102E" opacity="0.2" stroke="#C8102E" strokeWidth="1.5"/>
            <path d="M20 8l-9 3.5v8c0 6.5 4 12 9 14 5-2 9-7.5 9-14v-8L20 8z" fill="#C8102E" opacity="0.4"/>
          </svg>
          <h1 className="font-serif text-2xl text-[#DDE2F6]">Create Account</h1>
          <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8]">
            FEST 11.0 · Cadet Registration
          </p>
        </div>

        {/* Google */}
        <button
          onClick={handleGoogleSignup}
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

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10"/>
          <span className="text-[#8A94A8] text-xs uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-white/10"/>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-[#C8102E]/15 border border-[#C8102E]/30 text-[#FFB3B1] text-sm px-4 py-3 rounded-xl">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-2 ml-5">Full Name</p>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 w-full bg-[#0D1321]/70 border border-white/10 rounded-full px-5 text-[#DDE2F6] placeholder-[#8A94A8] text-sm focus:outline-none focus:ring-1 focus:ring-[#C8102E]/60"
              placeholder="Your full name"
            />
          </div>
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
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-2 ml-5">Confirm Password</p>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="h-12 w-full bg-[#0D1321]/70 border border-white/10 rounded-full px-5 text-[#DDE2F6] placeholder-[#8A94A8] text-sm focus:outline-none focus:ring-1 focus:ring-[#C8102E]/60"
              placeholder="Repeat password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full bg-[#C8102E] hover:bg-[#A00B22] text-white font-semibold rounded-full transition shadow-[0_0_20px_rgba(200,16,46,0.4)] disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-[#8A94A8]">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#C8102E] hover:text-[#E8203E] font-medium transition">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
