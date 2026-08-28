-- Add embed_url to shows for white-label widget support
-- When set, invitation links will redirect to this URL instead of shoppablevids.com

ALTER TABLE shows ADD COLUMN embed_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN shows.embed_url IS 'Optional URL where the show is embedded (e.g., https://mybrand.com/live-auction). When set, invitation links redirect here.';
