import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/landing';

export const metadata: Metadata = {
  title: 'Live Shopping for Fashion Brands | Livestream Clothing Sales',
  description:
    'Live shopping for fashion brands. Host virtual try-on sessions, style shows, and collection launches. Convert viewers into buyers with in-stream checkout.',
  keywords: [
    'live shopping fashion',
    'fashion live shopping',
    'livestream fashion sales',
    'virtual try on',
    'fashion livestream',
    'clothing live selling',
    'apparel live commerce',
    'fashion shoppable video',
  ],
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Live Shopping for Fashion Brands',
  description: 'Live shopping platform for fashion and apparel brands. Host try-on sessions, styling shows, and collection launches with in-stream checkout.',
  about: {
    '@type': 'Thing',
    name: 'Fashion Live Shopping',
    description: 'Live video commerce specifically designed for fashion brands, enabling real-time product demonstrations and instant checkout.',
  },
};

export default function FashionIndustryPage() {
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
              <p className="text-pink-500 text-sm font-semibold tracking-wide uppercase mb-4">Fashion & Apparel</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                Live Shopping for Fashion Brands
              </h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Show how clothes really fit. Style outfits live. Let viewers shop the look instantly.
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

        {/* Why Fashion */}
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Live Shopping Works for Fashion</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>
                Fashion is one of the top-performing categories in live shopping. Clothing and accessories
                benefit enormously from live demonstration—viewers can see how garments fit on real bodies,
                how fabrics move, and how pieces work together in outfits.
              </p>
              <p>
                Fashion brands using live shopping report <strong>conversion rates 10x higher</strong> than
                traditional e-commerce and <strong>return rates 40-50% lower</strong> because customers see
                exactly what they're buying before purchase.
              </p>
            </div>
          </div>
        </section>

        {/* Key Stats */}
        <section className="py-16 px-6 lg:px-8 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-pink-400 mb-2">225%</div>
                <div className="text-gray-400">Higher add-to-cart rate</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-pink-400 mb-2">40%</div>
                <div className="text-gray-400">Fewer returns</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-pink-400 mb-2">35%</div>
                <div className="text-gray-400">Higher AOV</div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Fashion Live Shopping Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Try-On Sessions',
                  description: 'Show how garments fit on different body types. Demonstrate movement, fabric drape, and true colors.',
                },
                {
                  title: 'Styling Shows',
                  description: 'Create complete outfits live. Show how to style a piece multiple ways. Cross-sell accessories.',
                },
                {
                  title: 'Collection Launches',
                  description: 'Debut new collections with live shopping events. Create buzz and capture first-mover buyers.',
                },
                {
                  title: 'Behind the Scenes',
                  description: 'Tour your studio, show the design process, introduce the team. Build brand connection.',
                },
                {
                  title: 'Size & Fit Guides',
                  description: 'Help customers choose the right size with live demonstrations on different models.',
                },
                {
                  title: 'Flash Sales',
                  description: 'Limited-time drops and exclusive deals. Create urgency with live-only discounts.',
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

        {/* Features for Fashion */}
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Features for Fashion Brands</h2>
            <div className="space-y-4">
              {[
                'Feature multiple product variants (sizes, colors) on screen',
                'One-click add to cart without leaving the stream',
                'Show product details and sizing information in-stream',
                'Live chat for fit questions and styling advice',
                'Automatic shoppable replays from every show',
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Fashion Live Shopping FAQ</h2>
            <div className="space-y-6">
              {[
                {
                  q: 'Do I need professional models for live shopping?',
                  a: 'No. Many successful fashion brands use founders, employees, or customers as hosts. Authenticity often performs better than polished production.',
                },
                {
                  q: 'How do I handle sizing questions during a live show?',
                  a: 'Hosts can answer sizing questions in real-time via chat. You can also display size guides on screen and have models share their measurements for reference.',
                },
                {
                  q: 'Can customers buy different sizes/colors during the stream?',
                  a: 'Yes. When you feature a product, all available variants are shown. Viewers select their preferred size and color before adding to cart.',
                },
                {
                  q: 'What about returns if sizing is still wrong?',
                  a: 'Returns happen, but brands report 40-50% fewer returns with live shopping because customers see garments on real bodies before buying.',
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
                { name: 'Beauty', href: '/industries/beauty' },
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Launch Fashion Live Shopping?</h2>
            <p className="text-lg text-gray-500 mb-8">
              See how live shopping can transform your fashion brand's e-commerce.
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
