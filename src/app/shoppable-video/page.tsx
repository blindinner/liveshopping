import type { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer } from '@/components/landing';

export const metadata: Metadata = {
  title: 'Shoppable Video Platform | Make Any Video Purchasable',
  description:
    'Shoppable video lets viewers buy products directly from video content. Tag products at specific moments, embed anywhere, and turn video views into sales.',
  keywords: [
    'shoppable video',
    'shoppable video platform',
    'video commerce',
    'interactive video shopping',
    'clickable video',
    'buyable video',
    'video shopping',
    'product tagging video',
  ],
  openGraph: {
    title: 'Shoppable Video Platform | Make Any Video Purchasable',
    description: 'Tag products in videos and let viewers buy what they see. Turn video content into a sales channel.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Shoppable Video Platform',
  applicationCategory: 'BusinessApplication',
  description: 'Shoppable video platform that lets brands tag products in videos for direct purchase. Viewers click on products they see and buy without leaving the video.',
  featureList: [
    'Product tagging at timestamps',
    'In-video checkout',
    'Embeddable video widgets',
    'Social media video import',
    'Video analytics',
    'Automatic replay conversion',
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is shoppable video?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Shoppable video is video content with embedded product links that allow viewers to purchase items directly from the video. Products are tagged at specific moments, and viewers can click to add items to cart without pausing or leaving the video player.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I make a video shoppable?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Upload your video to a shoppable video platform, then tag products at the timestamps where they appear. When viewers watch, they see clickable product cards at those moments. No video editing required—tagging happens in the platform.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between shoppable video and live shopping?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Live shopping happens in real-time with viewer interaction. Shoppable video is pre-recorded content with tagged products. Both allow in-video purchasing, but shoppable video works 24/7 while live shopping creates urgency through real-time events.',
      },
    },
  ],
};

