'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import type { Show } from '@/types/database';

export default function HostDashboard() {
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newShowTitle, setNewShowTitle] = useState('');
  const [newShowDate, setNewShowDate] = useState('');
  const [brandId, setBrandId] = useState<string | null>(null);
  const [brandDomain, setBrandDomain] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [shopDomain, setShopDomain] = useState('');
  const [justInstalled, setJustInstalled] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    loadShows();
    loadBrand();

    // Check if we just installed the app
    if (searchParams.get('installed') === 'true') {
      setJustInstalled(true);
      // Clear the URL params
      window.history.replaceState({}, '', '/host');
    }
  }, [searchParams]);

  const loadBrand = async () => {
    // For MVP, get the first brand (single brand setup)
    const response = await fetch('/api/brands');
    const data = await response.json();
    if (data.brands?.[0]) {
      setBrandId(data.brands[0].id);
      setBrandDomain(data.brands[0].shopify_domain || null);
    }
  };

  const handleConnectShopify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopDomain) return;

    // Ensure proper format
    let domain = shopDomain.trim().toLowerCase();
    if (!domain.includes('.myshopify.com')) {
      domain = `${domain}.myshopify.com`;
    }

    // Redirect to OAuth flow
    window.location.href = `/api/shopify/auth?shop=${encodeURIComponent(domain)}`;
  };

  const loadShows = async () => {
    try {
      const response = await fetch('/api/shows');
      const data = await response.json();
      setShows(data.shows || []);
    } catch (error) {
      console.error('Failed to load shows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShowTitle || !newShowDate || !brandId) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/shows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newShowTitle,
          scheduledAt: new Date(newShowDate).toISOString(),
          brandId,
        }),
      });

      if (response.ok) {
        const { show } = await response.json();
        router.push(`/host/${show.id}`);
      }
    } catch (error) {
      console.error('Failed to create show:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge variant="live" pulse>LIVE</Badge>;
      case 'scheduled':
        return <Badge variant="scheduled">Scheduled</Badge>;
      case 'ended':
        return <Badge variant="ended">Ended</Badge>;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Success Toast */}
      {justInstalled && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          Shopify store connected successfully!
        </div>
      )}

      {/* Connect Shopify Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Connect Shopify Store</h2>
            <form onSubmit={handleConnectShopify} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Your Shopify store URL
                </label>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="your-store"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                    className="flex-1 bg-white/10 border border-white/20 rounded-l-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-pink-500"
                    required
                  />
                  <span className="bg-white/5 border border-l-0 border-white/20 rounded-r-lg px-3 py-3 text-white/40 text-sm">
                    .myshopify.com
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowConnectModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Connect
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-white/10">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-white/60 hover:text-white"
        >
          Logout
        </button>
      </header>

      <div className="p-4 space-y-8">
        {/* Store Connection Status */}
        {!brandDomain ? (
          <section className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold">Connect Your Store</h2>
                <p className="text-white/60 text-sm mt-1">
                  Connect your Shopify store to start creating shoppable videos
                </p>
              </div>
              <Button onClick={() => setShowConnectModal(true)} size="sm">
                Connect Shopify
              </Button>
            </div>
          </section>
        ) : (
          <section className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">Store Connected</h3>
                  <p className="text-white/50 text-sm">{brandDomain}</p>
                </div>
              </div>
              <button
                onClick={() => setShowConnectModal(true)}
                className="text-sm text-white/40 hover:text-white"
              >
                Change
              </button>
            </div>
          </section>
        )}

        {/* Quick Links */}
        <section className="grid grid-cols-2 gap-3">
          <Link
            href="/host/videos"
            className="bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium">Videos</h3>
                <p className="text-white/50 text-sm">Upload &amp; manage videos</p>
              </div>
            </div>
          </Link>
          <Link
            href="/host/widgets"
            className="bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium">Widgets</h3>
                <p className="text-white/50 text-sm">Embed code generator</p>
              </div>
            </div>
          </Link>
        </section>

        {/* Create New Show */}
        <section className="bg-white/5 rounded-2xl p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Create New Show</h2>
          <form onSubmit={handleCreateShow} className="space-y-4">
            <Input
              name="title"
              label="Show Title"
              placeholder="e.g., Summer Sale 2024"
              value={newShowTitle}
              onChange={(e) => setNewShowTitle(e.target.value)}
              required
            />
            <Input
              name="scheduled_at"
              label="Date & Time"
              type="datetime-local"
              value={newShowDate}
              onChange={(e) => setNewShowDate(e.target.value)}
              required
              dir="ltr"
            />
            <Button
              type="submit"
              isLoading={isCreating}
              disabled={!newShowTitle || !newShowDate || !brandId}
              className="w-full"
            >
              Create Show
            </Button>
          </form>
        </section>

        {/* Shows List */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">My Shows</h2>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto" />
            </div>
          ) : shows.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              <p>No shows yet</p>
              <p className="text-sm mt-1">Create your first show above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shows.map((show) => (
                <Link
                  key={show.id}
                  href={`/host/${show.id}`}
                  className="block bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      {getStatusBadge(show.status)}
                      <h3 className="text-white font-medium mt-2">
                        {show.title}
                      </h3>
                      <p className="text-white/60 text-sm mt-1">
                        {formatDate(show.scheduled_at)}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-white/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
