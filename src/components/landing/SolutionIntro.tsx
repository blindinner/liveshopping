'use client';

import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import { CountUp } from '@/components/animation';

type Solution = 'live' | 'shoppable';

const solutions = {
  live: {
    title: 'Live Shopping',
    tagline: 'Turn Browsers Into Buyers. In Real Time.',
    description: 'Go live on your own website. Showcase products, answer questions, and let customers checkout without ever leaving the stream.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    video: '/solution-live-shopping.mp4',
    color: 'pink',
    stats: [
      { value: 6, suffix: 'x', label: 'higher conversion' },
      { value: 4, suffix: 'x', label: 'more time on site' },
      { value: 30, suffix: '%', label: 'lower returns' },
    ],
    features: [
      'Stream from browser or phone',
      'Real-time chat & polls',
      'One-tap checkout',
      'Instant product featuring',
    ],
  },
  shoppable: {
    title: 'Shoppable Videos',
    tagline: 'Every Video. Always Shoppable.',
    description: 'Tag products at any moment. Embed anywhere. Let viewers buy what they see without leaving the video.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    video: '/solution-shoppable-videos.mp4',
    color: 'gray',
    stats: [
      { value: 5, suffix: 'x', label: 'more engagement' },
      { value: 40, suffix: '%', label: 'higher add-to-cart' },
      { value: 2, suffix: 'x', label: 'longer time on page' },
    ],
    features: [
      'Tag products at any timestamp',
      'Embed on any page',
      'Import from Instagram/TikTok',
      'Works 24/7 automatically',
    ],
  },
};

export function SolutionIntro() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [active, setActive] = useState<Solution>('live');

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  const current = solutions[active];

  return (
    <section ref={ref} className="py-24 px-6 lg:px-8 bg-gray-50">
      <motion.div
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={containerVariants}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.p
            variants={fadeUp}
            className="text-pink-500 text-sm font-semibold tracking-widest uppercase mb-4"
          >
            How to Capitalize
          </motion.p>

          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            Two Powerful Ways to Sell With Video
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Choose your approach — or use both for maximum impact.
          </motion.p>
        </div>

        {/* Toggle Tabs */}
        <motion.div variants={fadeUp} className="flex justify-center mb-10">
          <div className="inline-flex bg-white rounded-full p-1.5 shadow-sm border border-gray-200">
            <button
              onClick={() => setActive('live')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                active === 'live'
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {solutions.live.icon}
              Live Shopping
            </button>
            <button
              onClick={() => setActive('shoppable')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                active === 'shoppable'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {solutions.shoppable.icon}
              Shoppable Videos
            </button>
          </div>
        </motion.div>

        {/* Content Panel */}
        <motion.div variants={fadeUp}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-3xl overflow-hidden min-h-[600px]"
            >
              {/* Background Video or Fallback */}
              {current.video ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src={current.video} type="video/mp4" />
                </video>
              ) : (
                <div className="absolute inset-0 bg-gray-900" />
              )}

              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/50" />

              {/* Content */}
              <div className="relative z-10 p-10 md:p-16 grid md:grid-cols-2 gap-10 md:gap-16 min-h-[600px] items-center">
                {/* Left - Info */}
                <div>
                  <h3 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                    {current.tagline}
                  </h3>
                  <p className="text-white/80 text-xl mb-10">
                    {current.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3">
                    {current.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-white">
                        <svg className="w-5 h-5 text-white/60 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right - Stats */}
                <div className="flex flex-col justify-center">
                  <div className="grid grid-cols-3 gap-4">
                    {current.stats.map((stat, i) => (
                      <div
                        key={i}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center"
                      >
                        <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                          {isInView && (
                            <CountUp value={stat.value} suffix={stat.suffix} duration={1.5} />
                          )}
                        </div>
                        <div className="text-white/70 text-xs sm:text-sm">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-white/60 text-sm text-center mt-6">
                    {active === 'live'
                      ? 'Results from brands using live shopping'
                      : 'Results from shoppable video campaigns'
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Bottom hint */}
        <motion.p
          variants={fadeUp}
          className="text-center text-gray-500 mt-8"
        >
          Scroll down to learn more about each, or{' '}
          <span className="text-pink-500 font-medium">use both together for 3x more revenue</span>
        </motion.p>
      </motion.div>
    </section>
  );
}
