'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function HostShowRedirect() {
  const params = useParams();
  const router = useRouter();
  const showId = params.showId as string;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function redirectBasedOnStatus() {
      try {
        const response = await fetch(`/api/shows/${showId}`);

        if (!response.ok) {
          setError('Show not found');
          return;
        }

        const { show } = await response.json();

        // Redirect based on show status
        if (show.status === 'scheduled') {
          router.replace(`/host/${showId}/setup`);
        } else {
          // live or ended -> go to live/studio view
          router.replace(`/host/${showId}/live`);
        }
      } catch (err) {
        console.error('Failed to load show:', err);
        setError('Failed to load show');
      }
    }

    redirectBasedOnStatus();
  }, [showId, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/70 mb-4">{error}</p>
          <a href="/host" className="text-pink-400 hover:text-pink-300">
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
    </div>
  );
}
