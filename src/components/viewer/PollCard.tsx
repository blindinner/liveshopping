'use client';

import { useState } from 'react';
import type { PollWithResults } from '@/types/database';

// Poll button for the top bar (shows when poll is collapsed)
interface PollButtonProps {
  poll: PollWithResults;
  hasVoted: boolean;
  onClick: () => void;
  locale: 'he' | 'en';
}

export function PollButton({ poll, hasVoted, onClick, locale }: PollButtonProps) {
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

      {/* Label */}
      <span className="text-purple-300 text-xs font-medium">
        {t}
      </span>

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

// Full-screen poll view (video shrinks to PiP, poll takes over)
interface PollViewProps {
  poll: PollWithResults;
  hasVoted: boolean;
  onVote: (optionId: string) => Promise<void>;
  onCollapse: () => void;
  locale: 'he' | 'en';
  videoElement?: React.ReactNode; // The mini video PiP
}

export function PollView({ poll, hasVoted, onVote, onCollapse, locale, videoElement }: PollViewProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [justVoted, setJustVoted] = useState(false);
  const isRTL = locale === 'he';

  const t = {
    he: {
      poll: 'סקר',
      votes: 'הצבעות',
      voted: 'תודה!',
      done: 'סיום',
    },
    en: {
      poll: 'Poll',
      votes: 'votes',
      voted: 'Thanks!',
      done: 'Done',
    },
  }[locale];

  const handleVote = async (optionId: string) => {
    if (hasVoted || isVoting) return;
    setSelectedOption(optionId);
    setIsVoting(true);
    try {
      await onVote(optionId);
      setJustVoted(true);
      // Auto-close after 2 seconds
      setTimeout(() => {
        onCollapse();
      }, 2000);
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
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-purple-950/90 via-black/95 to-black"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Mini video PiP at top */}
      <div className="flex justify-center pt-4 pb-6">
        <div className="relative w-40 h-56 rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 ring-1 ring-white/10">
          {videoElement}
          {/* Live indicator on mini video */}
          <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-red-500 rounded">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-white text-[10px] font-bold">LIVE</span>
          </div>
        </div>
      </div>

      {/* Poll content */}
      <div className="flex-1 flex flex-col px-6 pb-8">
        {/* Poll indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button className="p-2 text-white/30">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-white/60 text-sm">{t.poll}</span>
          <button className="p-2 text-white/30">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Question */}
        <h2 className="text-white text-2xl font-semibold text-center mb-8 leading-tight">
          {poll.question}
        </h2>

        {/* Options */}
        <div className="space-y-3 flex-1">
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
                    : ''
                }`}
              >
                {/* Background */}
                <div className={`absolute inset-0 ${isSelected ? 'bg-purple-500/30' : 'bg-white/10'}`} />

                {/* Results bar */}
                {showResults && (
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                      isWinning ? 'bg-purple-500/40' : 'bg-white/10'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                )}

                {/* Content */}
                <div className="relative px-5 py-4 flex items-center justify-between">
                  <span className="text-white text-base font-medium">
                    {option.option_text}
                  </span>

                  {showResults && (
                    <span className={`text-base font-bold ${isWinning ? 'text-purple-400' : 'text-white/60'}`}>
                      {percentage}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Vote count */}
        {poll.total_votes > 0 && (
          <p className="text-center text-white/40 text-sm mt-4">
            {poll.total_votes} {t.votes}
          </p>
        )}

        {/* After voting: show thanks message and Done button */}
        {(hasVoted || justVoted) && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-2 text-purple-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-base font-medium">{t.voted}</span>
            </div>
            <button
              onClick={onCollapse}
              className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-full transition-colors"
            >
              {t.done}
            </button>
          </div>
        )}
      </div>

      {/* Collapse chevron (only show when not voted) */}
      {!hasVoted && !justVoted && (
        <button
          onClick={onCollapse}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 p-3 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}

      {/* Loading overlay */}
      {isVoting && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
}

// Legacy modal PollCard (keeping for backward compatibility)
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

  const showResults = hasVoted || poll.show_results_live;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="px-4 py-3 bg-purple-500/10 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-purple-400 text-sm font-medium uppercase tracking-wide">{t.poll}</span>
          </div>
          <div className="flex items-center gap-3">
            {poll.total_votes > 0 && (
              <span className="text-white/50 text-sm">{poll.total_votes} {t.votes}</span>
            )}
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-4 py-4">
          <h3 className="text-white font-semibold text-base leading-snug">{poll.question}</h3>
        </div>

        <div className="px-4 pb-4 space-y-2">
          {poll.options.map((option) => {
            const percentage = getPercentage(option.vote_count || 0);
            const isSelected = poll.viewer_vote === option.id || selectedOption === option.id;
            const isWinning = showResults && poll.total_votes > 0 && option.vote_count === Math.max(...poll.options.map((o) => o.vote_count || 0));

            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={hasVoted || isVoting}
                className={`w-full relative overflow-hidden rounded-xl transition-all ${hasVoted || isVoting ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'} ${isSelected ? 'ring-2 ring-purple-500' : 'ring-1 ring-white/20'}`}
              >
                {showResults && (
                  <div className={`absolute inset-0 transition-all duration-500 ${isWinning ? 'bg-purple-500/30' : 'bg-white/10'}`} style={{ width: `${percentage}%` }} />
                )}
                <div className="relative px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-purple-500 bg-purple-500' : 'border-white/40'}`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-white text-sm font-medium truncate">{option.option_text}</span>
                  </div>
                  {showResults && (
                    <span className={`text-sm font-bold shrink-0 ${isWinning ? 'text-purple-400' : 'text-white/60'}`}>{percentage}%</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {hasVoted && (
          <div className="px-4 py-3 bg-purple-500/10 border-t border-white/5">
            <div className="flex items-center justify-center gap-2 text-purple-400 text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t.voted}</span>
            </div>
          </div>
        )}

        {isVoting && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
