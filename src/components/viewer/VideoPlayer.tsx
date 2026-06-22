'use client';

import { Badge } from '@/components/ui/Badge';

interface VideoPlayerProps {
  playbackId: string | null;
  isLive: boolean;
  viewerCount: number;
  locale: 'he' | 'en';
}

export function VideoPlayer({
  playbackId,
  isLive,
  viewerCount,
  locale,
}: VideoPlayerProps) {
  const t = {
    he: {
      live: 'LIVE',
      viewers: 'viewers',
      waiting: 'Waiting for stream...',
    },
    en: {
      live: 'LIVE',
      viewers: 'viewers',
      waiting: 'Waiting for stream...',
    },
  }[locale];

  if (!playbackId) {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-white/60 text-center">
          <div className="animate-pulse mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p>{t.waiting}</p>
        </div>
      </div>
    );
  }

  // Cloudflare Stream iframe URL with mobile-friendly params
  const iframeSrc = `https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID || ''}.cloudflarestream.com/${playbackId}/iframe?muted=true&autoplay=true&loop=false&controls=true&playsinline=true&preload=auto`;

  return (
    <div className="absolute inset-0">
      {/* Cloudflare Stream Player - full bleed vertical video */}
      <iframe
        src={iframeSrc}
        className="absolute inset-0 w-full h-full border-0"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
      />

      {/* Overlays */}
      <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
        <div className="flex items-center justify-between">
          {/* Live badge */}
          {isLive && (
            <Badge variant="live" pulse>
              {t.live}
            </Badge>
          )}

          {/* Viewer count */}
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <svg
              className="w-4 h-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-white text-sm font-medium">
              {viewerCount.toLocaleString(locale === 'he' ? 'he-IL' : 'en-US')}{' '}
              {t.viewers}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
