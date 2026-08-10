'use client';

import { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ProductTimeline } from '@/components/host/ProductTimeline';
import { VideoAnalyticsDashboard } from '@/components/host/VideoAnalyticsDashboard';
import type { Video } from '@/types/database';

export default function EditVideoPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = use(params);
  const [video, setVideo] = useState<Video | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [brandId, setBrandId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const response = await fetch(`/api/videos/${videoId}`);
        if (!response.ok) {
          router.push('/host/videos');
          return;
        }
        const { video } = await response.json();
        setVideo(video);
        setTitle(video.title);
        setDescription(video.description || '');
      } catch (error) {
        console.error('Failed to load video:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const loadBrand = async () => {
      const response = await fetch('/api/brands');
      const data = await response.json();
      if (data.brands?.[0]) {
        setBrandId(data.brands[0].id);
      }
    };

    loadVideo();
    loadBrand();
  }, [videoId, router]);

  const handleSave = async () => {
    if (!title) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || null,
        }),
      });

      if (response.ok) {
        const { video: updatedVideo } = await response.json();
        setVideo(updatedVideo);
      }
    } catch (error) {
      console.error('Failed to save video:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const checkStatus = useCallback(async () => {
    setIsCheckingStatus(true);
    try {
      const response = await fetch(`/api/videos/${videoId}/status`);
      if (response.ok) {
        const { video: updatedVideo } = await response.json();
        if (updatedVideo) {
          setVideo(updatedVideo);
        }
      }
    } catch (error) {
      console.error('Failed to check status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  }, [videoId]);

  const togglePublish = async () => {
    if (!video) return;
    setIsPublishing(true);
    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_published: !video.is_published,
        }),
      });

      if (response.ok) {
        const { video: updatedVideo } = await response.json();
        setVideo(updatedVideo);
      }
    } catch (error) {
      console.error('Failed to toggle publish:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  // Auto-poll status while processing
  useEffect(() => {
    if (video?.status === 'processing') {
      const interval = setInterval(checkStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [video?.status, checkStatus]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="p-4 md:p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/host/videos" className="text-white/60 hover:text-white p-1 -ml-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">Edit Video</h1>
              {getStatusBadge(video.status)}
            </div>
            <p className="text-white/60 text-sm mt-0.5">{video.title}</p>
          </div>
        </div>
        <Button onClick={handleSave} isLoading={isSaving} disabled={!title}>
          Save Changes
        </Button>
      </div>

      <div className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Preview */}
          <section className="bg-white/5 rounded-2xl overflow-hidden">
            <div className="aspect-[9/16] bg-black relative">
              {video.status === 'ready' && video.cloudflare_playback_id ? (
                <iframe
                  src={`https://customer-${process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID || 'f83anpt0jiknxr1e'}.cloudflarestream.com/${video.cloudflare_playback_id}/iframe?autoplay=false`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                />
              ) : video.thumbnail_url ? (
                <Image
                  src={video.thumbnail_url}
                  alt={video.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {video.status === 'processing' ? (
                    <div className="text-center">
                      <div className="animate-spin w-12 h-12 border-2 border-white border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-white/60 mb-4">Processing video...</p>
                      <button
                        onClick={checkStatus}
                        disabled={isCheckingStatus}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isCheckingStatus ? 'Checking...' : 'Check Status'}
                      </button>
                      <p className="text-white/40 text-xs mt-2">Auto-checking every 5s</p>
                    </div>
                  ) : video.status === 'error' ? (
                    <div className="text-center text-red-400">
                      <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p>Video processing failed</p>
                    </div>
                  ) : (
                    <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Edit Form */}
          <div className="space-y-6">
            {/* Publishing Status - Prominent Section */}
            {video.status === 'ready' && (
              <section
                className={`rounded-2xl p-4 border-2 transition-colors ${
                  video.is_published
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-yellow-500/10 border-yellow-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {video.is_published ? (
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold ${video.is_published ? 'text-green-400' : 'text-yellow-400'}`}>
                          {video.is_published ? 'Published' : 'Not Published'}
                        </p>
                        {video.is_published && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                            Live
                          </span>
                        )}
                      </div>
                      <p className="text-white/60 text-sm mt-0.5">
                        {video.is_published
                          ? 'Visible in your carousel and floating widgets'
                          : 'Publish to make visible in your widgets'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={togglePublish}
                    disabled={isPublishing}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      video.is_published
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    } ${isPublishing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isPublishing ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Updating...
                      </span>
                    ) : video.is_published ? (
                      'Unpublish'
                    ) : (
                      'Publish Now'
                    )}
                  </button>
                </div>
              </section>
            )}

            {/* Video Details */}
            <section className="bg-white/5 rounded-2xl p-4 space-y-4">
              <h2 className="text-base font-semibold text-white">Video Details</h2>

              <Input
                name="title"
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div>
                <label className="block text-white/70 text-sm mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your video..."
                  rows={3}
                  className="w-full bg-black/30 text-white text-sm rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/50 placeholder:text-white/30 border border-white/10"
                />
              </div>
            </section>

            {/* Products Timeline */}
            {brandId && (
              <ProductTimeline
                videoId={videoId}
                brandId={brandId}
                videoDuration={video.duration_seconds}
              />
            )}

            {/* Video Analytics */}
            {video.status === 'ready' && (
              <section className="bg-white/5 rounded-2xl p-4">
                <h2 className="text-base font-semibold text-white mb-4">Analytics</h2>
                <VideoAnalyticsDashboard videoId={videoId} />
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
