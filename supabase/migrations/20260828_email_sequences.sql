-- Email Sequences for Private Auctions
-- Enables customizable email reminders sent before shows

-- ============================================
-- SHOW_EMAIL_SEQUENCES TABLE - Per-show email definitions
-- ============================================
CREATE TABLE show_email_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                    -- e.g., "7 Day Reminder"
  subject TEXT NOT NULL,                 -- Supports {{variables}}
  body_html TEXT NOT NULL,
  body_text TEXT,
  send_offset_minutes INTEGER NOT NULL,  -- Negative = before show
  enabled BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_show_email_sequences_show ON show_email_sequences(show_id);
CREATE INDEX idx_show_email_sequences_enabled ON show_email_sequences(show_id, enabled) WHERE enabled = TRUE;

-- ============================================
-- SCHEDULED_EMAILS TABLE - Queue of emails to send
-- ============================================
CREATE TABLE scheduled_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  sequence_id UUID NOT NULL REFERENCES show_email_sequences(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending | sent | failed | cancelled
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- One email per invitation per sequence
  UNIQUE(invitation_id, sequence_id)
);

CREATE INDEX idx_scheduled_emails_pending ON scheduled_emails(scheduled_for, status)
  WHERE status = 'pending';
CREATE INDEX idx_scheduled_emails_show ON scheduled_emails(show_id);
CREATE INDEX idx_scheduled_emails_invitation ON scheduled_emails(invitation_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update timestamp trigger for show_email_sequences
CREATE TRIGGER update_show_email_sequences_updated_at
  BEFORE UPDATE ON show_email_sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE show_email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (adjust based on auth requirements)
CREATE POLICY "Allow all operations on show_email_sequences"
  ON show_email_sequences FOR ALL USING (true);

CREATE POLICY "Allow all operations on scheduled_emails"
  ON scheduled_emails FOR ALL USING (true);

-- ============================================
-- ENABLE REALTIME
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE show_email_sequences;
