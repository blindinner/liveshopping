'use client';

import { useState, useRef } from 'react';
import { useInvitations } from '@/hooks/useInvitations';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface InvitationManagerProps {
  showId: string;
  showTitle?: string;
  showScheduledAt?: string;
  invitationEmailSubject?: string | null;
  invitationEmailBody?: string | null;
  onEmailSettingsChange?: (subject: string, body: string) => void;
  onNext?: () => void;
}

// Template variables available for email customization
const EMAIL_TEMPLATE_VARIABLES = [
  { key: 'show_title', label: 'Show Title', preview: (props: InvitationManagerProps) => props.showTitle || 'Your Show' },
  { key: 'show_date', label: 'Show Date', preview: () => 'formatted date' },
];

const DEFAULT_EMAIL_SUBJECT = "You're Invited to {{show_title}}";
const DEFAULT_EMAIL_BODY = `You've been invited to an exclusive private auction!

Join us for {{show_title}} on {{show_date}}.

Click the button below to accept your invitation and secure your spot. You'll need to provide your billing information so we can send you an invoice if you win any auctions.

We look forward to seeing you there!`;

export function InvitationManager({
  showId,
  showTitle,
  showScheduledAt,
  invitationEmailSubject,
  invitationEmailBody,
  onEmailSettingsChange,
  onNext,
}: InvitationManagerProps) {
  const {
    invitations,
    isLoading,
    addInvitations,
    removeInvitation,
    resendInvitation,
    sendAllEmails,
    copyInviteLink,
  } = useInvitations(showId);

  const [emailInput, setEmailInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSendingAll, setIsSendingAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [showEmailEditor, setShowEmailEditor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const bodyInputRef = useRef<HTMLTextAreaElement>(null);

  // Email customization state
  const [emailSubject, setEmailSubject] = useState(invitationEmailSubject || DEFAULT_EMAIL_SUBJECT);
  const [emailBody, setEmailBody] = useState(invitationEmailBody || DEFAULT_EMAIL_BODY);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [focusedField, setFocusedField] = useState<'subject' | 'body' | null>(null);

  // Format show date for email preview
  const formattedShowDate = showScheduledAt
    ? new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(showScheduledAt))
    : 'Date TBD';

  // Replace template variables with actual values for preview
  const replaceTemplateVariables = (text: string): string => {
    return text
      .replace(/\{\{show_title\}\}/g, showTitle || 'Your Show')
      .replace(/\{\{show_date\}\}/g, formattedShowDate);
  };

  // Insert template variable at cursor position
  const insertVariable = (variable: string) => {
    const varText = `{{${variable}}}`;

    if (focusedField === 'subject' && subjectInputRef.current) {
      const input = subjectInputRef.current;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue = emailSubject.slice(0, start) + varText + emailSubject.slice(end);
      setEmailSubject(newValue);
      // Restore cursor position after React re-render
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + varText.length, start + varText.length);
      }, 0);
    } else if (focusedField === 'body' && bodyInputRef.current) {
      const textarea = bodyInputRef.current;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const newValue = emailBody.slice(0, start) + varText + emailBody.slice(end);
      setEmailBody(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + varText.length, start + varText.length);
      }, 0);
    }
  };

  // Save email settings
  const handleSaveEmailSettings = async () => {
    if (!onEmailSettingsChange) return;

    setIsSavingEmail(true);
    try {
      await onEmailSettingsChange(emailSubject, emailBody);
      setEmailSaved(true);
      setTimeout(() => setEmailSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save email settings:', error);
      setFeedback({
        type: 'error',
        message: 'Failed to save email. Please try again.',
      });
      setTimeout(() => setFeedback(null), 5000);
    } finally {
      setIsSavingEmail(false);
    }
  };

  // Check if email has been customized
  const hasEmailChanges = emailSubject !== (invitationEmailSubject || DEFAULT_EMAIL_SUBJECT) ||
    emailBody !== (invitationEmailBody || DEFAULT_EMAIL_BODY);

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

  const handleResend = async (invitationId: string) => {
    setResendingId(invitationId);
    try {
      await resendInvitation(invitationId);
      setFeedback({ type: 'success', message: 'Email sent!' });
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to send email' });
    } finally {
      setResendingId(null);
    }
  };

  const handleSendAllEmails = async () => {
    const pendingCount = invitations.filter(i => i.status === 'pending').length;
    if (pendingCount === 0) {
      setFeedback({ type: 'error', message: 'No pending invitations to send' });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    setIsSendingAll(true);
    setFeedback(null);
    try {
      const result = await sendAllEmails();
      setFeedback({
        type: result.failed === 0 ? 'success' : 'error',
        message: `Sent ${result.sent} email${result.sent !== 1 ? 's' : ''}${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to send emails' });
    } finally {
      setIsSendingAll(false);
    }
  };

  const downloadCsvTemplate = () => {
    const csvContent = 'email\nexample@email.com\nanother@email.com';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guest_emails_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAdding(true);
    setFeedback(null);

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/);

      // Skip header row if it contains 'email'
      const startIndex = lines[0]?.toLowerCase().includes('email') ? 1 : 0;

      const emails = lines
        .slice(startIndex)
        .map(line => line.trim().replace(/^["']|["']$/g, '')) // Remove quotes
        .filter(email => email && email.includes('@'));

      if (emails.length === 0) {
        setFeedback({ type: 'error', message: 'No valid emails found in CSV' });
        return;
      }

      const result = await addInvitations(emails);

      if (result.created > 0) {
        setFeedback({
          type: 'success',
          message: `Added ${result.created} invitation${result.created > 1 ? 's' : ''} from CSV${result.skipped > 0 ? ` (${result.skipped} already invited)` : ''}`,
        });
      } else if (result.skipped > 0) {
        setFeedback({ type: 'error', message: 'All emails from CSV are already invited' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to process CSV file' });
    } finally {
      setIsAdding(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'declined':
        return <Badge variant="danger">Declined</Badge>;
      case 'sent':
        return <Badge variant="default">Sent</Badge>;
      default:
        return <Badge variant="scheduled">Pending</Badge>;
    }
  };

  const stats = {
    total: invitations.length,
    accepted: invitations.filter(i => i.status === 'accepted').length,
    sent: invitations.filter(i => i.status === 'sent').length,
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
          <div className="flex items-center justify-between flex-wrap gap-2">
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

        {/* CSV Import/Export */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-white/50 mb-3">Or import from CSV</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadCsvTemplate}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Template
            </button>
            <label className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload CSV
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleCsvUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Stats */}
      {invitations.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-white/50">Total</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-xs text-white/50">Pending</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.sent}</div>
            <div className="text-xs text-white/50">Sent</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.accepted}</div>
            <div className="text-xs text-white/50">Accepted</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.declined}</div>
            <div className="text-xs text-white/50">Declined</div>
          </div>
        </div>
      )}

      {/* Email Customization */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <button
          onClick={() => setShowEmailEditor(!showEmailEditor)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-sm font-medium text-white">Customize Invitation Email</h3>
              <p className="text-xs text-white/50">Edit the subject and message your guests receive</p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-white/50 transition-transform ${showEmailEditor ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showEmailEditor && (
          <div className="border-t border-white/10 p-4 space-y-4">
            {/* Template Variables */}
            <div>
              <p className="text-xs text-white/50 mb-2">Click to insert template variables:</p>
              <div className="flex flex-wrap gap-2">
                {EMAIL_TEMPLATE_VARIABLES.map((variable) => (
                  <button
                    key={variable.key}
                    type="button"
                    onClick={() => insertVariable(variable.key)}
                    disabled={!focusedField}
                    className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                      focusedField
                        ? 'bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30 cursor-pointer'
                        : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    {`{{${variable.key}}}`}
                  </button>
                ))}
              </div>
              {!focusedField && (
                <p className="text-xs text-white/30 mt-1">Click on a field below to enable variable insertion</p>
              )}
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Subject Line</label>
              <input
                ref={subjectInputRef}
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                onFocus={() => setFocusedField('subject')}
                onBlur={() => setTimeout(() => setFocusedField(null), 200)}
                placeholder="Email subject..."
                className={`w-full bg-black/30 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border transition-colors ${
                  focusedField === 'subject' ? 'border-purple-500/50' : 'border-white/10'
                } placeholder:text-white/30`}
              />
            </div>

            {/* Email Body */}
            <div>
              <label className="block text-white/70 text-sm mb-2">Message</label>
              <textarea
                ref={bodyInputRef}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                onFocus={() => setFocusedField('body')}
                onBlur={() => setTimeout(() => setFocusedField(null), 200)}
                placeholder="Your message to guests..."
                rows={6}
                className={`w-full bg-black/30 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border transition-colors resize-none ${
                  focusedField === 'body' ? 'border-purple-500/50' : 'border-white/10'
                } placeholder:text-white/30`}
              />
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setEmailSubject(DEFAULT_EMAIL_SUBJECT);
                  setEmailBody(DEFAULT_EMAIL_BODY);
                }}
                className="text-sm text-white/50 hover:text-white transition-colors"
              >
                Reset to Default
              </button>
              <button
                onClick={handleSaveEmailSettings}
                disabled={isSavingEmail || !hasEmailChanges}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {isSavingEmail ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : emailSaved ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved
                  </>
                ) : (
                  'Save Email'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Email Preview */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <button
          onClick={() => setShowEmailPreview(!showEmailPreview)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-sm font-medium text-white">Preview Invitation Email</h3>
              <p className="text-xs text-white/50">See what your guests will receive</p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-white/50 transition-transform ${showEmailPreview ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showEmailPreview && (
          <div className="border-t border-white/10 p-4">
            {/* Email mockup */}
            <div className="bg-[#111111] rounded-lg overflow-hidden shadow-xl">
              {/* Email header bar */}
              <div className="bg-[#2a2a2a] px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-white/50">Email Preview</span>
                </div>
              </div>

              {/* Email content */}
              <div className="p-6">
                <div className="max-w-md mx-auto bg-[#1a1a1a] rounded-2xl overflow-hidden">
                  {/* Subject line preview */}
                  <div className="px-6 py-3 bg-[#0a0a0a] border-b border-[#333333]">
                    <p className="text-xs text-white/40 mb-1">Subject:</p>
                    <p className="text-sm text-white font-medium">{replaceTemplateVariables(emailSubject)}</p>
                  </div>

                  {/* Header */}
                  <div className="p-8 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                      <span className="text-2xl">✉️</span>
                    </div>
                    <h2 className="text-xl font-semibold text-white">You're Invited!</h2>
                  </div>

                  {/* Custom Message */}
                  <div className="px-8 pb-4">
                    <div className="text-white/70 text-sm whitespace-pre-wrap leading-relaxed">
                      {replaceTemplateVariables(emailBody)}
                    </div>
                  </div>

                  {/* Show details */}
                  <div className="px-8 py-4">
                    <div className="bg-[#262626] rounded-xl p-5">
                      <h3 className="text-white font-semibold">{showTitle || 'Your Show Title'}</h3>
                      <p className="text-white/50 text-sm mt-1 flex items-center gap-1">
                        <span>📅</span> {formattedShowDate}
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="px-8 py-4">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-center py-4 rounded-xl font-semibold">
                      Accept Invitation
                    </div>
                  </div>

                  {/* Add to Calendar */}
                  <div className="px-8 pb-6">
                    <div className="bg-[#262626] border border-[#333333] text-white text-center py-3 rounded-xl text-sm">
                      📅 Add to Calendar
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-8 py-4 border-t border-[#333333]">
                    <p className="text-white/30 text-xs text-center">
                      If you didn't expect this invitation, you can safely ignore this email.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-white/40 mt-3 text-center">
              This is a preview of the invitation email. The actual email will include personalized links.
            </p>
          </div>
        )}
      </div>

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

                  {(invitation.status === 'pending' || invitation.status === 'sent') && (
                    <>
                      {/* Send/Resend email button */}
                      <button
                        onClick={() => handleResend(invitation.id)}
                        disabled={resendingId === invitation.id}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                        title={invitation.status === 'sent' ? 'Resend email' : 'Send email'}
                      >
                        {resendingId === invitation.id ? (
                          <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                      {/* Copy link button */}
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
                    </>
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

      {/* Send All Emails - at the end */}
      {stats.pending > 0 && (
        <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Ready to Send?</h3>
              <p className="text-sm text-white/60 mt-1">
                Send invitation emails to all {stats.pending} pending guest{stats.pending > 1 ? 's' : ''}
              </p>
            </div>
            <Button
              onClick={handleSendAllEmails}
              isLoading={isSendingAll}
              disabled={isSendingAll}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send All Emails
            </Button>
          </div>
        </div>
      )}

      {/* Next Button */}
      {onNext && (
        <div className="pt-4">
          <button
            onClick={onNext}
            className="w-full px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            Next: Emails
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
