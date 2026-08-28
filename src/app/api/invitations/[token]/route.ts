import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createServiceClient } from '@/lib/supabase/server';
import { sendConfirmationEmail } from '@/lib/email/send';

// GET /api/invitations/[token] - Validate token and get invitation details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const serviceClient = createServiceClient();

    // Fetch invitation with show, brand info, and guest profile
    const { data: invitation, error } = await serviceClient
      .from('invitations')
      .select(`
        *,
        show:shows(*, brand:brands(shopify_domain, website_url)),
        guest_profile:guest_profiles(*)
      `)
      .eq('invite_token', token)
      .single();

    if (error || !invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Check if invitation is already accepted or declined
    if (invitation.status === 'declined') {
      return NextResponse.json(
        { error: 'This invitation has been declined' },
        { status: 410 }
      );
    }

    // If already accepted, check if there's an existing guest profile to pre-fill
    // (returning guests might have updated info)
    let existingProfile = invitation.guest_profile;

    // If no linked profile yet, check by email for returning guests
    if (!existingProfile && invitation.email) {
      const { data: profileByEmail } = await serviceClient
        .from('guest_profiles')
        .select('*')
        .eq('email', invitation.email)
        .single();

      if (profileByEmail) {
        existingProfile = profileByEmail;
      }
    }

    // Extract brand info and add to show for easy access
    const showData = invitation.show as Record<string, unknown>;
    const brand = showData?.brand as { shopify_domain?: string; website_url?: string } | null;
    const showWithBrand = {
      ...showData,
      brand: undefined,
      _brandDomain: brand?.shopify_domain || null,
      _brandWebsiteUrl: brand?.website_url || null,
    };

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        status: invitation.status,
        show_id: invitation.show_id,
      },
      show: showWithBrand,
      guest_profile: existingProfile,
    });
  } catch (error) {
    console.error('Get invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate invitation' },
      { status: 500 }
    );
  }
}

// POST /api/invitations/[token] - Accept invitation
// Body: { name, phone?, company_name?, vat_number?, is_business?, billing_address?, billing_city?, billing_postal_code?, billing_country? }
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const {
      name,
      phone,
      company_name,
      vat_number,
      is_business,
      billing_address,
      billing_city,
      billing_postal_code,
      billing_country,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Fetch invitation
    const { data: invitation, error: invitationError } = await serviceClient
      .from('invitations')
      .select('*')
      .eq('invite_token', token)
      .single();

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    if (invitation.status === 'declined') {
      return NextResponse.json(
        { error: 'This invitation has been declined' },
        { status: 410 }
      );
    }

    // Upsert guest profile (create or update)
    const { data: guestProfile, error: profileError } = await serviceClient
      .from('guest_profiles')
      .upsert(
        {
          email: invitation.email,
          name,
          phone: phone || null,
          company_name: company_name || null,
          vat_number: vat_number || null,
          is_business: is_business || false,
          billing_address: billing_address || null,
          billing_city: billing_city || null,
          billing_postal_code: billing_postal_code || null,
          billing_country: billing_country || null,
        },
        { onConflict: 'email' }
      )
      .select()
      .single();

    if (profileError) {
      console.error('Upsert guest profile error:', profileError);
      throw profileError;
    }

    // Update invitation status
    const { error: updateError } = await serviceClient
      .from('invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        guest_profile_id: guestProfile.id,
      })
      .eq('id', invitation.id);

    if (updateError) {
      throw updateError;
    }

    // Generate a viewer_id for the bidder
    const viewerId = `invited-${invitation.id}`;

    // Create bidder record (pre-register for the show)
    const { data: bidder, error: bidderError } = await serviceClient
      .from('bidders')
      .upsert(
        {
          show_id: invitation.show_id,
          viewer_id: viewerId,
          name,
          email: invitation.email,
          phone: phone || null,
          approved: true,
          invitation_id: invitation.id,
        },
        { onConflict: 'show_id,viewer_id' }
      )
      .select()
      .single();

    if (bidderError) {
      console.error('Create bidder error:', bidderError);
      throw bidderError;
    }

    // Fetch show details for confirmation email
    const { data: show } = await serviceClient
      .from('shows')
      .select('title, scheduled_at, embed_url, brand:brands(shopify_domain, website_url)')
      .eq('id', invitation.show_id)
      .single();

    // Send confirmation email (don't block on failure)
    if (show) {
      const headersList = await headers();
      const host = headersList.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const baseUrl = `${protocol}://${host}`;

      // Determine embed URL priority: show.embed_url > brand.website_url > brand.shopify_domain > none
      const brand = show.brand as { shopify_domain?: string; website_url?: string } | null;
      const effectiveEmbedUrl = show.embed_url
        || brand?.website_url
        || (brand?.shopify_domain ? `https://${brand.shopify_domain}` : undefined);

      sendConfirmationEmail({
        to: invitation.email,
        recipientName: name,
        showTitle: show.title,
        showDate: new Date(show.scheduled_at),
        showId: invitation.show_id,
        inviteToken: token,
        baseUrl,
        embedUrl: effectiveEmbedUrl,
      }).catch((err) => {
        console.error('Failed to send confirmation email:', err);
      });
    }

    return NextResponse.json({
      success: true,
      invitation: {
        ...invitation,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      },
      bidder,
      viewer_id: viewerId,
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}

// DELETE /api/invitations/[token] - Decline invitation
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const serviceClient = createServiceClient();

    // Fetch invitation
    const { data: invitation, error: invitationError } = await serviceClient
      .from('invitations')
      .select('*')
      .eq('invite_token', token)
      .single();

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Update invitation status
    const { error: updateError } = await serviceClient
      .from('invitations')
      .update({
        status: 'declined',
        declined_at: new Date().toISOString(),
      })
      .eq('id', invitation.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation declined',
    });
  } catch (error) {
    console.error('Decline invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to decline invitation' },
      { status: 500 }
    );
  }
}
