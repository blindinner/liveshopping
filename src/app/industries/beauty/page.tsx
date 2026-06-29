import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/landing';

export const metadata: Metadata = {
  title: 'Live Shopping for Beauty Brands | Livestream Cosmetics Sales',
  description:
    'Live shopping for beauty and cosmetics brands. Host makeup tutorials, skincare demos, and product launches. Convert viewers into buyers with in-stream checkout.',
  keywords: [
    'live shopping beauty',
    'beauty live shopping',
    'cosmetics livestream',
    'makeup live selling',
    'skincare live shopping',
    'beauty shoppable video',
    'cosmetics video commerce',
    'makeup tutorial shopping',
  ],
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Live Shopping for Beauty Brands',
  description: 'Live shopping platform for beauty and cosmetics brands. Host tutorials, demos, and launches with in-stream checkout.',
  about: {
    '@type': 'Thing',
    name: 'Beauty Live Shopping',
    description: 'Live video commerce specifically designed for beauty brands, enabling real-time product demonstrations and instant checkout.',
  },
};

export default function BeautyIndustryPage() {
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
              <p className="text-pink-500 text-sm font-semibold tracking-wide uppercase mb-4">Beauty & Cosmetics</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                Live Shopping for Beauty Brands
              </h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Show how products actually look. Teach application techniques. Let viewers buy what they see instantly.
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

        {/* Why Beauty */}
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Live Shopping Works for Beauty</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>
                Beauty is the #1 category for live shopping globally. Cosmetics and skincare products benefit
                enormously from live demonstration—viewers can see true colors on skin, watch application
                techniques, and get real-time advice on products for their skin type.
              </p>
              <p>
                Beauty brands using live shopping report <strong>conversion rates 8-12x higher</strong> than
                traditional e-commerce and <strong>customer lifetime value 60% higher</strong> because live
                builds trust and loyalty that static content cannot match.
              </p>
            </div>
          </div>
        </section>

        {/* Key Stats */}
        <section className="py-16 px-6 lg:px-8 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-pink-400 mb-2">12x</div>
                <div className="text-gray-400">Higher conversion rate</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-pink-400 mb-2">60%</div>
                <div className="text-gray-400">Higher customer LTV</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-pink-400 mb-2">85%</div>
                <div className="text-gray-400">Replay view rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Beauty Live Shopping Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Makeup Tutorials',
                  description: 'Show complete looks from start to finish. Viewers buy the exact products as they watch the application.',
                },
                {
                  title: 'Skincare Routines',
                  description: 'Demonstrate morning and evening routines. Explain ingredients, show textures, and answer skin type questions.',
                },
                {
                  title: 'Product Launches',
                  description: 'Debut new products with exclusive first access. Create buzz and capture early adopters.',
                },
                {
                  title: 'Shade Matching',
                  description: 'Help viewers find the right foundation, lipstick, or eyeshadow shade for their skin tone in real-time.',
                },
                {
                  title: 'Before & After',
                  description: 'Show real transformations and results. Build trust with authentic demonstrations.',
                },
                {
                  title: 'Expert Q&A',
                  description: 'Bring in makeup artists, dermatologists, or brand founders to answer viewer questions live.',
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

        {/* Features for Beauty */}
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Features for Beauty Brands</h2>
            <div className="space-y-4">
              {[
                'High-definition video that shows true product colors',
                'Feature multiple shades and variants on screen',
                'One-click add to cart without leaving the stream',
                'Live chat for skincare concerns and product questions',
                'Automatic shoppable replays from every tutorial',
                'Import content from Instagram and TikTok',
                'Embed shoppable videos on product pages',
                'Track which products and moments drive sales',
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Beauty Live Shopping FAQ</h2>
            <div className="space-y-6">
              {[
                {
                  q: 'Do I need professional lighting for beauty live shopping?',
                  a: 'Good lighting helps but doesn\'t need to be expensive. Ring lights work well. The key is consistent, even lighting that shows true product colors.',
                },
                {
                  q: 'How do I show shade differences on camera?',
                  a: 'Use swatches on arm or hand, show multiple shades side by side, and ensure your camera white balance is accurate. HD streaming helps viewers see subtle differences.',
                },
                {
                  q: 'Can customers ask about their specific skin concerns?',
                  a: 'Yes. Live chat lets viewers ask questions in real-time. Hosts can give personalized recommendations and suggest products based on individual concerns.',
                },
                {
                  q: 'What about skincare that requires time to show results?',
                  a: 'Share your own before/after results, customer testimonials, or explain the science. Consistency in showing your routine builds trust over time.',
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
                { name: 'Electronics', href: '/industries/electronics' },
                { name: 'Home', href: '/industries/home' },
                { name: 'Food', href: '/industries/food' },
                { name: 'Fitness', href: '/industries/fitness' },
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Launch Beauty Live Shopping?</h2>
            <p className="text-lg text-gray-500 mb-8">
              See how live shopping can transform your beauty brand's e-commerce.
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
