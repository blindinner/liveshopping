'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LiveTimer } from '@/components/host/LiveTimer';
import type { Show } from '@/types/database';

interface HostLayoutProps {
  showId: string;
  show: Show;
  viewerCount: number;
  onEndShow?: () => void;
  leftColumn: ReactNode;
  centerColumn: ReactNode;
  rightColumn: ReactNode;
}

/**
 * Host panel layout with 3 columns
 * Left: Notes + Chat
 * Center: Video preview
 * Right: Analytics + Products
 */
export function HostLayout({
  showId,
  show,
  viewerCount,
  onEndShow,
  leftColumn,
  centerColumn,
  rightColumn,
}: HostLayoutProps) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <header className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-b border-white/10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/host"
              className="p-2 text-white/60 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white">{show.title}</h1>
              {show.status === 'live' && (
                <span className="text-white/60 text-sm">
                  {viewerCount} watching
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {show.status === 'live' ? (
              <>
                <Badge variant="live" pulse>
                  LIVE
                </Badge>
                {show.started_at && <LiveTimer startedAt={show.started_at} />}
                {onEndShow && (
                  <Button variant="danger" size="sm" onClick={onEndShow}>
                    End Show
                  </Button>
                )}
              </>
            ) : show.status === 'scheduled' ? (
              <Badge variant="scheduled">Scheduled</Badge>
            ) : (
              <Badge variant="ended">Ended</Badge>
            )}
          </div>
        </div>
      </header>

      {/* Main content - fills remaining height */}
      <main className="flex-1 min-h-0 p-4">
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-[1600px] mx-auto">
          {/* Left column - Notes + Chat */}
          <div className="overflow-y-auto space-y-4 order-2 lg:order-1 pr-2">{leftColumn}</div>

          {/* Center column - Video */}
          <div className="overflow-y-auto space-y-4 order-1 lg:order-2">{centerColumn}</div>

          {/* Right column - Analytics + Products */}
          <div className="overflow-y-auto space-y-4 order-3 pr-2">{rightColumn}</div>
        </div>
      </main>

      {/* View as viewer link */}
      <div className="fixed bottom-4 right-4">
        <Link
          href={`/live/${showId}`}
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm transition-colors"
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          View as Viewer
        </Link>
      </div>
    </div>
  );
}
