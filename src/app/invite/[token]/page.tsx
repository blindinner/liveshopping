'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { InvitationAcceptForm } from '@/components/viewer/InvitationAcceptForm';
import type { Show, GuestProfile } from '@/types/database';

interface InvitationData {
  invitation: {
    id: string;
    email: string;
    status: string;
    show_id: string;
  };
  show: Show;
  guest_profile: GuestProfile | null;
}

export default function InvitationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = params.token as string;
  const isEmbedded = searchParams.get('embed') === 'true';

  const [data, setData] = useState<InvitationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInvitation();
  }, [token]);

  const fetchInvitation = async () => {
    try {
      const response = await fetch(`/api/invitations/${token}`);

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid invitation');
        return;
      }

      const invitationData = await response.json();

      // If already accepted, redirect to appropriate page
      if (invitationData.invitation.status === 'accepted') {
        if (isEmbedded) {
          // In embed mode, go directly to the live embed
          router.push(`/embed/${invitationData.show.id}?token=${token}`);
        } else {
          router.push(`/invite/${token}/accepted`);
        }
        return;
      }

      setData(invitationData);
    } catch (err) {
      console.error('Fetch invitation error:', err);
      setError('Failed to load invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (formData: {
    name: string;
    phone: string;
    company_name: string;
    vat_number: string;
    is_business: boolean;
    billing_address: string;
    billing_city: string;
    billing_postal_code: string;
    billing_country: string;
  }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/invitations/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to accept invitation');
      }

      // Determine where to redirect after registration
      if (!data) {
        router.push(`/invite/${token}/accepted`);
      } else if (isEmbedded) {
        // In embed mode, always go to the embed viewer
        router.push(`/embed/${data.show.id}?token=${token}`);
      } else if (data.show.status === 'live') {
        // If show is live, go directly to the live show
        // Use embed_url if configured
        if (data.show.embed_url) {
          const url = new URL(data.show.embed_url);
          url.searchParams.set('token', token);
          window.location.href = url.toString();
        } else {
          router.push(`/live/${data.show.id}?token=${token}`);
        }
      } else {
        // Otherwise, go to the confirmation page with calendar options
        router.push(`/invite/${token}/accepted`);
      }
    } catch (err) {
      console.error('Accept invitation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/invitations/${token}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to decline invitation');
      }

      // Show declined message
      setError('You have declined this invitation.');
      setData(null);
    } catch (err) {
      console.error('Decline invitation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to decline invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 rounded-2xl p-8 border border-white/10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Invitation Not Available</h1>
          <p className="text-white/60">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">You're Invited!</h1>
          <p className="text-white/60">You have been invited to a private auction</p>
        </div>

        {/* Show details card */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{data.show.title}</h2>
              <p className="text-white/60 text-sm mt-1">
                {formatDate(data.show.scheduled_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && data && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Returning guest notice */}
        {data.guest_profile && (
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-blue-400 text-sm">
              Welcome back! We've pre-filled your information from your previous visit.
            </p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Complete Your Registration</h3>
          <p className="text-white/60 text-sm mb-6">
            Please provide your billing information. This will be used to send you an invoice if you win any auctions.
          </p>

          <InvitationAcceptForm
            email={data.invitation.email}
            existingProfile={data.guest_profile}
            onAccept={handleAccept}
            onDecline={handleDecline}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
