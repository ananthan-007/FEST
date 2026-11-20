'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        window.location.origin + '/auth/callback?next=/auth/update-password',
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-space-dark px-4">
        <div className="w-full max-w-sm bg-[#0D1321]/75 backdrop-blur-xl rounded-2xl border border-white/8 p-7 shadow-2xl text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-[#C8102E]">check_circle</span>
          <h1 className="font-serif text-2xl text-[#DDE2F6]">Transmission Sent</h1>
          <p className="text-sm text-[#8A94A8]">
            A password reset link has been dispatched to{' '}
            <span className="text-[#DDE2F6] font-medium">{email}</span>.
            Check your inbox and follow the instructions.
          </p>
          <Link
            href="/auth/login"
            className="inline-block mt-2 text-sm text-[#ADC6FF] hover:text-white transition"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-space-dark px-4">
      <div className="w-full max-w-sm space-y-5 bg-[#0D1321]/75 backdrop-blur-xl rounded-2xl border border-white/8 p-7 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 pb-1">
          <span className="material-symbols-outlined text-5xl text-[#C8102E]">lock</span>
          <h1 className="font-serif text-2xl text-[#DDE2F6]">RESET ACCESS</h1>
          <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8]">
            CADET IDENTITY RECOVERY
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-[#C8102E]/15 border border-[#C8102E]/30 text-[#FFB3B1] text-sm px-4 py-3 rounded-xl">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-2 ml-5">Email Address</p>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12 w-full bg-[#0D1321]/70 border border-white/10 rounded-full px-5 text-[#DDE2F6] placeholder-[#8A94A8] text-sm focus:outline-none focus:ring-1 focus:ring-[#C8102E]/60"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full bg-[#C8102E] hover:bg-[#A00B22] text-white font-semibold rounded-full transition shadow-[0_0_20px_rgba(200,16,46,0.4)] disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>

        {/* Back link */}
        <p className="text-center text-sm text-[#8A94A8]">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-[#ADC6FF] hover:text-white transition">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
