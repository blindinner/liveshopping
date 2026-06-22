'use client';

import { useEffect, type ReactNode } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  side?: 'right' | 'bottom';
}

export function Drawer({
  isOpen,
  onClose,
  children,
  title,
  side = 'right',
}: DrawerProps) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sideStyles = {
    right: 'inset-y-0 end-0 w-full max-w-sm',
    bottom: 'inset-x-0 bottom-0 max-h-[80vh] rounded-t-2xl',
  };

  const slideAnimation = {
    right: isOpen
      ? 'translate-x-0'
      : 'translate-x-full rtl:-translate-x-full',
    bottom: isOpen ? 'translate-y-0' : 'translate-y-full',
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`
          absolute ${sideStyles[side]}
          bg-gray-900/95 backdrop-blur-lg
          transform transition-transform duration-300 ease-out
          ${slideAnimation[side]}
          flex flex-col
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
            >
              <svg
                className="w-5 h-5"
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
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
