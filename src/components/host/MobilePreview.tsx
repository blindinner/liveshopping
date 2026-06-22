'use client';

import { ReactNode } from 'react';

interface MobilePreviewProps {
  children: ReactNode;
}

/**
 * Mobile phone frame mockup
 * Wraps the video preview to show hosts exactly what viewers see on mobile
 */
export function MobilePreview({ children }: MobilePreviewProps) {
  return (
    <div className="relative mx-auto" style={{ maxWidth: '320px' }}>
      {/* Phone frame */}
      <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-10" />

        {/* Dynamic Island / Camera */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-700" />
          <div className="w-3 h-3 rounded-full bg-gray-800 ring-1 ring-gray-700" />
        </div>

        {/* Screen container - 9:16 aspect ratio */}
        <div
          className="relative bg-black rounded-[2.25rem] overflow-hidden"
          style={{ aspectRatio: '9/16' }}
        >
          {/* Screen content */}
          <div className="absolute inset-0">{children}</div>

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
        </div>

        {/* Side buttons */}
        <div className="absolute -right-1 top-28 w-1 h-12 bg-gray-800 rounded-l" />
        <div className="absolute -right-1 top-44 w-1 h-12 bg-gray-800 rounded-l" />
        <div className="absolute -left-1 top-32 w-1 h-16 bg-gray-800 rounded-r" />
      </div>

      {/* Reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none rounded-[3rem]" />
    </div>
  );
}
