'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  useEffect(() => {
    loadShows();
    loadBrand();
  }, []);

  const loadBrand = async () => {
    // For MVP, get the first brand (single brand setup)
    const response = await fetch('/api/brands');
    const data = await response.json();
    if (data.brands?.[0]) {
      setBrandId(data.brands[0].id);
    }
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
