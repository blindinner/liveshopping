'use client';

interface BadgeProps {
  variant?: 'live' | 'scheduled' | 'ended' | 'default';
  children: React.ReactNode;
  pulse?: boolean;
}

export function Badge({ variant = 'default', children, pulse = false }: BadgeProps) {
  const variants = {
    live: 'bg-red-500 text-white',
    scheduled: 'bg-yellow-500 text-black',
    ended: 'bg-gray-500 text-white',
    default: 'bg-white/20 text-white',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase
        ${variants[variant]}
      `}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
