'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { CountUp } from '@/components/animation';

export function ProductsBridge() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <section
      ref={ref}
      className="relative py-24 px-6 lg:px-8 bg-white overflow-hidden"
    >
      <motion.div
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        variants={staggerContainer}
        className="max-w-6xl mx-auto relative z-10"
      >
        {/* Section Header */}
        <motion.div variants={fadeUp} className="text-center mb-16">
          <p className="text-pink-500 text-sm font-semibold tracking-widest uppercase mb-4">
            When you use both
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-12">
            The Complete Strategy
          </h2>
          <div className="text-8xl sm:text-9xl lg:text-[12rem] font-bold text-gray-900 leading-none mb-6">
            <CountUp value={3} suffix="x" duration={2} />
          </div>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-pink-500">
            more revenue
          </p>
        </motion.div>

        {/* Supporting text */}
        <motion.div variants={fadeUp} className="text-center mb-20">
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Live events create moments of urgency. Shoppable videos capture every visitor in between.
            Together, you have content that converts running 24/7 on your website.
          </p>
          <p className="text-xl sm:text-2xl text-gray-900 font-semibold mt-6">
            Cover every moment. Miss no sale.
          </p>
        </motion.div>

        {/* Two columns - Side by side explanation */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Live Shopping Column */}
          <motion.div variants={fadeUp} className="bg-gray-50 rounded-3xl p-8 lg:p-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Live Shopping
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Schedule live events that your audience plans for. Create urgency and excitement that drives immediate purchases. Answer questions in real-time, build trust, and convert browsers into buyers on the spot.
            </p>
          </motion.div>

          {/* Shoppable Videos Column */}
          <motion.div variants={fadeUp} className="bg-gray-50 rounded-3xl p-8 lg:p-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Shoppable Videos
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Your videos work around the clock, even while you sleep. Every visitor who lands on your site can shop directly from engaging video content. No more passive browsing — every view is an opportunity to convert.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
