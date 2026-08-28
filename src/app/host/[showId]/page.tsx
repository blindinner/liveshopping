'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { HostLayout } from '@/components/host/HostLayout';
import { MobilePreview } from '@/components/host/MobilePreview';
import { MetricsDashboard } from '@/components/host/MetricsDashboard';
import { ProductStaging } from '@/components/host/ProductStaging';
import { BroadcastPanel } from '@/components/host/BroadcastPanel';
import { HostNotes } from '@/components/host/HostNotes';
import { PollManager } from '@/components/host/PollManager';
import { AuctionControl } from '@/components/host/AuctionControl';
import { AuctionWinners } from '@/components/host/AuctionWinners';
import { InvitationManager } from '@/components/host/InvitationManager';
import { useChatMessages, useShowStatus, useViewerPresence } from '@/hooks/useRealtime';
import { createClient } from '@/lib/supabase/client';
import type { Show, ShowProduct, ChatMessage } from '@/types/database';

export default function HostControlPanel() {
  const params = useParams();
  const showId = params.showId as string;

  const [show, setShow] = useState<Show | null>(null);
  const [showProducts, setShowProducts] = useState<ShowProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [brandDomain, setBrandDomain] = useState<string | null>(null);
  const [isTogglingProduct, setIsTogglingProduct] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [isSavingEmbedUrl, setIsSavingEmbedUrl] = useState(false);
  const [embedUrlSaved, setEmbedUrlSaved] = useState(false);

  // Real-time hooks
  const { show: realtimeShow } = useShowStatus(showId);
  const { messages } = useChatMessages(showId);
  const { viewerCount } = useViewerPresence(showId, 'host');

  // Update show when realtime changes
  useEffect(() => {
    if (realtimeShow) {
      setShow(realtimeShow);
    }
  }, [realtimeShow]);

  // Initialize embed URL from show data
  useEffect(() => {
    if (show?.embed_url) {
      setEmbedUrl(show.embed_url);
    }
  }, [show?.embed_url]);

  // Load initial data
  useEffect(() => {
    loadShowData();
    loadBrand();
  }, [showId]);

  const loadBrand = async () => {
    const response = await fetch('/api/brands');
    const data = await response.json();
    if (data.brands?.[0]) {
      setBrandId(data.brands[0].id);
      setBrandDomain(data.brands[0].shopify_domain || null);
    }
  };

  const loadShowData = async () => {
    try {
      const [showResponse, productsResponse] = await Promise.all([
        fetch(`/api/shows/${showId}`),
        fetch(`/api/shows/${showId}/products`),
      ]);

      const showData = await showResponse.json();
      const productsData = await productsResponse.json();

      setShow(showData.show);
      setShowProducts(productsData.products || []);
    } catch (error) {
      console.error('Failed to load show data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProductActive = async (productId: string, isActive: boolean) => {
    setIsTogglingProduct(true);
    try {
      await fetch(`/api/shows/${showId}/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      });

      setShowProducts((prev) =>
        prev.map((p) => ({
          ...p,
          is_active: p.id === productId ? isActive : false,
        }))
      );
    } catch (error) {
      console.error('Failed to toggle product:', error);
    } finally {
      setIsTogglingProduct(false);
    }
  };

  const hideMessage = async (messageId: string) => {
    const supabase = createClient();
    await supabase
      .from('chat_messages')
      .update({ hidden: true })
      .eq('id', messageId);
  };

  const updateShowStatus = async (status: 'live' | 'ended') => {
    try {
      const response = await fetch(`/api/shows/${showId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update show status');
      }

      const { show: updatedShow } = await response.json();
      setShow(updatedShow);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert(`Failed to ${status === 'ended' ? 'end' : 'start'} show. Please try again.`);
    }
  };

  const saveEmbedUrl = async () => {
    setIsSavingEmbedUrl(true);
    try {
      const response = await fetch(`/api/shows/${showId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embed_url: embedUrl || null }),
      });

      if (response.ok) {
        const { show: updatedShow } = await response.json();
        setShow(updatedShow);
        setEmbedUrlSaved(true);
        setTimeout(() => setEmbedUrlSaved(false), 2000);
      }
    } catch (error) {
      console.error('Failed to save embed URL:', error);
    } finally {
      setIsSavingEmbedUrl(false);
    }
  };

  const activeProduct = showProducts.find((p) => p.is_active);
  const activeAuction = activeProduct?.sale_type === 'auction' ? activeProduct : null;

  const handleAuctionUpdate = (updates: Partial<ShowProduct>) => {
    if (!activeProduct) return;
    setShowProducts((prev) =>
      prev.map((p) =>
        p.id === activeProduct.id ? { ...p, ...updates } : p
      )
    );
  };

  if (isLoading || !show) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  // Left column: Notes and Chat
  const leftColumn = (
    <>
      {/* Host Notes - Teleprompter style */}
      <HostNotes
        showProducts={showProducts}
        activeProductId={activeProduct?.id}
      />

      {/* Chat */}
      <section className="bg-white/5 rounded-2xl p-4">
        <h2 className="text-base font-semibold text-white mb-4">Chat</h2>
        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {messages.length === 0 ? (
            <p className="text-white/50 text-center py-6">No messages yet</p>
          ) : (
            messages.slice(-30).map((msg: ChatMessage) => (
              <div
                key={msg.id}
                className="flex items-start gap-2 bg-black/20 rounded-lg p-2"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-pink-400 text-xs font-medium">
                    {msg.viewer_name}
                  </span>
                  <p className="text-white text-sm">{msg.message}</p>
                </div>
                <button
                  onClick={() => hideMessage(msg.id)}
                  className="p-1 text-white/40 hover:text-red-400"
                  title="Hide message"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </section>

    </>
  );

  // Center column: Video
  const centerColumn = show.status === 'ended' ? (
    <div className="bg-white/5 rounded-2xl p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-white font-semibold mb-2">Show Ended</h3>
      <p className="text-white/50 text-sm">This show has concluded</p>
    </div>
  ) : show.cloudflare_webrtc_url ? (
    <MobilePreview>
      <BroadcastPanel
        webRtcUrl={show.cloudflare_webrtc_url}
        isShowLive={show.status === 'live'}
        onStartShow={() => updateShowStatus('live')}
        onEndShow={() => updateShowStatus('ended')}
        compact
      />
    </MobilePreview>
  ) : (
    <div className="bg-white/5 rounded-2xl p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
        <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-white font-semibold mb-2">Stream Setup Required</h3>
      <p className="text-white/50 text-sm">WebRTC streaming is not configured for this show</p>
    </div>
  );

  // Right column: Analytics, Polls, Auctions, and Products
  const rightColumn = (
    <>
      {/* Metrics Dashboard */}
      <MetricsDashboard showId={showId} viewerCount={viewerCount} />

      {/* Embed URL Settings */}
      <section className="bg-white/5 rounded-2xl p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <h2 className="text-base font-semibold text-white">Embed Settings</h2>
        </div>

        {/* Show detected Shopify domain if available */}
        {brandDomain && !show?.embed_url && (
          <div className="mb-3 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400 text-xs font-medium">Shopify store detected</span>
            </div>
            <p className="text-white/70 text-xs mt-1">
              Using <span className="text-green-300 font-mono">{brandDomain}</span> for invitation links
            </p>
          </div>
        )}

        <p className="text-white/50 text-xs mb-3">
          {brandDomain
            ? 'Override the detected domain with a custom URL, or leave empty to use your Shopify store.'
            : 'If this show is embedded on another website, enter the URL. Invitation links will redirect viewers there.'}
        </p>
        <div className="flex gap-2">
          <input
            type="url"
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            placeholder={brandDomain ? `https://${brandDomain}/live` : "https://yourbrand.com/live-auction"}
            className="flex-1 bg-black/30 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:text-white/30 border border-white/10"
          />
          <button
            onClick={saveEmbedUrl}
            disabled={isSavingEmbedUrl || embedUrl === (show?.embed_url || '')}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-2"
          >
            {isSavingEmbedUrl ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : embedUrlSaved ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
        {show?.embed_url && (
          <p className="text-green-400/70 text-xs mt-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Viewers will be redirected to: {show.embed_url}
          </p>
        )}
      </section>

      {/* Invitation Manager - shows for private auctions */}
      {show.auction_type === 'private' && (
        <section className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-base font-semibold text-white">Private Auction</h2>
          </div>
          <InvitationManager showId={showId} />
        </section>
      )}

      {/* Auction Control - shows when an auction product is active */}
      {activeAuction && (
        <AuctionControl
          showProduct={activeAuction}
          showId={showId}
          onAuctionUpdate={handleAuctionUpdate}
        />
      )}

      {/* Auction Winners - shows completed auctions */}
      <AuctionWinners showId={showId} />

      {/* Poll Manager */}
      <PollManager showId={showId} />

      {/* Product Staging */}
      <ProductStaging
        showId={showId}
        brandId={brandId}
        showProducts={showProducts}
        onProductsChange={setShowProducts}
        activeProductId={activeProduct?.id}
        onSelectActive={toggleProductActive}
        isTogglingProduct={isTogglingProduct}
      />
    </>
  );

  return (
    <HostLayout
      showId={showId}
      show={show}
      viewerCount={viewerCount}
      onEndShow={show.status === 'live' ? () => updateShowStatus('ended') : undefined}
      leftColumn={leftColumn}
      centerColumn={centerColumn}
      rightColumn={rightColumn}
    />
  );
}
