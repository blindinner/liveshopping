import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export interface AttendeeStats {
  id: string;
  viewer_id: string;
  name: string;
  email: string;
  phone: string | null;
  joined_at: string;
  bid_count: number;
  chat_count: number;
  total_bid_amount: number;
  highest_bid: number;
  won_count: number;
  won_total: number;
  invitation_id: string | null;
  guest_profile?: {
    company_name: string | null;
    is_business: boolean;
  } | null;
}

// GET /api/shows/[showId]/attendees - Get all attendees with engagement stats
export async function GET(
  request: Request,
  { params }: { params: Promise<{ showId: string }> }
) {
  try {
    const { showId } = await params;

    // Require auth (host only)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    // Get all bidders for this show
    const { data: bidders, error: biddersError } = await serviceClient
      .from('bidders')
      .select(`
        id,
        viewer_id,
        name,
        email,
        phone,
        created_at,
        invitation_id
      `)
      .eq('show_id', showId)
      .order('created_at', { ascending: true });

    if (biddersError) throw biddersError;

    if (!bidders || bidders.length === 0) {
      return NextResponse.json({ attendees: [], summary: getEmptySummary() });
    }

    // Get all bids for this show's products
    const { data: showProducts } = await serviceClient
      .from('show_products')
      .select('id')
      .eq('show_id', showId);

    const showProductIds = showProducts?.map(sp => sp.id) || [];

    // Get bid stats per bidder
    const { data: bids } = await serviceClient
      .from('bids')
      .select('bidder_id, amount')
      .in('show_product_id', showProductIds);

    // Get chat message counts per viewer
    const { data: chatMessages } = await serviceClient
      .from('chat_messages')
      .select('viewer_name, id')
      .eq('show_id', showId)
      .eq('hidden', false);

    // Get auction winners
    const { data: winners } = await serviceClient
      .from('auction_winners')
      .select('bidder_id, winning_amount')
      .in('show_product_id', showProductIds);

    // Get guest profiles for private show attendees
    const invitationIds = bidders
      .filter(b => b.invitation_id)
      .map(b => b.invitation_id);

    let guestProfiles: Record<string, { company_name: string | null; is_business: boolean }> = {};

    if (invitationIds.length > 0) {
      const { data: invitations } = await serviceClient
        .from('invitations')
        .select(`
          id,
          guest_profile:guest_profiles(company_name, is_business)
        `)
        .in('id', invitationIds);

      if (invitations) {
        invitations.forEach((inv: any) => {
          if (inv.guest_profile) {
            guestProfiles[inv.id] = inv.guest_profile;
          }
        });
      }
    }

    // Aggregate stats per bidder
    const bidStats: Record<string, { count: number; total: number; highest: number }> = {};
    bids?.forEach(bid => {
      if (!bidStats[bid.bidder_id]) {
        bidStats[bid.bidder_id] = { count: 0, total: 0, highest: 0 };
      }
      bidStats[bid.bidder_id].count++;
      bidStats[bid.bidder_id].total += bid.amount;
      bidStats[bid.bidder_id].highest = Math.max(bidStats[bid.bidder_id].highest, bid.amount);
    });

    // Aggregate chat counts by name (since chat uses viewer_name, not bidder_id)
    const chatCounts: Record<string, number> = {};
    chatMessages?.forEach(msg => {
      chatCounts[msg.viewer_name] = (chatCounts[msg.viewer_name] || 0) + 1;
    });

    // Aggregate winner stats
    const winnerStats: Record<string, { count: number; total: number }> = {};
    winners?.forEach(win => {
      if (!winnerStats[win.bidder_id]) {
        winnerStats[win.bidder_id] = { count: 0, total: 0 };
      }
      winnerStats[win.bidder_id].count++;
      winnerStats[win.bidder_id].total += win.winning_amount;
    });

    // Build attendee list with stats
    const attendees: AttendeeStats[] = bidders.map(bidder => ({
      id: bidder.id,
      viewer_id: bidder.viewer_id,
      name: bidder.name,
      email: bidder.email,
      phone: bidder.phone,
      joined_at: bidder.created_at,
      bid_count: bidStats[bidder.id]?.count || 0,
      chat_count: chatCounts[bidder.name] || 0,
      total_bid_amount: bidStats[bidder.id]?.total || 0,
      highest_bid: bidStats[bidder.id]?.highest || 0,
      won_count: winnerStats[bidder.id]?.count || 0,
      won_total: winnerStats[bidder.id]?.total || 0,
      invitation_id: bidder.invitation_id,
      guest_profile: bidder.invitation_id ? guestProfiles[bidder.invitation_id] : null,
    }));

    // Sort by engagement (bids + chats + wins)
    attendees.sort((a, b) => {
      const scoreA = a.bid_count + a.chat_count + (a.won_count * 10);
      const scoreB = b.bid_count + b.chat_count + (b.won_count * 10);
      return scoreB - scoreA;
    });

    // Calculate summary
    const summary = {
      total_attendees: attendees.length,
      total_bids: bids?.length || 0,
      total_chat_messages: chatMessages?.length || 0,
      total_winners: new Set(winners?.map(w => w.bidder_id) || []).size,
      active_bidders: attendees.filter(a => a.bid_count > 0).length,
      active_chatters: attendees.filter(a => a.chat_count > 0).length,
    };

    return NextResponse.json({ attendees, summary });
  } catch (error) {
    console.error('Get attendees error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendees' },
      { status: 500 }
    );
  }
}

function getEmptySummary() {
  return {
    total_attendees: 0,
    total_bids: 0,
    total_chat_messages: 0,
    total_winners: 0,
    active_bidders: 0,
    active_chatters: 0,
  };
}
