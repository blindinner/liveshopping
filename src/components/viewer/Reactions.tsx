'use client';

import { useState } from 'react';

interface Reaction {
  id: string;
  emoji: string;
  x: number;
  y: number;
}

interface ReactionsProps {
  reactions: Reaction[];
  onReact: (emoji: string) => void;
}

const REACTION_EMOJIS = ['❤️', '🔥', '👏', '😍', '🎉'];

export function Reactions({ reactions, onReact }: ReactionsProps) {
  const [lastReactTime, setLastReactTime] = useState(0);

  const handleReact = (emoji: string) => {
    // Rate limit: one reaction per 300ms
    const now = Date.now();
    if (now - lastReactTime < 300) return;

    setLastReactTime(now);
    onReact(emoji);
  };

  return (
    <>
      {/* Floating reactions animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {reactions.map((reaction) => (
          <div
            key={reaction.id}
            className="absolute text-3xl animate-float-up"
            style={{
              left: `${reaction.x}%`,
              bottom: '20%',
            }}
          >
            {reaction.emoji}
          </div>
        ))}
      </div>

      {/* Reaction buttons */}
      <div className="absolute bottom-32 end-4 flex flex-col gap-2 z-20 pointer-events-auto">
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            className="w-12 h-12 flex items-center justify-center text-2xl bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 active:scale-90 transition-all"
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
}
