import type { Metadata } from 'next';
import {
  Header,
  Hero,
  SolutionIntro,
  WhatIsLiveShopping,
  WhatIsShoppableVideo,
  ProductsBridge,
  Problem,
  Benefits,
  Results,
  Features,
  UseCases,
  HowItWorks,
  Integrations,
  FAQ,
  FinalCTA,
  Footer,
} from '@/components/landing';

export const metadata: Metadata = {
  title: 'Live Shopping Platform | Turn Video Into Sales',
  description:
    'The live shopping platform that lets your customers buy without leaving the stream. One-click checkout, shoppable videos, and embeddable widgets for e-commerce.',
  keywords: [
    'live shopping',
    'shoppable video',
    'live selling',
    'video commerce',
    'live commerce',
    'shoppable livestream',
    'ecommerce video',
    'live selling platform',
    'video shopping',
    'livestream shopping',
  ],
  openGraph: {
    title: 'Live Shopping | Video Commerce Platform',
    description:
      'Turn your live streams into sales. One-click checkout, shoppable videos, and embeddable widgets.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Shopping | Video Commerce Platform',
    description:
      'Turn your live streams into sales. One-click checkout, shoppable videos, and embeddable widgets.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD Structured Data for SEO and AI discoverability
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Live Shopping',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'Live shopping platform for e-commerce. Enable one-click checkout during live streams, create shoppable videos, and embed video widgets on your website.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free pilot available',
      },
      featureList: [
        'Live video streaming with in-stream checkout',
        'Shoppable video with product tagging',
        'Embeddable video widgets',
        'E-commerce platform integrations',
        'Real-time analytics',
        'Browser and mobile streaming',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is live shopping?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Live shopping (also called live commerce or livestream shopping) is a sales format where brands broadcast live video while showcasing products that viewers can purchase in real-time. It combines the engagement of live video with the convenience of e-commerce, allowing viewers to ask questions, see product demonstrations, and checkout without leaving the stream.',
          },
        },
        {
          '@type': 'Question',
          name: 'What is shoppable video?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Shoppable video is any video content that allows viewers to purchase products directly within the video player. Products are tagged at specific moments, and viewers can click to add items to their cart without pausing or leaving the video. It can be live (livestream shopping) or on-demand (pre-recorded videos with product tags).',
          },
        },
        {
          '@type': 'Question',
          name: 'What is video commerce?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Video commerce is the broader category that includes live shopping, shoppable videos, and any video-based selling experience. It bridges online and in-store shopping by allowing brands to showcase products dynamically while maintaining a personal connection with their audience.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is live shopping different from going live on social platforms?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Unlike social platforms, live shopping on your own site lets you own the customer relationship and data. Viewers can checkout directly without leaving the stream, you control the experience end-to-end, and you capture first-party data. Social platforms take a cut of sales and limit your access to customer information.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does live shopping increase conversion rates?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Live shopping converts at up to 10x the rate of traditional e-commerce. Real-time product demonstrations build trust, live Q&A removes purchase hesitation, and the urgency of live events drives impulse buying. One-click checkout reduces cart abandonment by capturing customers at peak intent.',
          },
        },
        {
          '@type': 'Question',
          name: 'What kind of ROI can I expect from live shopping?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Brands typically see higher conversion rates (up to 10x), increased average order value (30%+), lower return rates (50% fewer), and improved customer loyalty. Detailed analytics help track exactly how video commerce impacts revenue.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can shows be replayed and remain shoppable?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. All live shows automatically become shoppable replays. The products featured during the live event stay tagged at their original timestamps, so viewers who missed the live show can still shop directly from the replay.',
          },
        },
        {
          '@type': 'Question',
          name: 'Will live shopping slow down my website?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Video players and widgets are optimized for performance and load asynchronously. They do not block page load or impact Core Web Vitals. Adaptive streaming delivers the best quality for each viewer\'s connection.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which e-commerce platforms integrate with live shopping?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Live Shopping integrates with major e-commerce platforms including Shopify, WooCommerce, BigCommerce, Magento, and custom platforms via API. Products, inventory, and checkout sync automatically.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I source videos from Instagram and TikTok?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. You can import videos from Instagram and TikTok to create shoppable versions on your site. This lets you repurpose social content while owning the shopping experience and customer data.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I own the customer data collected during live events?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. You own 100% of the first-party data collected through your live shows and shoppable videos. This includes viewer behavior, engagement metrics, and any information they provide. Data is never sold or shared.',
          },
        },
        {
          '@type': 'Question',
          name: 'What industries use live shopping?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Live shopping works across all product categories—fashion, beauty, electronics, home goods, food and beverage, fitness, automotive, and more. Any product that benefits from demonstration or explanation works well.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is live shopping suitable for small businesses?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Live shopping scales to any size. Small brands often see the biggest impact because it helps them compete with larger retailers by providing personalized, engaging experiences that build loyal communities.',
          },
        },
        {
          '@type': 'Question',
          name: 'How often should brands run live shows?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Consistency matters more than frequency. Start with weekly or bi-weekly shows at a regular time. This trains your audience to tune in. Many successful brands do 1-2 shows per week, plus special events for launches.',
          },
        },
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-white">
        <Header />
        <Hero />
        <SolutionIntro />
        <WhatIsLiveShopping />
        <WhatIsShoppableVideo />
        <ProductsBridge />
        <Problem />
        <Benefits />
        <Results />
        <Features />
        <UseCases />
        <HowItWorks />
        <Integrations />
        <FAQ />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}
