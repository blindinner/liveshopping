'use client';

import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';

interface TextRevealProps {
  text: string;
  className?: string;
  wordClassName?: string;
  staggerDelay?: number;
}

export function TextReveal({
  text,
  className,
  wordClassName,
  staggerDelay = 0.08,
}: TextRevealProps) {
  const { ref, isInView } = useScrollReveal();
  const words = text.split(' ');

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: staggerDelay },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, damping: 20, stiffness: 100 },
    },
  };

  return (
    <motion.span
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={wordVariants}
          className={`inline-block ${wordClassName || ''}`}
          style={{ marginRight: '0.25em' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}
