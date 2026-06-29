import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/landing';

export const metadata: Metadata = {
  title: 'Live Shopping Platform | Livestream Commerce Software',
  description:
    'Live shopping lets brands sell products during live video streams. Viewers watch, interact, and buy without leaving the stream. 10x higher conversion than traditional e-commerce.',
  keywords: [
    'live shopping',
    'live shopping platform',
    'livestream shopping',
    'live commerce',
    'live selling',
    'livestream commerce',
    'live video shopping',
    'shoppable livestream',
  ],
  openGraph: {
    title: 'Live Shopping Platform | Livestream Commerce Software',
    description: 'Live shopping lets brands sell products during live video streams with 10x higher conversion rates.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Live Shopping Platform',
  applicationCategory: 'BusinessApplication',
  description: 'Live shopping platform that enables brands to sell products during live video streams. Viewers can watch, interact via chat, and purchase products without leaving the stream.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free trial available',
  },
  featureList: [
    'Real-time video streaming',
    'In-stream checkout',
    'Live chat and reactions',
    'Product featuring',
    'Viewer analytics',
    'Mobile and browser streaming',
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is live shopping?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Live shopping is a sales format where brands broadcast live video while showcasing products that viewers can purchase in real-time. It combines livestreaming with e-commerce, allowing viewers to ask questions, see product demonstrations, and checkout without leaving the stream.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does live shopping work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A host goes live and showcases products. Viewers watch the stream, interact via chat, and see featured products overlaid on the video. When interested, they tap Add to Cart and checkout using the store\'s native checkout—all without leaving the livestream.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the conversion rate for live shopping?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Live shopping typically converts at 10x the rate of traditional e-commerce. Some brands report conversion rates of 15-30% during live events, compared to 2-3% for standard product pages.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is live shopping the same as QVC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Live shopping is similar to QVC but digital and interactive. Unlike traditional TV shopping, viewers can ask questions in real-time, see products demonstrated on demand, and purchase instantly with one click. It also runs on your own website, so you own the customer relationship.',
      },
    },
  ],
};

