'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Invitation, GuestProfile } from '@/types/database';

interface PrivateShowSession {
  invitation_id: string;
  viewer_id: string;
  token: string;
}

interface PrivateShowAccessResult {
  isAuthorized: boolean;
  isValidating: boolean;
  invitation: Invitation | null;
  guestProfile: GuestProfile | null;
  viewerId: string | null;
  error: string | null;
  needsRegistration: boolean;
  pendingToken: string | null;
}

export function usePrivateShowAccess(showId: string, token?: string | null): PrivateShowAccessResult {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  const getStorageKey = useCallback(() => `private_show_${showId}`, [showId]);

  // Check localStorage for existing session
  const getStoredSession = useCallback((): PrivateShowSession | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(getStorageKey());
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, [getStorageKey]);

  // Store session in localStorage
  const storeSession = useCallback((session: PrivateShowSession) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(session));
    } catch {
      // Storage might be full or disabled
    }
  }, [getStorageKey]);

  // Validate token with API
  const validateToken = useCallback(async (tokenToValidate: string) => {
    try {
      const response = await fetch(`/api/invitations/${tokenToValidate}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid invitation');
      }

      const data = await response.json();

      // Check if invitation belongs to this show
      if (data.invitation.show_id !== showId) {
        throw new Error('This invitation is for a different show');
      }

      // Check if invitation is pending (needs registration)
      if (data.invitation.status === 'pending') {
        setNeedsRegistration(true);
        setPendingToken(tokenToValidate);
        setIsAuthorized(false);
        setError(null);
        return;
      }

      // Check if invitation is accepted
      if (data.invitation.status !== 'accepted') {
        throw new Error('This invitation is no longer valid');
      }

      // Generate viewer_id from invitation
      const invitedViewerId = `invited-${data.invitation.id}`;

      // Store session
      storeSession({
        invitation_id: data.invitation.id,
        viewer_id: invitedViewerId,
        token: tokenToValidate,
      });

      setInvitation(data.invitation);
      setGuestProfile(data.guest_profile);
      setViewerId(invitedViewerId);
      setIsAuthorized(true);
      setNeedsRegistration(false);
      setPendingToken(null);
      setError(null);
    } catch (err) {
      console.error('Token validation error:', err);
      setError(err instanceof Error ? err.message : 'Invalid invitation');
      setIsAuthorized(false);
    }
  }, [showId, storeSession]);

  // Validate stored session
  const validateStoredSession = useCallback(async (session: PrivateShowSession) => {
    try {
      const response = await fetch(`/api/invitations/${session.token}`);

      if (!response.ok) {
        // Session is invalid, clear it
        localStorage.removeItem(getStorageKey());
        throw new Error('Session expired');
      }

      const data = await response.json();

      // Check if still valid for this show
      if (data.invitation.show_id !== showId || data.invitation.status !== 'accepted') {
        localStorage.removeItem(getStorageKey());
        throw new Error('Session invalid');
      }

      setInvitation(data.invitation);
      setGuestProfile(data.guest_profile);
      setViewerId(session.viewer_id);
      setIsAuthorized(true);
      setError(null);
    } catch (err) {
      console.error('Stored session validation error:', err);
      setIsAuthorized(false);
      // Don't set error for stored session failures - let user try with token
    }
  }, [showId, getStorageKey]);

  useEffect(() => {
    const checkAccess = async () => {
      setIsValidating(true);

      // First, check if there's a token in the URL
      if (token) {
        await validateToken(token);
        setIsValidating(false);
        return;
      }

      // Next, check localStorage for existing session
      const storedSession = getStoredSession();
      if (storedSession) {
        await validateStoredSession(storedSession);
        setIsValidating(false);
        return;
      }

      // No token and no stored session
      setIsAuthorized(false);
      setError('You need an invitation to access this show');
      setIsValidating(false);
    };

    checkAccess();
  }, [token, validateToken, getStoredSession, validateStoredSession]);

  return {
    isAuthorized,
    isValidating,
    invitation,
    guestProfile,
    viewerId,
    error,
    needsRegistration,
    pendingToken,
  };
}
