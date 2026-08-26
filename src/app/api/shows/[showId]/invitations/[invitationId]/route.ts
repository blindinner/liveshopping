import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// DELETE /api/shows/[showId]/invitations/[invitationId] - Remove an invitation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ showId: string; invitationId: string }> }
) {
  try {
    const { showId, invitationId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    // Delete the invitation
    const { error } = await serviceClient
      .from('invitations')
      .delete()
      .eq('id', invitationId)
      .eq('show_id', showId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to delete invitation' },
      { status: 500 }
    );
  }
}
