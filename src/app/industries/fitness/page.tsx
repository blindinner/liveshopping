import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/landing';

export const metadata: Metadata = {
  title: 'Live Shopping for Fitness Brands | Livestream Sports Sales',
  description:
    'Live shopping for fitness, sports, and wellness brands. Host workout demos, gear reviews, and product launches. Convert viewers into buyers with in-stream checkout.',
  keywords: [
    'live shopping fitness',
    'fitness live shopping',
    'sports livestream sales',
    'gym equipment live selling',
    'wellness live shopping',
    'fitness shoppable video',
    'sports video commerce',
    'workout demo live shopping',
  ],
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Live Shopping for Fitness Brands',
  description: 'Live shopping platform for fitness, sports, and wellness brands. Host workout demos, gear reviews, and launches with in-stream checkout.',
  about: {
    '@type': 'Thing',
    name: 'Fitness Live Shopping',
    description: 'Live video commerce specifically designed for fitness brands, enabling real-time product demonstrations and instant checkout.',
  },
};

export default function FitnessIndustryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-white">
        <Header />

        {/* Hero */}
        <section className="pt-32 pb-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-pink-500 text-sm font-semibold tracking-wide uppercase mb-4">Fitness & Sports</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                Live Shopping for Fitness Brands
              </h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Demo equipment in action. Lead workouts with your gear. Let viewers buy while they're motivated.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/#demo"
                className="inline-flex items-center gap-2 bg-pink-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-pink-600 transition-all"
              >
                Book a Demo
              </a>
            </div>
          </div>
        </section>

        {/* Why Fitness */}
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Live Shopping Works for Fitness</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>
                Fitness purchases are driven by aspiration and motivation. Live shopping captures viewers at
                their most inspired moment—during or right after watching a workout. When they see equipment
                and apparel in action, the desire to buy is immediate.
              </p>
              <p>
                Fitness brands using live shopping report <strong>conversion rates 6x higher</strong> than
                standard e-commerce and <strong>customer retention 45% higher</strong> because live workout
                communities create ongoing engagement and loyalty.
              </p>
            </div>
          </div>
        </section>

        {/* Key Stats */}
        <section className="py-16 px-6 lg:px-8 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-pink-400 mb-2">6x</div>
                <div className="text-gray-400">Higher conversion rate</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-pink-400 mb-2">45%</div>
                <div className="text-gray-400">Higher customer retention</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-pink-400 mb-2">68%</div>
                <div className="text-gray-400">Join follow-up sessions</div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Fitness Live Shopping Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Live Workouts',
                  description: 'Lead workout sessions using your equipment. Viewers can buy what they use during the class.',
                },
                {
                  title: 'Equipment Demos',
                  description: 'Show how equipment works, proper form, and different exercises possible with each piece.',
                },
                {
                  title: 'Apparel in Action',
                  description: 'Wear your apparel during workouts. Show how it performs—stretch, breathability, fit during movement.',
                },
                {
                  title: 'Nutrition & Supplements',
                  description: 'Discuss pre and post-workout nutrition. Demo smoothie recipes with your products.',
                },
                {
                  title: 'Gear Reviews',
                  description: 'Review and compare different products. Help customers choose the right equipment for their goals.',
                },
                {
                  title: 'Challenge Programs',
                  description: 'Launch fitness challenges with required equipment or apparel. Create urgency and community.',
                },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features for Fitness */}
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Features for Fitness Brands</h2>
            <div className="space-y-4">
              {[
                'HD video for movement and form demonstration',
                'Feature equipment, apparel, and supplements together',
                'Show product specs and sizing information',
                'One-click add to cart without leaving the workout',
                'Live chat for fitness questions and recommendations',
                'Automatic shoppable replays from every session',
                'Embed videos on product and program pages',
                'Track which workouts and products drive sales',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-pink-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Fitness Live Shopping FAQ</h2>
            <div className="space-y-6">
              {[
                {
                  q: 'How do I stream a workout while demonstrating products?',
                  a: 'Set up a wide-angle camera, use a headset mic for clear audio, and feature products before and during the workout. Viewers can shop without you pausing.',
                },
                {
                  q: 'Can viewers buy while I\'m in the middle of leading a workout?',
                  a: 'Yes. Products are featured on screen and viewers can add to cart anytime without interrupting the stream. You don\'t need to stop and sell.',
                },
                {
                  q: 'What about different fitness levels?',
                  a: 'Live chat lets you offer modifications in real-time. You can also feature different equipment for different skill levels.',
                },
                {
                  q: 'Do I need a full gym setup?',
                  a: 'No. Many fitness brands stream from home gyms, parks, or minimal setups. Authenticity often resonates more than production value.',
                },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.q}</h3>
                  <p className="text-gray-600">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Other Industries */}
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore Other Industries</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { name: 'Fashion', href: '/industries/fashion' },
                { name: 'Beauty', href: '/industries/beauty' },
                { name: 'Electronics', href: '/industries/electronics' },
                { name: 'Home', href: '/industries/home' },
                { name: 'Food', href: '/industries/food' },
              ].map((industry) => (
                <Link
                  key={industry.name}
                  href={industry.href}
                  className="px-4 py-2 bg-white rounded-full text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors shadow-sm"
                >
                  {industry.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Launch Fitness Live Shopping?</h2>
            <p className="text-lg text-gray-500 mb-8">
              See how live shopping can transform your fitness brand's e-commerce.
            </p>
            <a
              href="/#demo"
              className="inline-flex items-center gap-2 bg-pink-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-pink-600 transition-all"
            >
              Book a Demo
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