export default function ShoppableVideoPage() {
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
              <p className="text-pink-500 text-sm font-semibold tracking-wide uppercase mb-4">Shoppable Video</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                Turn Any Video Into a Sales Channel
              </h1>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Tag products in your videos. Viewers click to buy what they see—without leaving the player.
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
                href="/live-shopping"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 px-8 py-4 font-medium"
              >
                Learn About Live Shopping →
              </Link>
            </div>
          </div>
        </section>

        {/* Definition */}
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Shoppable Video?</h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>
                <strong>Shoppable video</strong> (also called interactive video or clickable video) is video content
                that allows viewers to purchase products directly within the video player. Products are tagged at
                specific timestamps, and when viewers reach those moments, clickable product cards appear.
              </p>
              <p>
                Unlike traditional product videos that require viewers to search for items separately, shoppable
                video creates a direct path from inspiration to purchase. This reduces friction and captures
                buyers at the moment of highest intent.
              </p>
              <p>
                Shoppable video can be created from any video content: product demos, tutorials, influencer
                content, user-generated videos, or even repurposed social media clips from TikTok and Instagram.
              </p>
            </div>
          </div>
        </section>

        {/* Types of Shoppable Video */}
        <section className="py-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Types of Shoppable Video</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: 'On-Demand Shoppable Videos',
                  description: 'Pre-recorded videos with products tagged at specific timestamps. Works 24/7 on product pages, homepages, and landing pages.',
                  icon: '▶️',
                },
                {
                  title: 'Shoppable Livestreams',
                  description: 'Real-time broadcasts where viewers purchase during the live event. Creates urgency and allows live Q&A.',
                  icon: '🔴',
                },
                {
                  title: 'Shoppable Video Widgets',
                  description: 'Embeddable carousels, floating players, and inline videos that add shoppable content throughout your site.',
                  icon: '📱',
                },
              ].map((type, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6">
                  <div className="text-3xl mb-4">{type.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.title}</h3>
                  <p className="text-gray-600 text-sm">{type.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">How to Create Shoppable Videos</h2>
            <div className="space-y-6">
              {[
                {
                  step: '1',
                  title: 'Upload or Import Video',
                  description: 'Upload any video file, or import directly from TikTok, Instagram, or YouTube. All formats supported.',
                },
                {
                  step: '2',
                  title: 'Tag Products',
                  description: 'Select timestamps where products appear and tag them with items from your catalog. No video editing required.',
                },
                {
                  step: '3',
                  title: 'Embed Anywhere',
                  description: 'Add videos to product pages, your homepage, email campaigns, or social ads with simple embed codes.',
                },
                {
                  step: '4',
                  title: 'Track Performance',
                  description: 'See views, engagement, clicks, and purchases attributed to each video. Optimize based on data.',
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
            <h2 className="text-3xl font-bold mb-8 text-center">Shoppable Video Performance</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { stat: '5x', label: 'Higher engagement than static images' },
                { stat: '80%', label: 'Of consumers prefer video over text' },
                { stat: '3x', label: 'More time spent on pages with video' },
                { stat: '64%', label: 'More likely to buy after watching video' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl font-bold text-pink-400 mb-2">{item.stat}</div>
                  <div className="text-sm text-gray-400">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Where to Use */}
        <section className="py-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Where to Use Shoppable Video</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Product Detail Pages',
                  description: 'Replace or supplement product photos with shoppable video demos. Show products in action.',
                },
                {
                  title: 'Homepage',
                  description: 'Feature shoppable video carousels showcasing bestsellers, new arrivals, or seasonal collections.',
                },
                {
                  title: 'Collection Pages',
                  description: 'Add video content to category pages. Let customers browse products through video.',
                },
                {
                  title: 'Email Campaigns',
                  description: 'Embed shoppable video thumbnails that link to video landing pages. Higher click-through rates.',
                },
                {
                  title: 'Social Ads',
                  description: 'Drive traffic to shoppable video experiences. Better conversion than standard product pages.',
                },
                {
                  title: 'Blog Posts',
                  description: 'Add shoppable video to editorial content. Monetize content marketing.',
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

        {/* Content Sources */}
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Video Content Sources</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { source: 'TikTok', desc: 'Import viral content' },
                { source: 'Instagram', desc: 'Reels and Stories' },
                { source: 'YouTube', desc: 'Long-form content' },
                { source: 'UGC', desc: 'Customer videos' },
                { source: 'Influencers', desc: 'Creator partnerships' },
                { source: 'Brand Videos', desc: 'Product demos' },
                { source: 'Live Replays', desc: 'From live shows' },
                { source: 'Uploads', desc: 'Any video file' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <div className="font-semibold text-gray-900">{item.source}</div>
                  <div className="text-sm text-gray-500">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Shoppable Video FAQ</h2>
            <div className="space-y-6">
              {[
                {
                  q: 'Do I need to edit my videos to make them shoppable?',
                  a: 'No. Product tagging happens in our platform, not in the video file itself. Your original video remains unchanged.',
                },
                {
                  q: 'What video formats are supported?',
                  a: 'We support all major formats: MP4, MOV, WebM, and more. Both horizontal and vertical videos work. We automatically optimize for streaming.',
                },
                {
                  q: 'Can I use videos from TikTok or Instagram?',
                  a: 'Yes. Import videos directly from TikTok and Instagram using their URLs. Perfect for repurposing social content on your own site.',
                },
                {
                  q: 'How many products can I tag in one video?',
                  a: 'No limit. Tag as many products as appear in the video. Each product can have multiple tagged moments.',
                },
                {
                  q: 'Do shoppable videos slow down my website?',
                  a: 'No. Videos load asynchronously and use adaptive streaming. They don\'t impact your page speed or Core Web Vitals.',
                },
                {
                  q: 'What analytics do I get?',
                  a: 'Track views, watch time, product clicks, add-to-carts, and purchases per video. See which moments and products perform best.',
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

        {/* CTA */}
        <section className="py-16 px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Creating Shoppable Videos</h2>
            <p className="text-lg text-gray-500 mb-8">
              Turn your video content into a revenue-generating sales channel.
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
