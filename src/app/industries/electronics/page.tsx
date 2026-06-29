import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/landing';

export const metadata: Metadata = {
  title: 'Live Shopping for Electronics | Livestream Tech Product Sales',
  description:
    'Live shopping for electronics and tech brands. Host product demos, unboxings, and feature walkthroughs. Convert viewers into buyers with in-stream checkout.',
  keywords: [
    'live shopping electronics',
    'electronics live shopping',
    'tech livestream sales',
    'gadget live selling',
    'electronics shoppable video',
    'tech video commerce',
    'product demo live shopping',
    'unboxing live shopping',
  ],
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Live Shopping for Electronics',
  description: 'Live shopping platform for electronics and tech brands. Host demos, unboxings, and feature walkthroughs with in-stream checkout.',
  about: {
    '@type': 'Thing',
    name: 'Electronics Live Shopping',
    description: 'Live video commerce specifically designed for electronics brands, enabling real-time product demonstrations and instant checkout.',
  },
};

export default function ElectronicsIndustryPage() {
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
              <p className="text-pink-500 text-sm font-semibold tracking-wide uppercase mb-4">Electronics & Tech</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                Live Shopping for Electronics
              </h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Demonstrate features in action. Answer technical questions live. Let viewers buy with confidence.
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

        {/* Why Electronics */}
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Live Shopping Works for Electronics</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>
                Electronics purchases often require research and comparison. Live shopping addresses the biggest
                barrier—uncertainty about how products actually work. Real-time demos let viewers see features
                in action and get technical questions answered immediately.
              </p>
              <p>
                Electronics brands using live shopping report <strong>47% higher average order value</strong> and
                <strong> 65% lower return rates</strong> because customers understand exactly what they're
                buying before purchase.
              </p>
            </div>
          </div>
        </section>

        {/* Key Stats */}
        <section className="py-16 px-6 lg:px-8 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-pink-400 mb-2">47%</div>
                <div className="text-gray-400">Higher average order value</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-pink-400 mb-2">65%</div>
                <div className="text-gray-400">Lower return rate</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-pink-400 mb-2">8x</div>
                <div className="text-gray-400">More engagement than static</div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Electronics Live Shopping Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Product Unboxings',
                  description: 'Open products on camera. Show what\'s in the box, first impressions, and initial setup process.',
                },
                {
                  title: 'Feature Demos',
                  description: 'Walk through key features, settings, and use cases. Show how products work in real-world scenarios.',
                },
                {
                  title: 'Comparison Shows',
                  description: 'Compare different models or generations side by side. Help viewers choose the right option for their needs.',
                },
                {
                  title: 'Setup Tutorials',
                  description: 'Guide viewers through installation and configuration. Answer technical questions in real-time.',
                },
                {
                  title: 'Product Launches',
                  description: 'Debut new products with exclusive first access. Generate excitement and early sales.',
                },
                {
                  title: 'Q&A Sessions',
                  description: 'Answer technical questions from potential buyers. Address concerns that prevent purchases.',
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

        {/* Features for Electronics */}
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Features for Electronics Brands</h2>
            <div className="space-y-4">
              {[
                'HD video quality for detailed product visuals',
                'Screen sharing for software and interface demos',
                'Show product specs and comparisons on screen',
                'One-click add to cart without leaving the stream',
                'Live chat for technical questions',
                'Automatic shoppable replays from every demo',
                'Embed videos on product detail pages',
                'Track which features and demos drive conversions',
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Electronics Live Shopping FAQ</h2>
            <div className="space-y-6">
              {[
                {
                  q: 'How do I demonstrate software features during a live show?',
                  a: 'Use screen sharing to show interfaces, apps, and software features. Switch between camera view and screen share as needed during the demo.',
                },
                {
                  q: 'What if I can\'t answer a technical question live?',
                  a: 'It\'s okay to say you\'ll follow up. Capture the question, provide a thoughtful answer after the show, and build trust through honesty.',
                },
                {
                  q: 'Do product demos increase or decrease returns?',
                  a: 'They decrease returns significantly—65% on average. When customers see exactly how a product works before buying, they\'re much less likely to be disappointed.',
                },
                {
                  q: 'Should I compare competitor products?',
                  a: 'You can, but focus on objective differences rather than criticism. Showing your product\'s strengths through honest comparison builds credibility.',
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Launch Electronics Live Shopping?</h2>
            <p className="text-lg text-gray-500 mb-8">
              See how live shopping can transform your electronics brand's e-commerce.
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
