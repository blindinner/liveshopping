'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import type { Video } from '@/types/database';

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const response = await fetch('/api/videos');
        const data = await response.json();
        setVideos(data.videos || []);
      } catch (error) {
        console.error('Failed to load videos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideos();
  }, []);

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="scheduled">Ready</Badge>;
      case 'processing':
        return <Badge variant="live" pulse>Processing</Badge>;
      case 'error':
        return <Badge variant="ended">Error</Badge>;
      default:
        return null;
    }
  };

  const handleDelete = async (videoId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      await fetch(`/api/videos/${videoId}`, { method: 'DELETE' });
      setVideos(videos.filter(v => v.id !== videoId));
    } catch (error) {
      console.error('Failed to delete video:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link href="/host" className="text-white/60 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-white">Shoppable Videos</h1>
        </div>
        <Link
          href="/host/videos/new"
          className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Upload Video
        </Link>
      </header>

      <div className="p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-video bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-white text-lg font-medium mb-2">No videos yet</h2>
            <p className="text-white/50 text-sm mb-6">Upload your first shoppable video to get started</p>
            <Link
              href="/host/videos/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Upload Video
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <Link
                key={video.id}
                href={`/host/videos/${video.id}/edit`}
                className="group block bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-black">
                  {video.thumbnail_url ? (
                    <Image
                      src={video.thumbnail_url}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                      <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
                    {formatDuration(video.duration_seconds)}
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(video.id, e)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white/70 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-white font-medium truncate flex-1">{video.title}</h3>
                    {getStatusBadge(video.status)}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-sm text-white/50">
                    <span>{formatDate(video.created_at)}</span>
                    {video.product && (
                      <>
                        <span>-</span>
                        <span className="truncate">{video.product.title}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
