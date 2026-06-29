'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { CountUp } from '@/components/animation';

export function Hero() {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });

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
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  const stats = [
    { value: 85, suffix: '%', label: 'of consumers want more video from brands' },
    { value: 10, suffix: 'x', label: 'higher conversion vs static pages' },
    { value: 70, suffix: '%', label: 'of purchase decisions influenced by video' },
  ];

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-demo.mp4" type="video/mp4" />
      </video>

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Main Hero Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 lg:px-8 pt-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Section label */}
          <motion.p
            variants={fadeUp}
            className="text-pink-400 text-sm font-semibold tracking-widest uppercase mb-6"
          >
            The Future of Commerce
          </motion.p>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
          >
            Video is the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-500">
              New Storefront
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            E-commerce started with catalogs. Then came product pages.
            Now? The brands winning are the ones selling through video.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <motion.a
              href="#demo"
              variants={scaleIn}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-pink-500 text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-pink-600 transition-colors shadow-xl shadow-pink-500/20"
            >
              Book a Demo
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.a>
            <Link
              href="/shows"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white px-8 py-4 rounded-full text-base font-medium transition-colors"
            >
              See it Live
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Stats Section - Bottom of Hero */}
      <motion.div
        ref={statsRef}
        initial="hidden"
        animate={statsInView ? 'visible' : 'hidden'}
        variants={containerVariants}
        className="relative z-10 pb-16 px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                className="text-center p-4 md:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-pink-400 mb-2">
                  <CountUp value={stat.value} suffix={stat.suffix} duration={2} />
                </div>
                <div className="text-white text-xs sm:text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
