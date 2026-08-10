import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch all data in parallel
    const [
      showsResult,
      videosResult,
      engagementResult,
      cartEventsResult,
      videoEventsResult,
      cartSessionsResult,
    ] = await Promise.all([
      // Get all shows for this brand
      supabase.from('shows').select('id, title, status, scheduled_at, started_at, ended_at'),
      // Get all videos for this brand
      supabase.from('videos').select('id, title, status, is_published, created_at, thumbnail_url, cloudflare_stream_id'),
      // Get all engagement events
      supabase.from('engagement_events').select('show_id, event_type, viewer_id, created_at'),
      // Get all cart events (shows)
      supabase.from('cart_events').select('show_id, event_type, viewer_id, unit_price, quantity, currency, metadata, created_at'),
      // Get all video events
      supabase.from('video_events').select('video_id, event_type, viewer_id, unit_price, quantity, currency, metadata, created_at'),
      // Get cart sessions for conversion data
      supabase.from('cart_sessions').select('show_id, video_id, converted, order_total, order_currency, created_at'),
    ]);

    const shows = showsResult.data || [];
    const videos = videosResult.data || [];
    const engagementEvents = engagementResult.data || [];
    const cartEvents = cartEventsResult.data || [];
    const videoEvents = videoEventsResult.data || [];
    const cartSessions = cartSessionsResult.data || [];

    // ===== LIVE SHOWS STATS =====
    const liveShowStats = {
      totalShows: shows.length,
      completedShows: shows.filter(s => s.status === 'ended').length,
      totalViewers: new Set(
        engagementEvents
          .filter(e => e.event_type === 'viewer_join')
          .map(e => e.viewer_id)
      ).size,
      totalChatMessages: engagementEvents.filter(e => e.event_type === 'chat_message').length,
      totalReactions: engagementEvents.filter(e => e.event_type === 'reaction').length,
      totalProductViews: engagementEvents.filter(e => e.event_type === 'product_view').length,
      totalAddToCarts: cartEvents.filter(e => e.event_type === 'add_to_cart').length,
      totalCheckouts: cartEvents.filter(e => e.event_type === 'checkout_start').length,
      totalOrders: cartEvents.filter(e => e.event_type === 'order_completed').length,
      totalRevenue: cartEvents
        .filter(e => e.event_type === 'order_completed')
        .reduce((sum, e) => {
          const orderTotal = (e.metadata as Record<string, unknown>)?.order_total;
          return sum + (typeof orderTotal === 'number' ? orderTotal : 0);
        }, 0),
      addToCartValue: cartEvents
        .filter(e => e.event_type === 'add_to_cart')
        .reduce((sum, e) => sum + (e.unit_price || 0) * (e.quantity || 1), 0),
    };

    // ===== SHOPPABLE VIDEOS STATS =====
    const videoStats = {
      totalVideos: videos.length,
      publishedVideos: videos.filter(v => v.is_published).length,
      totalViews: videoEvents.filter(e => e.event_type === 'video_view').length,
      uniqueViewers: new Set(
        videoEvents
          .filter(e => e.event_type === 'video_view')
          .map(e => e.viewer_id)
      ).size,
      totalProductClicks: videoEvents.filter(e => e.event_type === 'product_click').length,
      totalAddToCarts: videoEvents.filter(e => e.event_type === 'add_to_cart').length,
      totalCheckouts: videoEvents.filter(e => e.event_type === 'checkout_start').length,
      totalOrders: videoEvents.filter(e => e.event_type === 'order_completed').length,
      totalRevenue: videoEvents
        .filter(e => e.event_type === 'order_completed')
        .reduce((sum, e) => {
          const orderTotal = (e.metadata as Record<string, unknown>)?.order_total;
          return sum + (typeof orderTotal === 'number' ? orderTotal : 0);
        }, 0),
      addToCartValue: videoEvents
        .filter(e => e.event_type === 'add_to_cart')
        .reduce((sum, e) => sum + (e.unit_price || 0) * (e.quantity || 1), 0),
    };

    // ===== COMBINED TOTALS =====
    const combinedStats = {
      totalRevenue: liveShowStats.totalRevenue + videoStats.totalRevenue,
      totalOrders: liveShowStats.totalOrders + videoStats.totalOrders,
      totalAddToCarts: liveShowStats.totalAddToCarts + videoStats.totalAddToCarts,
      totalCheckouts: liveShowStats.totalCheckouts + videoStats.totalCheckouts,
      totalEngagements: liveShowStats.totalViewers + videoStats.uniqueViewers,
    };

    // ===== CONVERSION RATES =====
    const conversionRates = {
      liveShows: {
        viewerToCart: liveShowStats.totalViewers > 0
          ? (liveShowStats.totalAddToCarts / liveShowStats.totalViewers * 100).toFixed(1)
          : '0.0',
        cartToCheckout: liveShowStats.totalAddToCarts > 0
          ? (liveShowStats.totalCheckouts / liveShowStats.totalAddToCarts * 100).toFixed(1)
          : '0.0',
        checkoutToOrder: liveShowStats.totalCheckouts > 0
          ? (liveShowStats.totalOrders / liveShowStats.totalCheckouts * 100).toFixed(1)
          : '0.0',
      },
      videos: {
        viewerToCart: videoStats.uniqueViewers > 0
          ? (videoStats.totalAddToCarts / videoStats.uniqueViewers * 100).toFixed(1)
          : '0.0',
        cartToCheckout: videoStats.totalAddToCarts > 0
          ? (videoStats.totalCheckouts / videoStats.totalAddToCarts * 100).toFixed(1)
          : '0.0',
        checkoutToOrder: videoStats.totalCheckouts > 0
          ? (videoStats.totalOrders / videoStats.totalCheckouts * 100).toFixed(1)
          : '0.0',
      },
    };

    // ===== TOP PERFORMING SHOWS =====
    const showPerformance = shows.map(show => {
      const showEngagement = engagementEvents.filter(e => e.show_id === show.id);
      const showCartEvents = cartEvents.filter(e => e.show_id === show.id);

      const viewers = new Set(
        showEngagement.filter(e => e.event_type === 'viewer_join').map(e => e.viewer_id)
      ).size;

      const revenue = showCartEvents
        .filter(e => e.event_type === 'order_completed')
        .reduce((sum, e) => {
          const orderTotal = (e.metadata as Record<string, unknown>)?.order_total;
          return sum + (typeof orderTotal === 'number' ? orderTotal : 0);
        }, 0);

      const orders = showCartEvents.filter(e => e.event_type === 'order_completed').length;

      return {
        id: show.id,
        title: show.title,
        status: show.status,
        scheduledAt: show.scheduled_at,
        viewers,
        revenue,
        orders,
        engagement: showEngagement.filter(e => e.event_type === 'chat_message').length +
                    showEngagement.filter(e => e.event_type === 'reaction').length,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // ===== TOP PERFORMING VIDEOS =====
    const videoPerformance = videos.map(video => {
      const vidEvents = videoEvents.filter(e => e.video_id === video.id);

      const views = vidEvents.filter(e => e.event_type === 'video_view').length;
      const productClicks = vidEvents.filter(e => e.event_type === 'product_click').length;
      const addToCarts = vidEvents.filter(e => e.event_type === 'add_to_cart').length;

      const revenue = vidEvents
        .filter(e => e.event_type === 'order_completed')
        .reduce((sum, e) => {
          const orderTotal = (e.metadata as Record<string, unknown>)?.order_total;
          return sum + (typeof orderTotal === 'number' ? orderTotal : 0);
        }, 0);

      const orders = vidEvents.filter(e => e.event_type === 'order_completed').length;

      return {
        id: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnail_url,
        cloudflareStreamId: video.cloudflare_stream_id,
        isPublished: video.is_published,
        views,
        productClicks,
        addToCarts,
        revenue,
        orders,
      };
    }).sort((a, b) => b.views - a.views);

    // ===== CART SESSION STATS =====
    const cartSessionStats = {
      totalSessions: cartSessions.length,
      convertedSessions: cartSessions.filter(s => s.converted).length,
      conversionRate: cartSessions.length > 0
        ? (cartSessions.filter(s => s.converted).length / cartSessions.length * 100).toFixed(1)
        : '0.0',
      attributedRevenue: cartSessions
        .filter(s => s.converted && s.order_total)
        .reduce((sum, s) => sum + (s.order_total || 0), 0),
    };

    return NextResponse.json({
      liveShows: liveShowStats,
      videos: videoStats,
      combined: combinedStats,
      conversionRates,
      topShows: showPerformance.slice(0, 5),
      topVideos: videoPerformance.slice(0, 5),
      cartSessions: cartSessionStats,
      // Raw counts for debugging
      _meta: {
        showCount: shows.length,
        videoCount: videos.length,
        engagementEventCount: engagementEvents.length,
        cartEventCount: cartEvents.length,
        videoEventCount: videoEvents.length,
      },
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
