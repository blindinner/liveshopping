'use client';

import { useState } from 'react';
import { usePollManagement } from '@/hooks/usePolls';
import type { Poll } from '@/types/database';

interface PollManagerProps {
  showId: string;
}

export function PollManager({ showId }: PollManagerProps) {
  const {
    polls,
    isLoading,
    createPoll,
    launchPoll,
    endPoll,
    deletePoll,
  } = usePollManagement(showId);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePoll = async () => {
    const validOptions = options.filter((opt) => opt.trim());
    if (!question.trim() || validOptions.length < 2) return;

    setIsCreating(true);
    try {
      await createPoll(question.trim(), validOptions);
      setQuestion('');
      setOptions(['', '']);
      setShowCreateForm(false);
    } finally {
      setIsCreating(false);
    }
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const getTotalVotes = (poll: Poll) => {
    return poll.options?.reduce((sum, opt) => sum + (opt.vote_count || 0), 0) || 0;
  };

  return (
    <section className="bg-white/5 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white">Live Polls</h2>
          <p className="text-white/50 text-xs mt-0.5">
            Engage viewers with real-time polls
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm rounded-lg transition-colors flex items-center gap-1.5"
        >
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          {showCreateForm ? 'Cancel' : 'Create Poll'}
        </button>
      </div>

      {/* Create Poll Form */}
      {showCreateForm && (
        <div className="mb-4 p-4 bg-black/20 rounded-xl border border-white/10">
          <div className="space-y-3">
            {/* Question */}
            <div>
              <label className="block text-white/70 text-xs mb-1">
                Question
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask your viewers something..."
                className="w-full bg-black/30 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500/50 placeholder:text-white/30 border border-white/10"
              />
            </div>

            {/* Options */}
            <div>
              <label className="block text-white/70 text-xs mb-1">
                Options
              </label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 bg-black/30 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500/50 placeholder:text-white/30 border border-white/10"
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => removeOption(index)}
                        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {options.length < 6 && (
                <button
                  onClick={addOption}
                  className="mt-2 text-purple-400 text-xs hover:text-purple-300 flex items-center gap-1"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add option
                </button>
              )}
            </div>

            {/* Create button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleCreatePoll}
                disabled={
                  !question.trim() ||
                  options.filter((opt) => opt.trim()).length < 2 ||
                  isCreating
                }
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Creating...
                  </>
                ) : (
                  'Create Poll'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Polls List */}
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full" />
        </div>
      ) : polls.length === 0 ? (
        <div className="text-center py-8 text-white/50">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-white/20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p>No polls yet</p>
          <p className="text-xs mt-1">Create a poll to engage your viewers</p>
        </div>
      ) : (
        <div className="space-y-2">
          {polls.map((poll) => {
            const isActive = poll.status === 'active';
            const isEnded = poll.status === 'ended';
            const totalVotes = getTotalVotes(poll);

            return (
              <div
                key={poll.id}
                className={`p-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-purple-500/20 border border-purple-500/30'
                    : 'bg-black/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium truncate">
                        {poll.question}
                      </p>
                      {isActive && (
                        <span className="shrink-0 px-1.5 py-0.5 bg-purple-500 text-white text-[10px] font-medium rounded animate-pulse">
                          LIVE
                        </span>
                      )}
                      {isEnded && (
                        <span className="shrink-0 px-1.5 py-0.5 bg-white/10 text-white/50 text-[10px] font-medium rounded">
                          ENDED
                        </span>
                      )}
                    </div>
                    <p className="text-white/50 text-xs mt-1">
                      {poll.options?.length || 0} options
                      {totalVotes > 0 && ` · ${totalVotes} votes`}
                    </p>

                    {/* Show results for active/ended polls */}
                    {(isActive || isEnded) && poll.options && (
                      <div className="mt-2 space-y-1">
                        {poll.options.map((option) => {
                          const percentage =
                            totalVotes > 0
                              ? Math.round(
                                  ((option.vote_count || 0) / totalVotes) * 100
                                )
                              : 0;
                          return (
                            <div key={option.id} className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-purple-500 transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-white/60 text-[10px] w-8 text-right">
                                {percentage}%
                              </span>
                              <span className="text-white/40 text-[10px] truncate max-w-20">
                                {option.option_text}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {poll.status === 'draft' && (
                      <>
                        <button
                          onClick={() => launchPoll(poll.id)}
                          className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          Launch
                        </button>
                        <button
                          onClick={() => deletePoll(poll.id)}
                          className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete poll"
                        >
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                    {isActive && (
                      <button
                        onClick={() => endPoll(poll.id)}
                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium rounded-lg transition-colors"
                      >
                        End Poll
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