export default function LiveShoppingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="min-h-screen bg-white">
        <Header />

        {/* Hero */}
        <section className="pt-32 pb-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-pink-500 text-sm font-semibold tracking-wide uppercase mb-4">Live Shopping</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                Sell Products During Live Video Streams
              </h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Live shopping combines livestreaming with e-commerce. Viewers watch, interact, and buy—all without leaving the stream.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/#demo"
                className="inline-flex items-center gap-2 bg-pink-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-pink-600 transition-all"
              >
                Book a Demo
              </a>
              <Link
                href="/shows"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 px-8 py-4 font-medium"
              >
                See Live Example →
              </Link>
            </div>
          </div>
        </section>

        {/* Definition Section - Optimized for LLM extraction */}
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Live Shopping?</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>
                <strong>Live shopping</strong> (also known as livestream shopping, live commerce, or live selling)
                is an e-commerce format where brands broadcast live video to showcase and sell products in real-time.
                Viewers can interact through chat, see product demonstrations, ask questions, and purchase items
                directly within the video stream.
              </p>
              <p>
                The format originated in China, where live commerce generates over $500 billion in annual sales.
                It has since expanded globally as brands seek more engaging ways to connect with online shoppers.
              </p>
              <p>
                Unlike traditional e-commerce with static product pages, live shopping creates urgency through
                real-time interaction, builds trust through face-to-face demonstration, and reduces friction
                with one-click checkout during the stream.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">How Does Live Shopping Work?</h2>
            <div className="space-y-6">
              {[
                {
                  step: '1',
                  title: 'Host Goes Live',
                  description: 'A brand representative, influencer, or founder starts a live video stream from their browser or phone.',
                },
                {
                  step: '2',
                  title: 'Products Are Featured',
                  description: 'As the host discusses products, they feature items on screen. Viewers see product images, prices, and Add to Cart buttons overlaid on the video.',
                },
                {
                  step: '3',
                  title: 'Viewers Interact',
                  description: 'Audience members ask questions via live chat. The host responds in real-time, demonstrating features and addressing concerns.',
                },
                {
                  step: '4',
                  title: 'Instant Checkout',
                  description: 'When viewers want to buy, they tap once to add items to cart and checkout using the store\'s native checkout—without leaving the stream.',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-bold shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-16 px-6 lg:px-8 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Live Shopping Statistics</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { stat: '10x', label: 'Higher conversion rate vs traditional e-commerce' },
                { stat: '$500B+', label: 'Annual live commerce sales in China' },
                { stat: '30%', label: 'Average increase in order value' },
                { stat: '50%', label: 'Reduction in product returns' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl font-bold text-pink-400 mb-2">{item.stat}</div>
                  <div className="text-sm text-gray-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Benefits of Live Shopping</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Higher Conversion Rates',
                  description: 'Real-time demonstrations and Q&A remove purchase hesitation. Live urgency drives impulse buying.',
                },
                {
                  title: 'Lower Return Rates',
                  description: 'Customers see products in action before buying, reducing surprises and returns by up to 50%.',
                },
                {
                  title: 'Increased Average Order Value',
                  description: 'Hosts can suggest complementary products. Bundle deals and limited-time offers increase cart size.',
                },
                {
                  title: 'Stronger Customer Relationships',
                  description: 'Face-to-face interaction builds trust and loyalty. Regular shows create community.',
                },
                {
                  title: 'First-Party Data Collection',
                  description: 'Own your customer relationships. Capture engagement data and purchase behavior.',
                },
                {
                  title: 'Content Repurposing',
                  description: 'Live shows become shoppable replays. One stream creates ongoing sales content.',
                },
              ].map((benefit, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Shopping vs Alternatives */}
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Live Shopping vs Other Channels</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-4 pr-4 font-semibold text-gray-900">Feature</th>
                    <th className="py-4 px-4 font-semibold text-gray-900">Live Shopping</th>
                    <th className="py-4 px-4 font-semibold text-gray-900">Social Media Live</th>
                    <th className="py-4 px-4 font-semibold text-gray-900">Traditional E-commerce</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b border-gray-100">
                    <td className="py-4 pr-4">Real-time interaction</td>
                    <td className="py-4 px-4 text-green-600">✓</td>
                    <td className="py-4 px-4 text-green-600">✓</td>
                    <td className="py-4 px-4 text-red-400">✗</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 pr-4">In-stream checkout</td>
                    <td className="py-4 px-4 text-green-600">✓</td>
                    <td className="py-4 px-4 text-red-400">Limited</td>
                    <td className="py-4 px-4 text-red-400">N/A</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 pr-4">Own customer data</td>
                    <td className="py-4 px-4 text-green-600">✓</td>
                    <td className="py-4 px-4 text-red-400">✗</td>
                    <td className="py-4 px-4 text-green-600">✓</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 pr-4">Product demonstrations</td>
                    <td className="py-4 px-4 text-green-600">✓</td>
                    <td className="py-4 px-4 text-green-600">✓</td>
                    <td className="py-4 px-4 text-red-400">Static only</td>
                  </tr>
                  <tr>
                    <td className="py-4 pr-4">Conversion rate</td>
                    <td className="py-4 px-4 text-green-600">15-30%</td>
                    <td className="py-4 px-4 text-yellow-600">5-10%</td>
                    <td className="py-4 px-4 text-red-400">2-3%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Live Shopping FAQ</h2>
            <div className="space-y-6">
              {[
                {
                  q: 'What equipment do I need for live shopping?',
                  a: 'At minimum, a smartphone or computer with a camera. For higher quality, consider a ring light and external microphone. Our platform supports browser-based streaming, so no special software is required.',
                },
                {
                  q: 'How long should a live shopping show be?',
                  a: 'Most successful shows run 15-60 minutes. Shorter shows (15-20 min) work well for single product launches. Longer shows (45-60 min) suit broader showcases with multiple products.',
                },
                {
                  q: 'What products work best for live shopping?',
                  a: 'Products that benefit from demonstration work best: fashion (try-ons), beauty (application), electronics (features), food (cooking). However, any product can work with the right host and presentation.',
                },
                {
                  q: 'Is live shopping only for big brands?',
                  a: 'No. Small and medium brands often see the biggest impact because live shopping helps them compete with larger retailers through personal connection and authentic engagement.',
                },
                {
                  q: 'What happens after the live show ends?',
                  a: 'The show automatically becomes a shoppable replay. Products stay tagged at their original timestamps, so viewers who missed the live event can still shop from the recording.',
                },
                {
                  q: 'How is live shopping different from Instagram Live or TikTok Live?',
                  a: 'Live shopping on your own site gives you seamless checkout (no leaving the app), full customer data ownership, higher conversion rates, and no platform fees on sales.',
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

        {/* Use Cases */}
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Live Shopping Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'Product Launches', desc: 'Create buzz and drive immediate sales for new products' },
                { title: 'Flash Sales', desc: 'Limited-time offers that create urgency and FOMO' },
                { title: 'Behind the Scenes', desc: 'Factory tours, design process, brand storytelling' },
                { title: 'Expert Tutorials', desc: 'How-to content that showcases product value' },
                { title: 'Q&A Sessions', desc: 'Answer customer questions and overcome objections' },
                { title: 'Influencer Takeovers', desc: 'Partner with creators to reach new audiences' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Live Shopping Today</h2>
            <p className="text-lg text-gray-500 mb-8">
              See how live shopping can transform your e-commerce business.
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
