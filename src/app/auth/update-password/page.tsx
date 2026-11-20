'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-space-dark px-4">
      <div className="w-full max-w-sm space-y-5 bg-[#0D1321]/75 backdrop-blur-xl rounded-2xl border border-white/8 p-7 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 pb-1">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 3L5 9v10c0 9.5 6.4 18.4 15 21 8.6-2.6 15-11.5 15-21V9L20 3z" fill="#C8102E" opacity="0.2" stroke="#C8102E" strokeWidth="1.5"/>
            <path d="M20 10l-8 3.5v6c0 5.5 3.5 10.5 8 12 4.5-1.5 8-6.5 8-12v-6L20 10z" fill="#C8102E" opacity="0.5"/>
          </svg>
          <h1 className="font-serif text-2xl text-[#DDE2F6]">NEW PASSPHRASE</h1>
          <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8]">
            SECURE YOUR IDENTITY
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
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-2 ml-5">New Password</p>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="h-12 w-full bg-[#0D1321]/70 border border-white/10 rounded-full px-5 text-[#DDE2F6] placeholder-[#8A94A8] text-sm focus:outline-none focus:ring-1 focus:ring-[#C8102E]/60"
            />
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8A94A8] mb-2 ml-5">Confirm Password</p>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              className="h-12 w-full bg-[#0D1321]/70 border border-white/10 rounded-full px-5 text-[#DDE2F6] placeholder-[#8A94A8] text-sm focus:outline-none focus:ring-1 focus:ring-[#C8102E]/60"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full bg-[#C8102E] hover:bg-[#A00B22] text-white font-semibold rounded-full transition shadow-[0_0_20px_rgba(200,16,46,0.4)] disabled:opacity-60"
          >
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
