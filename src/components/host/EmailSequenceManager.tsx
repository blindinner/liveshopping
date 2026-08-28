'use client';

import { useState } from 'react';
import { useEmailSequences, SequenceWithStats } from '@/hooks/useEmailSequences';
import { Button } from '@/components/ui/Button';
import { EMAIL_OFFSET_PRESETS } from '@/types/database';

interface EmailSequenceManagerProps {
  showId: string;
  showScheduledAt: string;
}

// Format offset to human-readable string
function formatOffset(minutes: number): string {
  const absMinutes = Math.abs(minutes);
  const days = Math.floor(absMinutes / (24 * 60));
  const hours = Math.floor((absMinutes % (24 * 60)) / 60);
  const mins = absMinutes % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);

  const timeStr = parts.join(' ') || '0m';
  return minutes < 0 ? `${timeStr} before` : `${timeStr} after`;
}

// Calculate send time from offset
function getSendTime(scheduledAt: string, offsetMinutes: number): Date {
  const date = new Date(scheduledAt);
  date.setMinutes(date.getMinutes() + offsetMinutes);
  return date;
}

// Format date for display
function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function EmailSequenceManager({ showId, showScheduledAt }: EmailSequenceManagerProps) {
  const {
    sequences,
    isLoading,
    createSequence,
    updateSequence,
    deleteSequence,
    toggleEnabled,
  } = useEmailSequences(showId);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body_html: '',
    send_offset_minutes: -60,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      body_html: '',
      send_offset_minutes: -60,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (sequence: SequenceWithStats) => {
    setFormData({
      name: sequence.name,
      subject: sequence.subject,
      body_html: sequence.body_html,
      send_offset_minutes: sequence.send_offset_minutes,
    });
    setEditingId(sequence.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.subject || !formData.body_html) {
      setFeedback({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (editingId) {
        await updateSequence(editingId, formData);
        setFeedback({ type: 'success', message: 'Sequence updated!' });
      } else {
        await createSequence(formData);
        setFeedback({ type: 'success', message: 'Sequence created!' });
      }
      resetForm();
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save sequence' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (sequenceId: string) => {
    if (!confirm('Delete this email sequence? Pending emails will be cancelled.')) return;

    try {
      await deleteSequence(sequenceId);
      setFeedback({ type: 'success', message: 'Sequence deleted' });
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to delete sequence' });
    }
  };

  const handleToggle = async (sequence: SequenceWithStats) => {
    try {
      await toggleEnabled(sequence.id, !sequence.enabled);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to toggle sequence' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Add button */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)} variant="secondary" size="sm">
          + Add Email
        </Button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="text-sm font-medium text-white mb-3">
            {editingId ? 'Edit Email' : 'New Email'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-white/60 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 1 Day Reminder"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1">Send Time</label>
              <select
                value={formData.send_offset_minutes}
                onChange={(e) => setFormData({ ...formData, send_offset_minutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-pink-500 text-sm"
              >
                {EMAIL_OFFSET_PRESETS.map((preset) => (
                  <option key={preset.minutes} value={preset.minutes}>
                    {preset.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-white/40 mt-1">
                Will send: {formatDateTime(getSendTime(showScheduledAt, formData.send_offset_minutes))}
              </p>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1">Subject Line</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Reminder: {{show_title}} is tomorrow!"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500 text-sm"
              />
              <p className="text-xs text-white/40 mt-1">
                Variables: {'{{recipient_name}}, {{show_title}}, {{show_date}}'}
              </p>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1">Email Body (HTML)</label>
              <textarea
                value={formData.body_html}
                onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
                placeholder="Enter HTML email content..."
                rows={6}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-pink-500 text-sm font-mono resize-none"
              />
              <p className="text-xs text-white/40 mt-1">
                Variables: {'{{recipient_name}}, {{show_title}}, {{show_date}}, {{join_url}}, {{calendar_url}}'}
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" isLoading={isSubmitting}>
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className={`text-sm px-3 py-2 rounded-lg ${feedback.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {feedback.message}
        </div>
      )}

      {/* Sequences list */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto" />
          </div>
        ) : sequences.length === 0 ? (
          <div className="text-center py-6 text-white/50 bg-white/5 rounded-xl border border-white/10">
            <svg className="w-8 h-8 mx-auto mb-2 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">No email sequences yet</p>
            <p className="text-xs mt-1">Add emails to remind invitees before the show</p>
          </div>
        ) : (
          sequences.map((sequence) => {
            const sendTime = getSendTime(showScheduledAt, sequence.send_offset_minutes);
            const isPast = sendTime < new Date();

            return (
              <div
                key={sequence.id}
                className={`p-3 bg-white/5 rounded-lg border border-white/10 ${!sequence.enabled ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-white truncate">{sequence.name}</h4>
                      {!sequence.enabled && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-white/60">Disabled</span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 truncate mt-0.5">{sequence.subject}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                      <span>{formatOffset(sequence.send_offset_minutes)}</span>
                      <span>|</span>
                      <span className={isPast ? 'text-yellow-400' : ''}>
                        {isPast ? 'Was: ' : ''}{formatDateTime(sendTime)}
                      </span>
                    </div>
                    {/* Stats */}
                    {(sequence.stats.sent > 0 || sequence.stats.pending > 0) && (
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        {sequence.stats.sent > 0 && (
                          <span className="text-green-400">{sequence.stats.sent} sent</span>
                        )}
                        {sequence.stats.pending > 0 && (
                          <span className="text-blue-400">{sequence.stats.pending} pending</span>
                        )}
                        {sequence.stats.failed > 0 && (
                          <span className="text-red-400">{sequence.stats.failed} failed</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(sequence)}
                      className={`p-1.5 rounded-lg transition-colors ${sequence.enabled ? 'hover:bg-yellow-500/20' : 'hover:bg-green-500/20'}`}
                      title={sequence.enabled ? 'Disable' : 'Enable'}
                    >
                      {sequence.enabled ? (
                        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => handleEdit(sequence)}
                      className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(sequence.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
