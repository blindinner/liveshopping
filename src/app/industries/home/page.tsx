import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/landing';

export const metadata: Metadata = {
  title: 'Live Shopping for Home & Decor | Livestream Furniture Sales',
  description:
    'Live shopping for home goods, furniture, and decor brands. Host room tours, styling sessions, and product demos. Convert viewers into buyers with in-stream checkout.',
  keywords: [
    'live shopping home',
    'home decor live shopping',
    'furniture livestream',
    'home goods live selling',
    'interior design live shopping',
    'home shoppable video',
    'furniture video commerce',
    'room styling live shopping',
  ],
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Live Shopping for Home & Decor',
  description: 'Live shopping platform for home goods, furniture, and decor brands. Host room tours, styling sessions, and demos with in-stream checkout.',
  about: {
    '@type': 'Thing',
    name: 'Home Decor Live Shopping',
    description: 'Live video commerce specifically designed for home brands, enabling real-time product demonstrations and instant checkout.',
  },
};

export default function HomeIndustryPage() {
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
              <p className="text-pink-500 text-sm font-semibold tracking-wide uppercase mb-4">Home & Decor</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                Live Shopping for Home Brands
              </h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Show products in real spaces. Style rooms live. Let viewers shop the look instantly.
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

        {/* Why Home */}
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Live Shopping Works for Home</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>
                Home products are inherently visual—but static photos don't capture scale, texture, or how
                pieces work together. Live shopping lets viewers see furniture in real rooms, understand true
                proportions, and get styling advice before buying.
              </p>
              <p>
                Home brands using live shopping report <strong>42% higher average order value</strong> through
                cross-selling coordinated pieces and <strong>55% lower return rates</strong> because customers
                understand exactly what they're getting.
              </p>
            </div>
          </div>
        </section>

        {/* Key Stats */}
        <section className="py-16 px-6 lg:px-8 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-pink-400 mb-2">42%</div>
                <div className="text-gray-400">Higher average order value</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-pink-400 mb-2">55%</div>
                <div className="text-gray-400">Lower return rate</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-pink-400 mb-2">3.5x</div>
                <div className="text-gray-400">More items per order</div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Home Live Shopping Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Room Tours',
                  description: 'Walk through styled rooms and spaces. Show how pieces work together in real environments.',
                },
                {
                  title: 'Styling Sessions',
                  description: 'Demonstrate how to style shelves, arrange furniture, or accessorize spaces. Sell coordinated looks.',
                },
                {
                  title: 'Scale Demonstrations',
                  description: 'Show true proportions by placing products next to common items. Help buyers visualize fit in their space.',
                },
                {
                  title: 'Material & Texture Close-ups',
                  description: 'Show fabric textures, wood grains, and finishes up close. Let viewers see quality in detail.',
                },
                {
                  title: 'New Collection Launches',
                  description: 'Debut seasonal collections with exclusive first access. Create urgency for limited pieces.',
                },
                {
                  title: 'DIY & Assembly',
                  description: 'Show how products are assembled or installed. Address common concerns about difficulty.',
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

        {/* Features for Home */}
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Features for Home Brands</h2>
            <div className="space-y-4">
              {[
                'Wide-angle video for room and space shots',
                'Feature multiple coordinated products on screen',
                'Show dimensions and specifications in-stream',
                'One-click add to cart without leaving the stream',
                'Live chat for styling advice and questions',
                'Automatic shoppable replays from every show',
                'Embed videos on collection pages',
                'Track which products and rooms drive sales',
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Home Live Shopping FAQ</h2>
            <div className="space-y-6">
              {[
                {
                  q: 'How do I show scale for furniture and large items?',
                  a: 'Place common objects nearby for reference—a phone, a book, or a person. Walk around pieces to show size. Always mention dimensions on screen.',
                },
                {
                  q: 'Do I need a showroom or staged space?',
                  a: 'Styled spaces help, but you can also show products in an office or warehouse with context. Many brands stream from their homes to show authentic styling.',
                },
                {
                  q: 'How do I handle high-ticket items?',
                  a: 'Live shopping actually works well for high-ticket items because it builds trust and answers questions that prevent purchase. Seeing quality up close justifies the investment.',
                },
                {
                  q: 'Can viewers buy sets or collections of items?',
                  a: 'Yes. You can feature individual products or curated bundles. Many home brands create "shop the room" collections for live shows.',
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Launch Home Live Shopping?</h2>
            <p className="text-lg text-gray-500 mb-8">
              See how live shopping can transform your home brand's e-commerce.
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
