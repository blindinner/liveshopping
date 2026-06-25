'use client';

import { useState } from 'react';
import type { PollWithResults } from '@/types/database';

interface PollCardProps {
  poll: PollWithResults;
  hasVoted: boolean;
  onVote: (optionId: string) => Promise<void>;
  locale: 'he' | 'en';
  inline?: boolean; // When true, no absolute positioning - used for stacking layouts
}

export function PollCard({ poll, hasVoted, onVote, locale, inline = false }: PollCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const isRTL = locale === 'he';

  const t = {
    he: {
      poll: 'סקר',
      votes: 'הצבעות',
      vote: 'הצבע',
      voted: 'הצבעת',
    },
    en: {
      poll: 'Poll',
      votes: 'votes',
      vote: 'Vote',
      voted: 'Voted',
    },
  }[locale];

  const handleVote = async (optionId: string) => {
    if (hasVoted || isVoting) return;
    setSelectedOption(optionId);
    setIsVoting(true);
    try {
      await onVote(optionId);
    } finally {
      setIsVoting(false);
    }
  };

  const getPercentage = (voteCount: number) => {
    if (poll.total_votes === 0) return 0;
    return Math.round((voteCount / poll.total_votes) * 100);
  };

  // Show results if voted or if poll is set to show live results
  const showResults = hasVoted || poll.show_results_live;

  return (
    <div
      className={inline
        ? "pointer-events-auto"
        : "absolute bottom-32 left-3 right-3 z-40 pointer-events-auto"
      }
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="px-4 py-2.5 bg-purple-500/10 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span className="text-purple-400 text-xs font-medium uppercase tracking-wide">
              {t.poll}
            </span>
          </div>
          {poll.total_votes > 0 && (
            <span className="text-white/50 text-xs">
              {poll.total_votes} {t.votes}
            </span>
          )}
        </div>

        {/* Question */}
        <div className="px-4 py-3">
          <h3 className="text-white font-medium text-sm leading-snug">
            {poll.question}
          </h3>
        </div>

        {/* Options */}
        <div className="px-4 pb-4 space-y-2">
          {poll.options.map((option) => {
            const percentage = getPercentage(option.vote_count || 0);
            const isSelected = poll.viewer_vote === option.id || selectedOption === option.id;
            const isWinning =
              showResults &&
              poll.total_votes > 0 &&
              option.vote_count === Math.max(...poll.options.map((o) => o.vote_count || 0));

            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={hasVoted || isVoting}
                className={`w-full relative overflow-hidden rounded-xl transition-all ${
                  hasVoted || isVoting
                    ? 'cursor-default'
                    : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                } ${
                  isSelected
                    ? 'ring-2 ring-purple-500/70'
                    : 'ring-1 ring-white/10'
                }`}
              >
                {/* Background bar for results */}
                {showResults && (
                  <div
                    className={`absolute inset-0 transition-all duration-500 ${
                      isWinning ? 'bg-purple-500/20' : 'bg-white/5'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                )}

                {/* Content */}
                <div className="relative px-3 py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Selection indicator */}
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-white/40'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>

                    <span className="text-white text-sm truncate">
                      {option.option_text}
                    </span>
                  </div>

                  {/* Percentage */}
                  {showResults && (
                    <span
                      className={`text-sm font-medium shrink-0 ${
                        isWinning ? 'text-purple-400' : 'text-white/60'
                      }`}
                    >
                      {percentage}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer - voting status */}
        {hasVoted && (
          <div className="px-4 py-2 bg-purple-500/5 border-t border-white/5">
            <div className="flex items-center justify-center gap-1.5 text-purple-400 text-xs">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{t.voted}</span>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isVoting && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
