'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import DhruvaLogo from '@/components/DhruvaLogo';
import { SpotlightCard } from '@/components/reactbits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
      <SpotlightCard className="w-full max-w-sm space-y-5 p-7">
        <div className="flex flex-col items-center gap-2 pb-1">
          <DhruvaLogo size="md" />
          <h1 className="font-serif text-2xl gold-gradient-text">NEW PASSPHRASE</h1>
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#A89F91]">
            SECURE YOUR IDENTITY
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
              New Password
            </p>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#A89F91] mb-2">
              Confirm Password
            </p>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Updating…' : 'Update Password'}
          </Button>
        </form>
      </SpotlightCard>
    </div>
  );
}
