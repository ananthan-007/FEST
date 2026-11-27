'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { SpotlightCard } from '@/components/reactbits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
        <SpotlightCard className="w-full max-w-sm p-7 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-[#E3B464] mx-auto" />
          <h1 className="font-serif text-2xl gold-gradient-text">Transmission Sent</h1>
          <p className="text-sm text-[#A89F91]">
            A password reset link has been dispatched to{' '}
            <span className="text-[#F5EFE6] font-medium">{email}</span>.
            Check your inbox and follow the instructions.
          </p>
          <Link
            href="/auth/login"
            className="inline-block mt-2 text-sm text-[#E3B464] hover:text-[#F4DD9F] transition"
          >
            ← Back to Login
          </Link>
        </SpotlightCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-space-dark px-4">
      <SpotlightCard className="w-full max-w-sm space-y-5 p-7">
        <div className="flex flex-col items-center gap-2 pb-1">
          <div className="w-12 h-12 rounded-2xl bg-[#CC892F]/15 border border-[#CC892F]/40 flex items-center justify-center">
            <Lock className="w-6 h-6 text-[#E3B464]" />
          </div>
          <h1 className="font-serif text-2xl gold-gradient-text">RESET ACCESS</h1>
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#A89F91]">
            CADET IDENTITY RECOVERY
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/12 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91] mb-2">
              Email Address
            </p>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Sending…' : 'Send Reset Link'}
          </Button>
        </form>

        <p className="text-center text-sm text-[#A89F91]">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-[#E3B464] hover:text-[#F4DD9F] transition">
            Sign In
          </Link>
        </p>
      </SpotlightCard>
    </div>
  );
}
