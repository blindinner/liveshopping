'use client';

import { useInView } from 'framer-motion';
import { useRef, useMemo } from 'react';

interface ScrollRevealOptions {
  threshold?: number;
  once?: boolean;
  delay?: number;
}

export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const { threshold = 0.3, once = true, delay = 0 } = options;
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });

  const variants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 40 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94] as const,
          delay,
        },
      },
    }),
    [delay]
  );

  return { ref, isInView, variants };
}
