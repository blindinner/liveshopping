'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ShowEmailSequence } from '@/types/database';

export interface SequenceWithStats extends ShowEmailSequence {
  stats: {
    pending: number;
    sent: number;
    failed: number;
    cancelled: number;
  };
}

export function useEmailSequences(showId: string) {
  const [sequences, setSequences] = useState<SequenceWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sequences
  const fetchSequences = useCallback(async () => {
    try {
      const response = await fetch(`/api/shows/${showId}/email-sequences`);
      if (!response.ok) {
        throw new Error('Failed to fetch email sequences');
      }
      const data = await response.json();
      setSequences(data.sequences || []);
      setError(null);
    } catch (err) {
      console.error('Fetch email sequences error:', err);
      setError('Failed to load email sequences');
    } finally {
      setIsLoading(false);
    }
  }, [showId]);

  // Initial fetch
  useEffect(() => {
    fetchSequences();
  }, [fetchSequences]);

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`email-sequences:${showId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'show_email_sequences',
          filter: `show_id=eq.${showId}`,
        },
        () => {
          // Refetch on any change
          fetchSequences();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showId, fetchSequences]);

  // Create sequence
  const createSequence = useCallback(async (
    data: {
      name: string;
      subject: string;
      body_html: string;
      body_text?: string;
      send_offset_minutes: number;
      enabled?: boolean;
    }
  ): Promise<ShowEmailSequence> => {
    try {
      const response = await fetch(`/api/shows/${showId}/email-sequences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create sequence');
      }

      const result = await response.json();
      return result.sequence;
    } catch (err) {
      console.error('Create sequence error:', err);
      throw err;
    }
  }, [showId]);

  // Update sequence
  const updateSequence = useCallback(async (
    sequenceId: string,
    data: Partial<{
      name: string;
      subject: string;
      body_html: string;
      body_text: string;
      send_offset_minutes: number;
      enabled: boolean;
    }>
  ): Promise<ShowEmailSequence> => {
    try {
      const response = await fetch(`/api/shows/${showId}/email-sequences/${sequenceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update sequence');
      }

      const result = await response.json();
      return result.sequence;
    } catch (err) {
      console.error('Update sequence error:', err);
      throw err;
    }
  }, [showId]);

  // Delete sequence
  const deleteSequence = useCallback(async (sequenceId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/shows/${showId}/email-sequences/${sequenceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete sequence');
      }
    } catch (err) {
      console.error('Delete sequence error:', err);
      throw err;
    }
  }, [showId]);

  // Toggle enabled
  const toggleEnabled = useCallback(async (sequenceId: string, enabled: boolean): Promise<void> => {
    await updateSequence(sequenceId, { enabled });
  }, [updateSequence]);

  return {
    sequences,
    isLoading,
    error,
    createSequence,
    updateSequence,
    deleteSequence,
    toggleEnabled,
    refresh: fetchSequences,
  };
}
