import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';

// Generate a secure invite token (43 chars, base64url)
function generateInviteToken(): string {
  return randomBytes(32).toString('base64url');
}

// GET /api/shows/[showId]/invitations - List all invitations for a show
export async function GET(
  request: Request,
  { params }: { params: Promise<{ showId: string }> }
) {
  try {
    const { showId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    const { data: invitations, error } = await serviceClient
      .from('invitations')
      .select(`
        *,
        guest_profile:guest_profiles(*)
      `)
      .eq('show_id', showId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Get invitations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}

// POST /api/shows/[showId]/invitations - Create new invitations
// Body: { emails: string[] }
export async function POST(
  request: Request,
  { params }: { params: Promise<{ showId: string }> }
) {
  try {
    const { showId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emails } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'emails array is required' },
        { status: 400 }
      );
    }

    // Normalize and deduplicate emails
    const normalizedEmails = [...new Set(
      emails
        .map((e: string) => e.trim().toLowerCase())
        .filter((e: string) => e && e.includes('@'))
    )];

    if (normalizedEmails.length === 0) {
      return NextResponse.json(
        { error: 'No valid emails provided' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Check for existing invitations to avoid duplicates
    const { data: existingInvitations } = await serviceClient
      .from('invitations')
      .select('email')
      .eq('show_id', showId)
      .in('email', normalizedEmails);

    const existingEmails = new Set(existingInvitations?.map(i => i.email) || []);
    const newEmails = normalizedEmails.filter(e => !existingEmails.has(e));

    if (newEmails.length === 0) {
      return NextResponse.json({
        invitations: [],
        skipped: normalizedEmails.length,
        message: 'All emails already invited'
      });
    }

    // Check if any emails have existing guest profiles
    const { data: existingProfiles } = await serviceClient
      .from('guest_profiles')
      .select('id, email')
      .in('email', newEmails);

    const profileMap = new Map(existingProfiles?.map(p => [p.email, p.id]) || []);

    // Create invitations
    const invitationsToCreate = newEmails.map(email => ({
      show_id: showId,
      email,
      invite_token: generateInviteToken(),
      status: 'pending',
      guest_profile_id: profileMap.get(email) || null,
    }));

    const { data: invitations, error } = await serviceClient
      .from('invitations')
      .insert(invitationsToCreate)
      .select(`
        *,
        guest_profile:guest_profiles(*)
      `);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      invitations,
      created: invitations?.length || 0,
      skipped: normalizedEmails.length - newEmails.length,
    });
  } catch (error) {
    console.error('Create invitations error:', error);
    return NextResponse.json(
      { error: 'Failed to create invitations' },
      { status: 500 }
    );
  }
}
