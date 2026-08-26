'use client';

import type { AuctionType } from '@/types/database';

interface ShowTypeToggleProps {
  value: AuctionType;
  onChange: (value: AuctionType) => void;
}

export function ShowTypeToggle({ value, onChange }: ShowTypeToggleProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/80">Show Type</label>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange('public')}
          className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
            value === 'public'
              ? 'bg-white/10 border-pink-500 text-white'
              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Public</span>
          </div>
          <p className="text-xs mt-1 text-white/50">Anyone can join and bid</p>
        </button>

        <button
          type="button"
          onClick={() => onChange('private')}
          className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
            value === 'private'
              ? 'bg-white/10 border-pink-500 text-white'
              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="font-medium">Private</span>
          </div>
          <p className="text-xs mt-1 text-white/50">Invite-only access</p>
        </button>
      </div>
    </div>
  );
}
