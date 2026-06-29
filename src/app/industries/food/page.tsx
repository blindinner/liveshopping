import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/landing';

export const metadata: Metadata = {
  title: 'Live Shopping for Food & Beverage | Livestream F&B Sales',
  description:
    'Live shopping for food and beverage brands. Host cooking demos, tastings, and product launches. Convert viewers into buyers with in-stream checkout.',
  keywords: [
    'live shopping food',
    'food live shopping',
    'beverage livestream',
    'food and drink live selling',
    'culinary live shopping',
    'food shoppable video',
    'beverage video commerce',
    'cooking demo live shopping',
  ],
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Live Shopping for Food & Beverage',
  description: 'Live shopping platform for food and beverage brands. Host cooking demos, tastings, and launches with in-stream checkout.',
  about: {
    '@type': 'Thing',
    name: 'Food & Beverage Live Shopping',
    description: 'Live video commerce specifically designed for food and beverage brands, enabling real-time product demonstrations and instant checkout.',
  },
};

export default function FoodIndustryPage() {
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
              <p className="text-pink-500 text-sm font-semibold tracking-wide uppercase mb-4">Food & Beverage</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                Live Shopping for Food Brands
              </h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Cook with your products live. Share recipes and pairings. Let viewers buy ingredients instantly.
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

        {/* Why Food */}
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Live Shopping Works for Food</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>
                Food is experiential—photos and descriptions can't capture aroma, sizzle, or satisfaction.
                Live shopping brings food to life through cooking demos, ingredient showcases, and recipes
                that inspire immediate purchase.
              </p>
              <p>
                Food and beverage brands using live shopping report <strong>subscription conversion rates 5x higher</strong> and
                <strong> 78% of viewers making repeat purchases</strong> because live cooking content creates
                ongoing engagement and loyalty.
              </p>
            </div>
          </div>
        </section>

        {/* Key Stats */}
        <section className="py-16 px-6 lg:px-8 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-pink-400 mb-2">5x</div>
                <div className="text-gray-400">Higher subscription conversion</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-pink-400 mb-2">78%</div>
                <div className="text-gray-400">Repeat purchase rate</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-pink-400 mb-2">4.2x</div>
                <div className="text-gray-400">Basket size increase</div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Food Live Shopping Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Cooking Demos',
                  description: 'Cook recipes live using your products. Viewers can buy all the ingredients with one click as they watch.',
                },
                {
                  title: 'Tasting Sessions',
                  description: 'Host virtual tastings for wine, cheese, chocolate, or coffee. Guide viewers through flavor profiles.',
                },
                {
                  title: 'Recipe Showcases',
                  description: 'Share seasonal recipes and meal ideas. Bundle ingredients for easy purchase.',
                },
                {
                  title: 'Farm Tours',
                  description: 'Show where ingredients come from. Build connection through transparency about sourcing.',
                },
                {
                  title: 'Pairing Events',
                  description: 'Demonstrate food and beverage pairings. Cross-sell complementary products.',
                },
                {
                  title: 'Holiday Specials',
                  description: 'Plan menus for holidays and occasions. Create urgency with limited seasonal offerings.',
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

        {/* Features for Food */}
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Features for Food Brands</h2>
            <div className="space-y-4">
              {[
                'HD video that showcases food presentation',
                'Feature recipe bundles and ingredient kits',
                'Show nutritional info and sourcing details',
                'One-click add to cart without leaving the stream',
                'Live chat for recipe questions and substitutions',
                'Automatic shoppable replays from every cooking show',
                'Embed videos on recipe and product pages',
                'Track which recipes and products drive orders',
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Food Live Shopping FAQ</h2>
            <div className="space-y-6">
              {[
                {
                  q: 'How do I make food look appealing on camera?',
                  a: 'Good lighting matters most—natural light or soft white lights. Show steam, movement, and final plating. HD streaming captures textures and colors well.',
                },
                {
                  q: 'Can I sell perishable items through live shopping?',
                  a: 'Yes. Many food brands ship fresh and frozen products. Ensure your checkout and fulfillment process handles temperature-sensitive items properly.',
                },
                {
                  q: 'What about dietary restrictions and allergen questions?',
                  a: 'Live chat is perfect for these questions. Hosts can suggest alternatives and point out allergen-free options in real-time.',
                },
                {
                  q: 'How do I bundle products for recipes?',
                  a: 'Create recipe kits that include all necessary ingredients. Feature the bundle on screen during the cooking demo for one-click purchase.',
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Launch Food Live Shopping?</h2>
            <p className="text-lg text-gray-500 mb-8">
              See how live shopping can transform your food brand's e-commerce.
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
