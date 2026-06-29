'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import type { Video } from '@/types/database';

interface VideoThumbnailProps {
  video: Video;
  onClick: () => void;
  isActive?: boolean;
  showTitle?: boolean;
  aspectRatio?: '9/16' | '16/9' | '1/1';
}

export function VideoThumbnail({
  video,
  onClick,
  isActive = false,
  showTitle = true,
  aspectRatio = '9/16',
}: VideoThumbnailProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const thumbnailRef = useRef<HTMLButtonElement>(null);

  // Lazy load with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (thumbnailRef.current) {
      observer.observe(thumbnailRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const thumbnailUrl = video.cover_image_url || video.thumbnail_url;

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <button
      ref={thumbnailRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`
        relative flex-shrink-0 rounded-xl overflow-hidden bg-gray-900 transition-all duration-200
        ${isActive ? 'ring-2 ring-pink-500 scale-105' : 'hover:scale-105'}
        focus:outline-none focus:ring-2 focus:ring-pink-500
      `}
      style={{ aspectRatio }}
    >
      {/* Thumbnail Image (lazy loaded) */}
      {isVisible && thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 40vw, 200px"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
      )}

      {/* Play icon overlay */}
      <div
        className={`
          absolute inset-0 flex items-center justify-center
          bg-black/30 transition-opacity duration-200
          ${isHovering ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-gray-900 ml-0.5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Duration badge */}
      {video.duration_seconds && (
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
          {formatDuration(video.duration_seconds)}
        </div>
      )}

      {/* Title overlay */}
      {showTitle && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white text-sm font-medium truncate">{video.title}</p>
        </div>
      )}

      {/* Product indicator */}
      {video.products && video.products.length > 0 && (
        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-pink-500 text-white text-xs rounded-full flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          {video.products.length}
        </div>
      )}
    </button>
  );
}
