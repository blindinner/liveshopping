'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/host';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        },
      });

      if (error) {
        throw error;
      }

      setIsSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending link');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="bg-green-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Check Your Email</h1>
        <p className="text-white/60">We sent a login link to {email}</p>
        <button
          onClick={() => setIsSent(false)}
          className="mt-6 text-pink-400 hover:text-pink-300"
        >
          Send Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Host Login</h1>
        <p className="text-white/60">Enter your email to receive a login link</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          dir="ltr"
          error={error || undefined}
        />

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!email}
          className="w-full"
          size="lg"
        >
          Send Login Link
        </Button>
      </form>

      <button
        onClick={() => router.push('/')}
        className="mt-8 w-full text-center text-white/50 hover:text-white/70"
      >
        Back to Home
      </button>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="w-full max-w-sm">
      <div className="animate-pulse">
        <div className="h-8 bg-white/10 rounded mb-4 w-32 mx-auto" />
        <div className="h-4 bg-white/10 rounded mb-8 w-48 mx-auto" />
        <div className="h-12 bg-white/10 rounded mb-4" />
        <div className="h-12 bg-white/10 rounded" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-6">
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
