'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { SetupLayout, SetupTab } from '@/components/host/SetupLayout';
import { InvitationManager } from '@/components/host/InvitationManager';
import { EmailSequenceManager } from '@/components/host/EmailSequenceManager';
import { ProductStaging } from '@/components/host/ProductStaging';
import type { Show, ShowProduct, AuctionType, SaleType } from '@/types/database';

export default function ShowSetupPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const showId = params.showId as string;

  const [show, setShow] = useState<Show | null>(null);
  const [showProducts, setShowProducts] = useState<ShowProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [brandId, setBrandId] = useState<string | null>(null);

  // Form state
  const [isSaving, setIsSaving] = useState(false);
  const [showTitle, setShowTitle] = useState('');
  const [showScheduledAt, setShowScheduledAt] = useState('');
  const [showType, setShowType] = useState<AuctionType>('public');
  const [defaultSaleType, setDefaultSaleType] = useState<SaleType>('buy_now');

  // Tab from URL or default (settings is first)
  const tabParam = searchParams.get('tab') as SetupTab | null;
  const activeTab: SetupTab = tabParam && ['settings', 'guests', 'emails', 'products'].includes(tabParam)
    ? tabParam
    : 'settings';

  const handleTabChange = (tab: SetupTab) => {
    router.push(`/host/${showId}/setup?tab=${tab}`);
  };

  // Load initial data
  useEffect(() => {
    loadShowData();
    loadBrand();
  }, [showId]);

  // Initialize form state from show data
  useEffect(() => {
    if (show) {
      setShowTitle(show.title === 'Untitled Show' ? '' : show.title);
      setShowType(show.auction_type);
      // Format for datetime-local input
      const date = new Date(show.scheduled_at);
      const localIso = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setShowScheduledAt(localIso);
    }
  }, [show]);

  const loadBrand = async () => {
    const response = await fetch('/api/brands');
    const data = await response.json();
    if (data.brands?.[0]) {
      setBrandId(data.brands[0].id);
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

  // Save settings and go to next tab
  const saveAndGoNext = async () => {
    if (!showTitle.trim() || !showScheduledAt) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/shows/${showId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: showTitle,
          scheduled_at: new Date(showScheduledAt).toISOString(),
          auction_type: showType,
        }),
      });

      if (response.ok) {
        const { show: updatedShow } = await response.json();
        setShow(updatedShow);
        // Go to next tab
        router.push(`/host/${showId}/setup?tab=products`);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const canProceed = showTitle.trim() !== '' && showScheduledAt !== '';

  // Handle email settings change
  const handleEmailSettingsChange = async (subject: string, body: string) => {
    try {
      const response = await fetch(`/api/shows/${showId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitation_email_subject: subject,
          invitation_email_body: body,
        }),
      });

      if (response.ok) {
        const { show: updatedShow } = await response.json();
        setShow(updatedShow);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to save email settings:', errorData);
        throw new Error(errorData.error || 'Failed to save email settings');
      }
    } catch (error) {
      console.error('Email settings save error:', error);
      throw error;
    }
  };

  if (isLoading || !show) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  // Redirect to live if show is already live or ended
  if (show.status === 'live' || show.status === 'ended') {
    router.replace(`/host/${showId}/live`);
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'guests':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Guest Invitations</h2>
              <p className="text-white/50 text-sm">
                {show.auction_type === 'private'
                  ? 'Invite guests to your private show. They will receive an email with a unique link to join.'
                  : 'This is a public show. Anyone with the link can join. Switch to private in Settings to enable invitations.'}
              </p>
            </div>
            {show.auction_type === 'private' ? (
              <InvitationManager
                showId={showId}
                showTitle={show.title}
                showScheduledAt={show.scheduled_at}
                invitationEmailSubject={show.invitation_email_subject}
                invitationEmailBody={show.invitation_email_body}
                onEmailSettingsChange={handleEmailSettingsChange}
                onNext={() => router.push(`/host/${showId}/setup?tab=emails`)}
              />
            ) : (
              <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
                <svg className="w-12 h-12 mx-auto mb-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-white/50">
                  Enable private mode in Settings to manage guest invitations.
                </p>
              </div>
            )}
          </div>
        );

      case 'emails':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Email Reminders</h2>
              <p className="text-white/50 text-sm">
                {show.auction_type === 'private'
                  ? 'Set up automatic email reminders to send to your guests before the show.'
                  : 'Email reminders are only available for private shows.'}
              </p>
            </div>
            {show.auction_type === 'private' ? (
              <EmailSequenceManager showId={showId} showScheduledAt={show.scheduled_at} />
            ) : (
              <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
                <svg className="w-12 h-12 mx-auto mb-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-white/50">
                  Enable private mode in Settings to set up email reminders.
                </p>
              </div>
            )}
            {/* Go to Studio Button */}
            <div className="pt-4">
              <button
                onClick={() => router.push(`/host/${showId}/live`)}
                className="w-full px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Go to Studio
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Products</h2>
              <p className="text-white/50 text-sm">
                Add products you want to feature during the show. You can set up auctions or direct purchases.
              </p>
            </div>
            <ProductStaging
              showId={showId}
              brandId={brandId}
              showProducts={showProducts}
              onProductsChange={setShowProducts}
              activeProductId={undefined}
              onSelectActive={() => {}}
              isTogglingProduct={false}
              defaultSaleType={defaultSaleType}
            />
            {/* Next Button */}
            <div className="pt-4">
              <button
                onClick={() => router.push(`/host/${showId}/setup?tab=guests`)}
                className="w-full px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                Next: Guests
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-8">
            {/* Show Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Show Details</h2>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Show Title</label>
                  <input
                    type="text"
                    value={showTitle}
                    onChange={(e) => setShowTitle(e.target.value)}
                    placeholder="e.g., Summer Collection Launch"
                    className="w-full bg-black/30 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 border border-white/10 placeholder:text-white/30"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Scheduled Date & Time</label>
                  <input
                    type="datetime-local"
                    value={showScheduledAt}
                    onChange={(e) => setShowScheduledAt(e.target.value)}
                    className="w-full bg-black/30 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 border border-white/10"
                  />
                </div>
              </div>
            </div>

            {/* Show Type */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Who Can Join?</h2>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setShowType('public')}
                    className={`p-5 rounded-xl border-2 transition-all text-left ${
                      showType === 'public'
                        ? 'border-pink-500 bg-pink-500/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <svg className="w-6 h-6 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-white font-semibold">Public</p>
                    <p className="text-white/50 text-sm mt-1">Anyone with the link can join</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowType('private')}
                    className={`p-5 rounded-xl border-2 transition-all text-left ${
                      showType === 'private'
                        ? 'border-pink-500 bg-pink-500/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <svg className="w-6 h-6 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-white font-semibold">Private</p>
                    <p className="text-white/50 text-sm mt-1">Only invited guests can join</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Sale Type */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">How Will You Sell?</h2>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDefaultSaleType('buy_now')}
                    className={`p-5 rounded-xl border-2 transition-all text-left ${
                      defaultSaleType === 'buy_now'
                        ? 'border-pink-500 bg-pink-500/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <svg className="w-6 h-6 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-white font-semibold">Buy Now</p>
                    <p className="text-white/50 text-sm mt-1">Fixed price, instant purchase</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefaultSaleType('auction')}
                    className={`p-5 rounded-xl border-2 transition-all text-left ${
                      defaultSaleType === 'auction'
                        ? 'border-pink-500 bg-pink-500/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <svg className="w-6 h-6 text-white mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-white font-semibold">Auction</p>
                    <p className="text-white/50 text-sm mt-1">Competitive bidding with timer</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-4">
              <button
                onClick={saveAndGoNext}
                disabled={!canProceed || isSaving}
                className="w-full px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Next: Products
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <SetupLayout
      showId={showId}
      show={show}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {renderTabContent()}
    </SetupLayout>
  );
}
