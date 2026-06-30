-- Add OAuth columns to brands table
ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS shopify_admin_token TEXT,
  ADD COLUMN IF NOT EXISTS shopify_scopes TEXT,
  ADD COLUMN IF NOT EXISTS shopify_app_installed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS shopify_app_uninstalled_at TIMESTAMPTZ;

COMMENT ON COLUMN brands.shopify_admin_token IS 'Shopify Admin API access token from OAuth';
COMMENT ON COLUMN brands.shopify_scopes IS 'OAuth scopes granted during installation';
COMMENT ON COLUMN brands.shopify_app_installed_at IS 'When the app was installed';
COMMENT ON COLUMN brands.shopify_app_uninstalled_at IS 'When the app was uninstalled (soft delete)';

-- OAuth state table for CSRF protection
CREATE TABLE IF NOT EXISTS shopify_oauth_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state TEXT NOT NULL UNIQUE,
  shop TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  redirect_url TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shopify_oauth_states_state ON shopify_oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_shopify_oauth_states_expires ON shopify_oauth_states(expires_at);

-- Enable RLS
ALTER TABLE shopify_oauth_states ENABLE ROW LEVEL SECURITY;

-- Only service role can access oauth states
CREATE POLICY "Service role full access to oauth states"
  ON shopify_oauth_states FOR ALL
  USING (auth.role() = 'service_role');
