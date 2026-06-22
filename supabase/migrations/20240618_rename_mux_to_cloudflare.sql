-- Rename Mux columns to Cloudflare
ALTER TABLE shows RENAME COLUMN mux_stream_id TO cloudflare_stream_id;
ALTER TABLE shows RENAME COLUMN mux_playback_id TO cloudflare_playback_id;
ALTER TABLE shows RENAME COLUMN mux_stream_key TO cloudflare_webrtc_url;

-- Add tracking columns
ALTER TABLE shows ADD COLUMN started_at TIMESTAMPTZ;
ALTER TABLE shows ADD COLUMN ended_at TIMESTAMPTZ;

-- Add comments for clarity
COMMENT ON COLUMN shows.cloudflare_stream_id IS 'Cloudflare Stream live input UID';
COMMENT ON COLUMN shows.cloudflare_playback_id IS 'Cloudflare Stream playback ID (same as UID for live inputs)';
COMMENT ON COLUMN shows.cloudflare_webrtc_url IS 'Cloudflare WHIP URL for browser streaming';
COMMENT ON COLUMN shows.started_at IS 'Timestamp when the show went live';
COMMENT ON COLUMN shows.ended_at IS 'Timestamp when the show ended';
