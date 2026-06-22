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

async function endShow(showId: string) {
  const { data, error } = await supabase
    .from('shows')
    .update({ status: 'ended' })
    .eq('id', showId)
    .select()
    .single();

  if (error) {
    console.error('Failed to end show:', error);
    process.exit(1);
  }

  console.log('Show ended successfully:', data);
}

const showId = process.argv[2];
if (!showId) {
  console.error('Usage: npx tsx scripts/end-show.ts <showId>');
  process.exit(1);
}

endShow(showId);
