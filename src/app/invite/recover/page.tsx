'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function RecoverInvitationPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/invitations/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
            <p className="text-white/60">
              If you have any pending invitations, we've sent them to <span className="text-white">{email}</span>
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-white font-medium mb-3">Didn't receive anything?</h2>
            <ul className="space-y-2 text-white/60 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-0.5">•</span>
                <span>Check your spam folder</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-0.5">•</span>
                <span>Make sure you entered the correct email</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-400 mt-0.5">•</span>
                <span>Your invitation may have expired or the event may have ended</span>
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                }}
                className="text-pink-400 hover:text-pink-300 text-sm transition-colors"
              >
                Try a different email
              </button>
            </div>
          </div>

          <p className="text-white/40 text-xs text-center mt-8">
            Need help? Contact us at benji@shoppablevids.com
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-pink-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Lost Your Invitation?</h1>
          <p className="text-white/60">
            Enter your email address and we'll resend your invitation link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-colors"
            />

            {error && (
              <p className="mt-3 text-red-400 text-sm">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting || !email}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              'Resend My Invitation'
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-white/40 text-sm mb-2">Already have your link?</p>
          <Link
            href="/"
            className="text-pink-400 hover:text-pink-300 text-sm transition-colors"
          >
            Go to homepage
          </Link>
        </div>

        <p className="text-white/40 text-xs text-center mt-8">
          Need help? Contact us at benji@shoppablevids.com
        </p>
      </div>
    </div>
  );
}
