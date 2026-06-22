import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local file
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
for (const line of envContent.split('\n')) {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim();
  }
}

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Running migration to rename mux columns to cloudflare...');

  // Check if columns already exist
  const { data: columns } = await supabase
    .from('shows')
    .select('*')
    .limit(1);

  if (columns && columns[0]) {
    const columnNames = Object.keys(columns[0]);
    console.log('Current columns:', columnNames);

    if (columnNames.includes('cloudflare_stream_id')) {
      console.log('Migration already applied - cloudflare columns exist');
      return;
    }
  }

  // Unfortunately, Supabase JS client can't run DDL statements directly
  // We need to use the SQL Editor in the dashboard
  console.log('\n===== RUN THIS SQL IN SUPABASE DASHBOARD =====\n');
  console.log(`
-- Rename Mux columns to Cloudflare
ALTER TABLE shows RENAME COLUMN mux_stream_id TO cloudflare_stream_id;
ALTER TABLE shows RENAME COLUMN mux_playback_id TO cloudflare_playback_id;
ALTER TABLE shows RENAME COLUMN mux_stream_key TO cloudflare_webrtc_url;

-- Add tracking columns
ALTER TABLE shows ADD COLUMN started_at TIMESTAMPTZ;
ALTER TABLE shows ADD COLUMN ended_at TIMESTAMPTZ;
  `);
  console.log('\n==============================================\n');
  console.log('Go to: https://supabase.com/dashboard/project/ddbdskngyrsokbgdnxyu/sql/new');
}

runMigration();
