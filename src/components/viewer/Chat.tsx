'use client';

import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/types/database';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  viewerName: string | null;
  onRequestName: () => void;
  locale: 'he' | 'en';
}

export function Chat({
  messages,
  onSendMessage,
  viewerName,
  onRequestName,
  locale,
}: ChatProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isRTL = locale === 'he';

  const t = {
    he: {
      placeholder: 'כתוב הודעה...',
      send: 'שלח',
    },
    en: {
      placeholder: 'Write a message...',
      send: 'Send',
    },
  }[locale];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (!viewerName) {
      onRequestName();
      return;
    }

    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  return (
    <div
      className="flex flex-col"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Messages list - compact, above the input */}
      <div className="overflow-y-auto space-y-1 px-4 py-2 max-h-[120px] bg-gradient-to-t from-black/60 to-transparent">
        {messages.slice(-50).map((msg) => (
          <div
            key={msg.id}
            className="flex items-start gap-2 animate-fade-in"
          >
            <span className="text-pink-400 font-semibold text-sm shrink-0">
              {msg.viewer_name}
            </span>
            <span className="text-white text-sm break-words">
              {msg.message}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 p-4 bg-black/80 backdrop-blur-sm"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t.placeholder}
          maxLength={500}
          className="flex-1 bg-white/20 backdrop-blur-sm text-white placeholder-white/60 px-4 py-3 rounded-full border border-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <button
          type="submit"
          disabled={!inputValue.trim()}
          className="p-2 bg-pink-500 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-pink-600 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}
