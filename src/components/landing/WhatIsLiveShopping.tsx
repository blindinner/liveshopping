'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { CountUp } from '@/components/animation';

export function WhatIsLiveShopping() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
    },
  };

  const features = [
    {
      image: '/feature-stream-anywhere.png',
      title: 'Stream From Anywhere',
      description: 'Go live from your browser or phone. No apps, no downloads, no complicated setup.',
    },
    {
      image: '/feature-checkout.png',
      title: 'Live Chat & Polls',
      description: 'Engage viewers with real-time chat, polls, and reactions. Build community while you sell.',
    },
    {
      image: '/feature-in-stream-checkout.png',
      title: 'In-Stream Checkout',
      description: 'Feature products at the perfect moment. One tap to add to cart. Zero friction.',
    },
  ];

  return (
    <section ref={ref} className="relative py-24 px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {/* Section Header */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.h2
              variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-pink-500 tracking-tight mb-4"
            >
              Live Shopping
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 tracking-tight mb-6"
            >
              Turn Browsers Into Buyers. In Real Time.
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto"
            >
              Go live on your own website. Showcase products, answer questions, and let customers
              checkout without ever leaving the stream. Your brand. Your data. Your revenue.
            </motion.p>
          </div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            className="grid sm:grid-cols-3 gap-6 mb-24"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Large Stats as Divider */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-3 gap-4 md:gap-8"
          >
            <motion.div variants={fadeUp} className="text-center">
              <div className="text-7xl sm:text-8xl lg:text-9xl font-bold text-gray-900 leading-none">
                <CountUp value={6} suffix="x" duration={1.5} />
              </div>
              <p className="text-sm sm:text-base text-gray-500 mt-2">
                Higher conversion during live shows
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="text-center">
              <div className="text-7xl sm:text-8xl lg:text-9xl font-bold text-gray-900 leading-none">
                <CountUp value={4} suffix="x" duration={1.5} />
              </div>
              <p className="text-sm sm:text-base text-gray-500 mt-2">
                More time spent on your site
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="text-center">
              <div className="text-7xl sm:text-8xl lg:text-9xl font-bold text-gray-900 leading-none">
                <CountUp value={30} suffix="%" duration={1.5} />
              </div>
              <p className="text-sm sm:text-base text-gray-500 mt-2">
                Lower return rates
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
