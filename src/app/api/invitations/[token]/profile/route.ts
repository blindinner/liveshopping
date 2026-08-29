import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// GET /api/invitations/[token]/profile - Get guest profile by invitation ID
// Note: [token] here is actually the invitation UUID, not the invite_token
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token: invitationId } = await params;
    const serviceClient = createServiceClient();

    // Get the invitation with its guest profile
    const { data: invitation, error } = await serviceClient
      .from('invitations')
      .select(`
        id,
        guest_profile_id,
        guest_profile:guest_profiles(*)
      `)
      .eq('id', invitationId)
      .single();

    if (error || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      guest_profile: invitation.guest_profile || null,
    });
  } catch (error) {
    console.error('Get guest profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guest profile' },
      { status: 500 }
    );
  }
}
