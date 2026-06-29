'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type AuthMode = 'signin' | 'signup' | 'magic-link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/host';

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
          },
        });
        if (error) throw error;
        setIsSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(redirect);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
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

      if (error) throw error;
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
        <p className="text-white/60">
          {authMode === 'signup'
            ? `We sent a confirmation link to ${email}`
            : `We sent a login link to ${email}`}
        </p>
        <button
          onClick={() => setIsSent(false)}
          className="mt-6 text-pink-400 hover:text-pink-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Host Login</h1>
        <p className="text-white/60">
          {authMode === 'signup'
            ? 'Create your account'
            : authMode === 'magic-link'
            ? 'Get a login link via email'
            : 'Sign in to your account'}
        </p>
      </div>

      {authMode === 'magic-link' ? (
        <form onSubmit={handleMagicLink} className="space-y-6">
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
            Send Magic Link
          </Button>
        </form>
      ) : (
        <form onSubmit={handlePasswordAuth} className="space-y-4">
          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir="ltr"
          />

          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            dir="ltr"
            error={error || undefined}
          />

          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!email || !password}
            className="w-full"
            size="lg"
          >
            {authMode === 'signup' ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>
      )}

      {/* Auth mode toggles */}
      <div className="mt-6 space-y-3 text-center">
        {authMode === 'signin' && (
          <>
            <button
              onClick={() => setAuthMode('signup')}
              className="text-white/60 hover:text-white text-sm"
            >
              Don't have an account? <span className="text-pink-400">Sign up</span>
            </button>
            <div className="text-white/30 text-xs">or</div>
            <button
              onClick={() => setAuthMode('magic-link')}
              className="text-white/60 hover:text-white text-sm"
            >
              Sign in with <span className="text-pink-400">magic link</span>
            </button>
          </>
        )}

        {authMode === 'signup' && (
          <button
            onClick={() => setAuthMode('signin')}
            className="text-white/60 hover:text-white text-sm"
          >
            Already have an account? <span className="text-pink-400">Sign in</span>
          </button>
        )}

        {authMode === 'magic-link' && (
          <button
            onClick={() => setAuthMode('signin')}
            className="text-white/60 hover:text-white text-sm"
          >
            Sign in with <span className="text-pink-400">password</span>
          </button>
        )}
      </div>

      <button
        onClick={() => router.push('/shows')}
        className="mt-8 w-full text-center text-white/50 hover:text-white/70"
      >
        Browse Shows
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
