-- Live Polls Tables
-- Enables real-time polling for live streams

-- ============================================
-- POLLS TABLE - Poll definitions
-- ============================================
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, active, ended
  show_results_live BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_polls_show ON polls(show_id);
CREATE INDEX idx_polls_status ON polls(show_id, status);

-- ============================================
-- POLL_OPTIONS TABLE - Answer options for polls
-- ============================================
CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_poll_options_poll ON poll_options(poll_id);

-- ============================================
-- POLL_VOTES TABLE - Individual votes
-- ============================================
CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  viewer_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- One vote per viewer per poll
  UNIQUE(poll_id, viewer_id)
);

CREATE INDEX idx_poll_votes_poll ON poll_votes(poll_id);
CREATE INDEX idx_poll_votes_option ON poll_votes(option_id);
CREATE INDEX idx_poll_votes_viewer ON poll_votes(poll_id, viewer_id);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_polls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER polls_updated_at
  BEFORE UPDATE ON polls
  FOR EACH ROW EXECUTE FUNCTION update_polls_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- POLLS: Public read, authenticated write
CREATE POLICY "Public read for polls"
  ON polls FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated can manage polls"
  ON polls FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access to polls"
  ON polls FOR ALL
  USING (auth.role() = 'service_role');

-- POLL_OPTIONS: Public read, authenticated write
CREATE POLICY "Public read for poll options"
  ON poll_options FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated can manage poll options"
  ON poll_options FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access to poll options"
  ON poll_options FOR ALL
  USING (auth.role() = 'service_role');

-- POLL_VOTES: Anyone can insert (viewers), authenticated can read all
CREATE POLICY "Anyone can insert poll votes"
  ON poll_votes FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Anyone can read poll votes"
  ON poll_votes FOR SELECT
  USING (TRUE);

CREATE POLICY "Service role full access to poll votes"
  ON poll_votes FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE polls;
ALTER PUBLICATION supabase_realtime ADD TABLE poll_options;
ALTER PUBLICATION supabase_realtime ADD TABLE poll_votes;
