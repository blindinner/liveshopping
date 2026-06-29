'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface EquationRevealProps {
  left: ReactNode;
  right: ReactNode;
  result: ReactNode;
  className?: string;
  itemClassName?: string;
}

export function EquationReveal({
  left,
  right,
  result,
  className,
  itemClassName,
}: EquationRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.4,
        delayChildren: 0.2,
      },
    },
  };

  const leftVariants = {
    hidden: { opacity: 0, x: -100, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { type: 'spring' as const, damping: 15, stiffness: 80 },
    },
  };

  const rightVariants = {
    hidden: { opacity: 0, x: 100, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { type: 'spring' as const, damping: 15, stiffness: 80 },
    },
  };

  const symbolVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring' as const, damping: 10, stiffness: 200 },
    },
  };

  const resultVariants = {
    hidden: { opacity: 0, scale: 0.7, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        damping: 8,
        stiffness: 60,
        delay: 0.2,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      <motion.div variants={leftVariants} className={itemClassName}>
        {left}
      </motion.div>
      <motion.div
        variants={symbolVariants}
        className="text-4xl md:text-5xl font-bold text-white"
      >
        +
      </motion.div>
      <motion.div variants={rightVariants} className={itemClassName}>
        {right}
      </motion.div>
      <motion.div
        variants={symbolVariants}
        className="text-4xl md:text-5xl font-bold text-white"
      >
        =
      </motion.div>
      <motion.div variants={resultVariants} className={itemClassName}>
        {result}
      </motion.div>
    </motion.div>
  );
}
