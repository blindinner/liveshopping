'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { CountUp } from '@/components/animation';

export function WhatIsShoppableVideo() {
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
      image: '/feature-tag-products.png',
      title: 'Tag Products Anywhere',
      description: 'Tag products at any moment in your videos. Viewers click to buy exactly when they see something they want.',
    },
    {
      image: '/feature-embed-anywhere.png',
      title: 'Embed on Any Page',
      description: 'Add shoppable videos to product pages, landing pages, or your homepage. One line of code.',
    },
    {
      image: '/feature-import-social.png',
      title: 'Import from Social',
      description: 'Turn your Instagram and TikTok content into shoppable videos on your own site.',
    },
  ];

  return (
    <section ref={ref} className="relative py-24 px-6 lg:px-8 bg-gray-900 overflow-hidden">
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
              Shoppable Videos
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight mb-6"
            >
              Every Video. Always Shoppable.
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="text-lg text-white leading-relaxed max-w-2xl mx-auto"
            >
              Tag products at any moment. Embed anywhere. Let viewers buy what they see
              without leaving the video. One click from inspiration to checkout.
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
                className="bg-gray-800 rounded-2xl overflow-hidden"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-700 p-4">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
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
              <div className="text-7xl sm:text-8xl lg:text-9xl font-bold text-white leading-none">
                <CountUp value={5} suffix="x" duration={1.5} />
              </div>
              <p className="text-sm sm:text-base text-gray-400 mt-2">
                More engagement than static images
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="text-center">
              <div className="text-7xl sm:text-8xl lg:text-9xl font-bold text-white leading-none">
                <CountUp value={40} suffix="%" duration={1.5} />
              </div>
              <p className="text-sm sm:text-base text-gray-400 mt-2">
                Higher add-to-cart rate
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="text-center">
              <div className="text-7xl sm:text-8xl lg:text-9xl font-bold text-white leading-none">
                <CountUp value={2} suffix="x" duration={1.5} />
              </div>
              <p className="text-sm sm:text-base text-gray-400 mt-2">
                Longer time on page
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
