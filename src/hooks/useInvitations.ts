'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Invitation } from '@/types/database';

export function useInvitations(showId: string) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch invitations
  const fetchInvitations = useCallback(async () => {
    try {
      const response = await fetch(`/api/shows/${showId}/invitations`);
      if (!response.ok) {
        throw new Error('Failed to fetch invitations');
      }
      const data = await response.json();
      setInvitations(data.invitations || []);
      setError(null);
    } catch (err) {
      console.error('Fetch invitations error:', err);
      setError('Failed to load invitations');
    } finally {
      setIsLoading(false);
    }
  }, [showId]);

  // Initial fetch
  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`invitations:${showId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invitations',
          filter: `show_id=eq.${showId}`,
        },
        () => {
          // Refetch on any change
          fetchInvitations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showId, fetchInvitations]);

  // Add invitations
  const addInvitations = useCallback(async (emails: string[]): Promise<{ created: number; skipped: number }> => {
    try {
      const response = await fetch(`/api/shows/${showId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      });

      if (!response.ok) {
        throw new Error('Failed to create invitations');
      }

      const data = await response.json();
      // Invitations will be updated via real-time subscription
      return { created: data.created || 0, skipped: data.skipped || 0 };
    } catch (err) {
      console.error('Add invitations error:', err);
      throw err;
    }
  }, [showId]);

  // Remove invitation
  const removeInvitation = useCallback(async (invitationId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/shows/${showId}/invitations/${invitationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove invitation');
      }
      // Invitations will be updated via real-time subscription
    } catch (err) {
      console.error('Remove invitation error:', err);
      throw err;
    }
  }, [showId]);

  // Resend invitation email
  const resendInvitation = useCallback(async (invitationId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/shows/${showId}/invitations/${invitationId}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to resend invitation');
      }
      // Refresh to get updated sent_at
      fetchInvitations();
    } catch (err) {
      console.error('Resend invitation error:', err);
      throw err;
    }
  }, [showId, fetchInvitations]);

  // Send email to all pending invitations
  const sendAllEmails = useCallback(async (): Promise<{ sent: number; failed: number; total: number }> => {
    try {
      const response = await fetch(`/api/shows/${showId}/invitations/send-all`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send emails');
      }

      const result = await response.json();
      // Refresh to get updated sent_at
      fetchInvitations();
      return { sent: result.sent || 0, failed: result.failed || 0, total: result.total || 0 };
    } catch (err) {
      console.error('Send all emails error:', err);
      throw err;
    }
  }, [showId, fetchInvitations]);

  // Get invite URL
  const getInviteUrl = useCallback((invitation: Invitation): string => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/invite/${invitation.invite_token}`;
  }, []);

  // Copy invite link to clipboard
  const copyInviteLink = useCallback(async (invitation: Invitation): Promise<void> => {
    const url = getInviteUrl(invitation);
    await navigator.clipboard.writeText(url);
  }, [getInviteUrl]);

  return {
    invitations,
    isLoading,
    error,
    addInvitations,
    removeInvitation,
    resendInvitation,
    sendAllEmails,
    getInviteUrl,
    copyInviteLink,
    refresh: fetchInvitations,
  };
}
