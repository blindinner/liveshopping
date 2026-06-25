'use client';

import { useState, useEffect } from 'react';
import type { PollWithResults } from '@/types/database';

interface PollCardProps {
  poll: PollWithResults;
  hasVoted: boolean;
  onVote: (optionId: string) => Promise<void>;
  onClose: () => void;
  locale: 'he' | 'en';
}

export function PollCard({ poll, hasVoted, onVote, onClose, locale }: PollCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const isRTL = locale === 'he';

  // Auto-close after voting (with a short delay to show the result)
  useEffect(() => {
    if (hasVoted && selectedOption) {
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hasVoted, selectedOption, onClose]);

  const t = {
    he: {
      poll: 'סקר',
      votes: 'הצבעות',
      voted: 'הצבעת',
    },
    en: {
      poll: 'Poll',
      votes: 'votes',
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Poll card */}
      <div
        className="relative w-full max-w-sm bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header with close button */}
        <div className="px-4 py-3 bg-purple-500/10 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span className="text-purple-400 text-sm font-medium uppercase tracking-wide">
              {t.poll}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {poll.total_votes > 0 && (
              <span className="text-white/50 text-sm">
                {poll.total_votes} {t.votes}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Question */}
        <div className="px-4 py-4">
          <h3 className="text-white font-semibold text-base leading-snug">
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
                    ? 'ring-2 ring-purple-500'
                    : 'ring-1 ring-white/20'
                }`}
              >
                {/* Background bar for results */}
                {showResults && (
                  <div
                    className={`absolute inset-0 transition-all duration-500 ${
                      isWinning ? 'bg-purple-500/30' : 'bg-white/10'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                )}

                {/* Content */}
                <div className="relative px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Selection indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-white/40'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-white"
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

                    <span className="text-white text-sm font-medium truncate">
                      {option.option_text}
                    </span>
                  </div>

                  {/* Percentage */}
                  {showResults && (
                    <span
                      className={`text-sm font-bold shrink-0 ${
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
          <div className="px-4 py-3 bg-purple-500/10 border-t border-white/5">
            <div className="flex items-center justify-center gap-2 text-purple-400 text-sm font-medium">
              <svg
                className="w-4 h-4"
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
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}

// Poll button for the top bar
interface PollButtonProps {
  poll: PollWithResults;
  hasVoted: boolean;
  onClick: () => void;
  locale: 'he' | 'en';
}

export function PollButton({ poll, hasVoted, onClick, locale }: PollButtonProps) {
  const getPercentage = (voteCount: number) => {
    if (poll.total_votes === 0) return 0;
    return Math.round((voteCount / poll.total_votes) * 100);
  };

  // Get top 2 options by vote count
  const getTopResults = () => {
    const sorted = [...poll.options].sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
    return sorted.slice(0, 2).map(opt => getPercentage(opt.vote_count || 0));
  };

  const topResults = getTopResults();
  const t = locale === 'he' ? 'סקר' : 'Poll';

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 backdrop-blur-sm rounded-lg transition-colors"
    >
      {/* Poll icon */}
      <svg
        className="w-3.5 h-3.5 text-purple-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>

      {/* Results or label */}
      {poll.total_votes > 0 ? (
        <span className="text-white text-xs font-medium">
          {topResults[0]}%
        </span>
      ) : (
        <span className="text-purple-300 text-xs font-medium">
          {t}
        </span>
      )}

      {/* Indicator */}
      {hasVoted ? (
        <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
      )}
    </button>
  );
}
