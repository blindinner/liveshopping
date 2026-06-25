'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Poll, PollWithResults } from '@/types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Hook for active poll (viewer-facing)
export function useActivePoll(showId: string, viewerId: string) {
  const [activePoll, setActivePoll] = useState<PollWithResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const activePollIdRef = useRef<string | null>(null);

  // Keep ref in sync with state for use in subscription callbacks
  useEffect(() => {
    activePollIdRef.current = activePoll?.id || null;
  }, [activePoll?.id]);

  useEffect(() => {
    const supabase = createClient();

    // Load active poll
    async function loadActivePoll() {
      try {
        const response = await fetch(`/api/shows/${showId}/polls`);
        const data = await response.json();

        const active = data.polls?.find((p: Poll) => p.status === 'active');
        if (active) {
          // Get full poll with viewer vote info
          const pollResponse = await fetch(
            `/api/shows/${showId}/polls/${active.id}?viewerId=${viewerId}`
          );
          const pollData = await pollResponse.json();
          setActivePoll(pollData.poll);
        } else {
          setActivePoll(null);
        }
      } catch (error) {
        console.error('Failed to load active poll:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadActivePoll();

    // Subscribe to poll changes
    const channel = supabase
      .channel(`polls:${showId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'polls',
          filter: `show_id=eq.${showId}`,
        },
        () => {
          // Reload on any poll change
          loadActivePoll();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'poll_votes',
        },
        (payload) => {
          // Update vote counts in real-time
          if (activePollIdRef.current && payload.new) {
            const vote = payload.new as { poll_id: string; option_id: string };
            if (vote.poll_id === activePollIdRef.current) {
              setActivePoll((prev) => {
                if (!prev) return prev;
                const newOptions = prev.options.map((opt) => ({
                  ...opt,
                  vote_count:
                    opt.id === vote.option_id
                      ? (opt.vote_count || 0) + 1
                      : opt.vote_count || 0,
                }));
                return {
                  ...prev,
                  options: newOptions,
                  total_votes: prev.total_votes + 1,
                };
              });
            }
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showId, viewerId]);

  const submitVote = useCallback(
    async (optionId: string) => {
      if (!activePoll) return;

      try {
        const response = await fetch(
          `/api/shows/${showId}/polls/${activePoll.id}/vote`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              option_id: optionId,
              viewer_id: viewerId,
            }),
          }
        );

        const data = await response.json();

        if (data.success) {
          // Update local state with new vote counts
          setActivePoll((prev) => {
            if (!prev) return prev;
            const newOptions = prev.options.map((opt) => ({
              ...opt,
              vote_count: data.vote_counts[opt.id] || 0,
            }));
            return {
              ...prev,
              options: newOptions,
              total_votes: data.total_votes,
              viewer_vote: optionId,
            };
          });
        }
      } catch (error) {
        console.error('Failed to submit vote:', error);
      }
    },
    [showId, viewerId, activePoll]
  );

  const hasVoted = activePoll?.viewer_vote != null;

  return { activePoll, hasVoted, isLoading, submitVote };
}

// Hook for poll management (host-facing)
export function usePollManagement(showId: string) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPolls = useCallback(async () => {
    try {
      const response = await fetch(`/api/shows/${showId}/polls`);
      const data = await response.json();
      setPolls(data.polls || []);
    } catch (error) {
      console.error('Failed to load polls:', error);
    } finally {
      setIsLoading(false);
    }
  }, [showId]);

  useEffect(() => {
    const supabase = createClient();

    // Initial load
    async function initialLoad() {
      try {
        const response = await fetch(`/api/shows/${showId}/polls`);
        const data = await response.json();
        setPolls(data.polls || []);
      } catch (error) {
        console.error('Failed to load polls:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initialLoad();

    // Reload function for subscriptions
    async function reloadPolls() {
      try {
        const response = await fetch(`/api/shows/${showId}/polls`);
        const data = await response.json();
        setPolls(data.polls || []);
      } catch (error) {
        console.error('Failed to reload polls:', error);
      }
    }

    // Subscribe to poll changes and vote changes
    const channel = supabase
      .channel(`polls-manage:${showId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'polls',
          filter: `show_id=eq.${showId}`,
        },
        () => reloadPolls()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'poll_votes',
        },
        () => reloadPolls()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showId]);

  const createPoll = useCallback(
    async (question: string, options: string[]) => {
      try {
        const response = await fetch(`/api/shows/${showId}/polls`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, options }),
        });

        const data = await response.json();
        if (data.poll) {
          setPolls((prev) => [data.poll, ...prev]);
          return data.poll;
        }
      } catch (error) {
        console.error('Failed to create poll:', error);
      }
      return null;
    },
    [showId]
  );

  const launchPoll = useCallback(
    async (pollId: string) => {
      try {
        const response = await fetch(`/api/shows/${showId}/polls/${pollId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'active' }),
        });

        const data = await response.json();
        if (data.poll) {
          // Update all polls - the launched one is active, others are ended
          setPolls((prev) =>
            prev.map((p) =>
              p.id === pollId
                ? data.poll
                : p.status === 'active'
                ? { ...p, status: 'ended' as const }
                : p
            )
          );
        }
      } catch (error) {
        console.error('Failed to launch poll:', error);
      }
    },
    [showId]
  );

  const endPoll = useCallback(
    async (pollId: string) => {
      try {
        const response = await fetch(`/api/shows/${showId}/polls/${pollId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'ended' }),
        });

        const data = await response.json();
        if (data.poll) {
          setPolls((prev) =>
            prev.map((p) => (p.id === pollId ? data.poll : p))
          );
        }
      } catch (error) {
        console.error('Failed to end poll:', error);
      }
    },
    [showId]
  );

  const deletePoll = useCallback(
    async (pollId: string) => {
      try {
        await fetch(`/api/shows/${showId}/polls/${pollId}`, {
          method: 'DELETE',
        });
        setPolls((prev) => prev.filter((p) => p.id !== pollId));
      } catch (error) {
        console.error('Failed to delete poll:', error);
      }
    },
    [showId]
  );

  const activePoll = polls.find((p) => p.status === 'active') || null;

  return {
    polls,
    activePoll,
    isLoading,
    createPoll,
    launchPoll,
    endPoll,
    deletePoll,
    refresh: loadPolls,
  };
}
