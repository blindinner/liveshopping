'use client';

import { useState, useRef, useEffect } from 'react';
import { VideoThumbnail } from './VideoThumbnail';
import { VideoModal } from './VideoModal';
import type { Video } from '@/types/database';

interface VideoCarouselProps {
  videos: Video[];
  layout?: 'horizontal' | 'grid';
  showTitle?: boolean;
  aspectRatio?: '9/16' | '16/9' | '1/1';
  thumbnailWidth?: number;
  className?: string;
}

export function VideoCarousel({
  videos,
  layout = 'horizontal',
  showTitle = true,
  aspectRatio = '9/16',
  thumbnailWidth = 160,
  className = '',
}: VideoCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll state
  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    updateScrollState();
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', updateScrollState);
      window.addEventListener('resize', updateScrollState);
    }
    return () => {
      scrollEl?.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [videos]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = thumbnailWidth * 2;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const selectedVideo = selectedIndex !== null ? videos[selectedIndex] : null;

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < videos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  if (videos.length === 0) {
    return null;
  }

  if (layout === 'grid') {
    return (
      <>
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 ${className}`}>
          {videos.map((video, index) => (
            <VideoThumbnail
              key={video.id}
              video={video}
              onClick={() => setSelectedIndex(index)}
              isActive={selectedIndex === index}
              showTitle={showTitle}
              aspectRatio={aspectRatio}
            />
          ))}
        </div>

        {selectedVideo && (
          <VideoModal
            video={selectedVideo}
            isOpen={true}
            onClose={() => setSelectedIndex(null)}
            onNext={handleNext}
            onPrevious={handlePrevious}
            hasNext={selectedIndex !== null && selectedIndex < videos.length - 1}
            hasPrevious={selectedIndex !== null && selectedIndex > 0}
          />
        )}
      </>
    );
  }

  // Horizontal carousel
  return (
    <>
      <div className={`relative ${className}`}>
        {/* Left scroll button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/70 hover:bg-black/90 rounded-full text-white shadow-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right scroll button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/70 hover:bg-black/90 rounded-full text-white shadow-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-1 py-1"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {videos.map((video, index) => (
            <div
              key={video.id}
              className="snap-start"
              style={{ width: thumbnailWidth, flexShrink: 0 }}
            >
              <VideoThumbnail
                video={video}
                onClick={() => setSelectedIndex(index)}
                isActive={selectedIndex === index}
                showTitle={showTitle}
                aspectRatio={aspectRatio}
              />
            </div>
          ))}
        </div>
      </div>

      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          isOpen={true}
          onClose={() => setSelectedIndex(null)}
          onNext={handleNext}
          onPrevious={handlePrevious}
          hasNext={selectedIndex !== null && selectedIndex < videos.length - 1}
          hasPrevious={selectedIndex !== null && selectedIndex > 0}
        />
      )}
    </>
  );
}

// Export individual components for flexibility
export { VideoThumbnail } from './VideoThumbnail';
export { VideoModal } from './VideoModal';
