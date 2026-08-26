'use client';

import { useState } from 'react';
import { useInvitations } from '@/hooks/useInvitations';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface InvitationManagerProps {
  showId: string;
}

export function InvitationManager({ showId }: InvitationManagerProps) {
  const {
    invitations,
    isLoading,
    addInvitations,
    removeInvitation,
    copyInviteLink,
  } = useInvitations(showId);

  const [emailInput, setEmailInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAddInvitations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsAdding(true);
    setFeedback(null);

    try {
      // Split by comma, newline, or semicolon
      const emails = emailInput
        .split(/[,;\n]+/)
        .map(e => e.trim())
        .filter(e => e);

      const result = await addInvitations(emails);

      if (result.created > 0) {
        setFeedback({
          type: 'success',
          message: `Added ${result.created} invitation${result.created > 1 ? 's' : ''}${result.skipped > 0 ? ` (${result.skipped} already invited)` : ''}`,
        });
        setEmailInput('');
      } else if (result.skipped > 0) {
        setFeedback({
          type: 'error',
          message: 'All emails are already invited',
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Failed to add invitations',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleCopyLink = async (invitation: (typeof invitations)[0]) => {
    try {
      await copyInviteLink(invitation);
      setCopiedId(invitation.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Clipboard API failed
    }
  };

  const handleRemove = async (invitationId: string) => {
    try {
      await removeInvitation(invitationId);
    } catch {
      // Error handled by hook
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="live">Accepted</Badge>;
      case 'declined':
        return <Badge variant="ended">Declined</Badge>;
      default:
        return <Badge variant="scheduled">Pending</Badge>;
    }
  };

  const stats = {
    total: invitations.length,
    accepted: invitations.filter(i => i.status === 'accepted').length,
    pending: invitations.filter(i => i.status === 'pending').length,
    declined: invitations.filter(i => i.status === 'declined').length,
  };

  return (
    <div className="space-y-6">
      {/* Add invitations form */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <h3 className="text-sm font-medium text-white mb-3">Invite People</h3>
        <form onSubmit={handleAddInvitations} className="space-y-3">
          <textarea
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Enter email addresses (one per line, or comma-separated)"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500 resize-none"
            rows={3}
          />
          <div className="flex items-center justify-between">
            <Button type="submit" isLoading={isAdding} disabled={!emailInput.trim()}>
              Add Invitations
            </Button>
            {feedback && (
              <span className={`text-sm ${feedback.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {feedback.message}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Stats */}
      {invitations.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-white/50">Total</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.accepted}</div>
            <div className="text-xs text-white/50">Accepted</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-xs text-white/50">Pending</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.declined}</div>
            <div className="text-xs text-white/50">Declined</div>
          </div>
        </div>
      )}

      {/* Invitations list */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-white/80">Invitations</h3>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-8 text-white/50 bg-white/5 rounded-xl border border-white/10">
            <svg className="w-8 h-8 mx-auto mb-2 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p>No invitations yet</p>
            <p className="text-sm mt-1">Add email addresses above to invite people</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-white/70">
                      {invitation.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white truncate">{invitation.email}</p>
                    {invitation.guest_profile?.name && (
                      <p className="text-xs text-white/50">{invitation.guest_profile.name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(invitation.status)}

                  {invitation.status === 'pending' && (
                    <button
                      onClick={() => handleCopyLink(invitation)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      title="Copy invite link"
                    >
                      {copiedId === invitation.id ? (
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleRemove(invitation.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                    title="Remove invitation"
                  >
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
