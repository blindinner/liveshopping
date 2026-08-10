'use client';

import { useState } from 'react';

export function UseCases() {
  const [activeIndex, setActiveIndex] = useState(0);

  const useCases = [
    {
      industry: 'Fashion',
      description: 'Show how clothes fit, style outfits live, and let viewers shop the look instantly.',
      examples: ['Try-on streams', 'Styling sessions', 'New collection launches'],
      color: 'pink',
    },
    {
      industry: 'Beauty',
      description: 'Demo makeup techniques, show product swatches on camera, and answer skincare questions.',
      examples: ['Makeup tutorials', 'Skincare routines', 'Product comparisons'],
      color: 'purple',
    },
    {
      industry: 'Electronics',
      description: 'Unbox products, demonstrate features, and compare specs in real-time.',
      examples: ['Unboxing videos', 'Feature demos', 'Q&A sessions'],
      color: 'blue',
    },
    {
      industry: 'Home & Decor',
      description: 'Show products in real home settings, demonstrate functionality, and inspire buyers.',
      examples: ['Home tours', 'Product-in-use demos', 'Seasonal collections'],
      color: 'amber',
    },
    {
      industry: 'Food & Beverage',
      description: 'Cook live with your products, share recipes, and sell ingredients or equipment.',
      examples: ['Cooking shows', 'Recipe tutorials', 'Tasting events'],
      color: 'orange',
    },
    {
      industry: 'Fitness',
      description: 'Demo equipment, lead workout sessions, and sell gear viewers can use along.',
      examples: ['Workout streams', 'Equipment reviews', 'Training sessions'],
      color: 'green',
    },
  ];

  const activeCase = useCases[activeIndex];

  return (
    <section className="py-24 px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-pink-500 text-sm font-semibold tracking-wide uppercase mb-4">Use Cases</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-6">
            Live Shopping Works For Every Industry
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            From fashion to fitness, brands across industries are using live shopping to drive sales.
          </p>
        </div>

        {/* Industry Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {useCases.map((useCase, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeIndex === index
                  ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {useCase.industry}
            </button>
          ))}
        </div>

        {/* Active Content */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {activeCase.industry}
            </h3>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              {activeCase.description}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {activeCase.examples.map((example, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 text-sm bg-pink-50 text-pink-700 px-4 py-2 rounded-full"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {example}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
