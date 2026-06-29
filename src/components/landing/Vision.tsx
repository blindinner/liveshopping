'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { CountUp } from '@/components/animation';

export function Vision() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  const stats = [
    { value: 85, suffix: '%', label: 'of consumers want more video from brands' },
    { value: 10, suffix: 'x', label: 'higher conversion vs static pages' },
    { value: 70, suffix: '%', label: 'of purchase decisions influenced by video' },
  ];

  return (
    <section
      ref={ref}
      className="relative min-h-screen bg-gray-950 overflow-hidden flex items-center"
    >
      {/* Animated gradient background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"
      />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Gradient orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 0.3, scale: 1 } : { opacity: 0, scale: 0.5 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 md:py-32">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={containerVariants}
          className="text-center"
        >
          {/* Section label */}
          <motion.p
            variants={fadeUp}
            className="text-pink-400 text-sm font-semibold tracking-widest uppercase mb-6"
          >
            The Future of Commerce
          </motion.p>

          {/* Main headline */}
          <motion.h2
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Video is the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-500">
              New Storefront
            </span>
          </motion.h2>

          {/* Supporting copy */}
          <motion.p
            variants={fadeUp}
            className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-16 leading-relaxed"
          >
            E-commerce started with catalogs. Then came product pages.
            Now? The brands winning are the ones selling through video.
          </motion.p>

          {/* The big stat - market size */}
          <motion.div variants={scaleIn} className="mb-20">
            <div className="text-6xl sm:text-8xl lg:text-9xl font-bold text-white mb-4">
              <CountUp value={500} prefix="$" suffix="B+" duration={2.5} />
            </div>
            <div className="text-lg sm:text-xl text-gray-400">
              Video commerce market by 2027
            </div>
          </motion.div>

          {/* Three pillars of opportunity */}
          <motion.div
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="text-4xl sm:text-5xl font-bold text-pink-400 mb-3">
                  <CountUp
                    value={stat.value}
                    suffix={stat.suffix}
                    duration={2}
                  />
                </div>
                <div className="text-gray-400 text-sm sm:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-950 to-transparent" />
    </section>
  );
}
