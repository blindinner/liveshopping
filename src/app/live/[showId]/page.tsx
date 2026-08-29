'use client';

import { useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

// Redirect /live/[showId] to /embed/[showId] for consistent viewer experience
export default function LiveViewerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const showId = params.showId as string;

  useEffect(() => {
    // Preserve all query params when redirecting
    const queryString = searchParams.toString();
    const redirectUrl = `/embed/${showId}${queryString ? `?${queryString}` : ''}`;
    router.replace(redirectUrl);
  }, [showId, searchParams, router]);

  // Show loading while redirecting
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
    </div>
  );
}
