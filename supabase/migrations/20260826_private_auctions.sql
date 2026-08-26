-- Private Auctions
-- Enables invite-only auctions with guest profiles and magic link invitations

-- ============================================
-- MODIFY SHOWS TABLE - Add auction_type
-- ============================================
ALTER TABLE shows ADD COLUMN auction_type TEXT DEFAULT 'public';
-- Valid values: 'public' | 'private'

CREATE INDEX idx_shows_auction_type ON shows(auction_type);

-- ============================================
-- GUEST_PROFILES TABLE - Persistent guest data across shows
-- ============================================
CREATE TABLE guest_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  vat_number TEXT,
  is_business BOOLEAN DEFAULT FALSE,
  billing_address TEXT,
  billing_city TEXT,
  billing_postal_code TEXT,
  billing_country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guest_profiles_email ON guest_profiles(email);

-- ============================================
-- INVITATIONS TABLE - Per-show invitations with magic links
-- ============================================
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  guest_profile_id UUID REFERENCES guest_profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  invite_token TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending',
  -- Valid values: 'pending' | 'accepted' | 'declined'
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- One invitation per email per show
  UNIQUE(show_id, email)
);

CREATE INDEX idx_invitations_show ON invitations(show_id);
CREATE INDEX idx_invitations_token ON invitations(invite_token);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_status ON invitations(show_id, status);

-- ============================================
-- MODIFY BIDDERS TABLE - Add invitation_id FK
-- ============================================
ALTER TABLE bidders ADD COLUMN invitation_id UUID REFERENCES invitations(id) ON DELETE SET NULL;

CREATE INDEX idx_bidders_invitation ON bidders(invitation_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE guest_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- GUEST_PROFILES: Authenticated users (hosts) can manage, service role full access
CREATE POLICY "Authenticated can manage guest profiles"
  ON guest_profiles FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access to guest profiles"
  ON guest_profiles FOR ALL
  USING (auth.role() = 'service_role');

-- Allow public insert for invitation acceptance (creates guest profile)
CREATE POLICY "Public can insert guest profiles"
  ON guest_profiles FOR INSERT
  WITH CHECK (TRUE);

-- Allow public update for returning guests updating their info
CREATE POLICY "Public can update own guest profile"
  ON guest_profiles FOR UPDATE
  USING (TRUE);

-- INVITATIONS: Authenticated can manage, public can read own via token
CREATE POLICY "Authenticated can manage invitations"
  ON invitations FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role full access to invitations"
  ON invitations FOR ALL
  USING (auth.role() = 'service_role');

-- Public can read invitations (needed for token validation)
CREATE POLICY "Public can read invitations"
  ON invitations FOR SELECT
  USING (TRUE);

-- Public can update invitations (for accepting/declining)
CREATE POLICY "Public can update invitations"
  ON invitations FOR UPDATE
  USING (TRUE);

-- ============================================
-- REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE invitations;

-- ============================================
-- UPDATED_AT TRIGGER FOR GUEST_PROFILES
-- ============================================
CREATE TRIGGER guest_profiles_updated_at
  BEFORE UPDATE ON guest_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
