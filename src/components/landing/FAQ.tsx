'use client';

import { useState } from 'react';

interface FAQCategory {
  title: string;
  faqs: { question: string; answer: string }[];
}

const faqCategories: FAQCategory[] = [
  {
    title: 'General',
    faqs: [
      {
        question: 'What is live shopping?',
        answer: 'Live shopping (also called live commerce or livestream shopping) is a sales format where brands broadcast live video while showcasing products that viewers can purchase in real-time. It combines the engagement of live video with the convenience of e-commerce, allowing viewers to ask questions, see product demonstrations, and checkout without leaving the stream.',
      },
      {
        question: 'What is shoppable video?',
        answer: 'Shoppable video is any video content that allows viewers to purchase products directly within the video player. Products are tagged at specific moments, and viewers can click to add items to their cart without pausing or leaving the video. It can be live (livestream shopping) or on-demand (pre-recorded videos with product tags).',
      },
      {
        question: 'What is video commerce?',
        answer: 'Video commerce is the broader category that includes live shopping, shoppable videos, and any video-based selling experience. It bridges online and in-store shopping by allowing brands to showcase products dynamically while maintaining a personal connection with their audience.',
      },
      {
        question: 'How is live shopping different from going live on social platforms?',
        answer: 'Unlike social platforms, live shopping on your own site lets you own the customer relationship and data. Viewers can checkout directly without leaving the stream, you control the experience end-to-end, and you capture first-party data. Social platforms take a cut of sales and limit your access to customer information.',
      },
    ],
  },
  {
    title: 'Business Value',
    faqs: [
      {
        question: 'How does live shopping increase conversion rates?',
        answer: 'Live shopping converts at up to 10x the rate of traditional e-commerce. Real-time product demonstrations build trust, live Q&A removes purchase hesitation, and the urgency of live events drives impulse buying. One-click checkout reduces cart abandonment by capturing customers at peak intent.',
      },
      {
        question: 'What kind of ROI can I expect?',
        answer: 'Brands typically see higher conversion rates (up to 10x), increased average order value (30%+), lower return rates (50% fewer), and improved customer loyalty. We provide detailed analytics so you can track exactly how video commerce impacts your revenue.',
      },
      {
        question: 'How does live shopping impact average order value (AOV)?',
        answer: 'Live shows increase AOV by 30% or more through product bundling, exclusive offers, and impulse purchases. Hosts can suggest complementary products in real-time, and the social proof of seeing others buy encourages viewers to add more to their carts.',
      },
      {
        question: 'Why should my brand consider video commerce?',
        answer: 'Video commerce bridges online and in-store shopping. It lets you showcase products dynamically, answer customer questions live, and build personal connections at scale. Brands using video commerce see higher engagement, better conversion, and stronger customer relationships than traditional e-commerce.',
      },
    ],
  },
  {
    title: 'Features & Functionality',
    faqs: [
      {
        question: 'What interactive features are available during a live show?',
        answer: 'Our live shows include real-time chat, emoji reactions, product featuring with one-click add-to-cart, live polls, viewer count display, and Q&A capabilities. Hosts can pin products, respond to questions, and create urgency with limited-time offers.',
      },
      {
        question: 'Can shows be replayed and remain shoppable?',
        answer: 'Yes. All live shows automatically become shoppable replays. The products you featured during the live event stay tagged at their original timestamps, so viewers who missed the live show can still shop directly from the replay.',
      },
      {
        question: 'How does checkout work during live shows?',
        answer: 'When a host features a product, viewers see an "Add to Cart" button overlaid on the video. One tap adds the item to their cart. They can continue watching and checkout whenever ready using your store\'s native checkout—no account creation required.',
      },
      {
        question: 'Can I tag products at specific timestamps in videos?',
        answer: 'Yes. For on-demand shoppable videos, you can tag products at specific timestamps. When viewers reach that moment in the video, clickable product cards appear. You can tag multiple products per video and control exactly when each appears.',
      },
      {
        question: 'Can I auto-play shoppable videos?',
        answer: 'Yes. You can configure videos to auto-play (muted, per browser requirements) when they enter the viewport. This increases engagement on product pages and throughout your site.',
      },
    ],
  },
  {
    title: 'Technical & Integration',
    faqs: [
      {
        question: 'Which e-commerce platforms do you integrate with?',
        answer: 'We integrate with major e-commerce platforms including Shopify, WooCommerce, BigCommerce, Magento, and custom platforms via API. Your products, inventory, and checkout sync automatically.',
      },
      {
        question: 'Will live shopping slow down my website?',
        answer: 'No. Our video player and widgets are optimized for performance and load asynchronously. They won\'t block your page load or impact Core Web Vitals. We use adaptive streaming to deliver the best quality for each viewer\'s connection.',
      },
      {
        question: 'How do I embed shoppable videos on my website?',
        answer: 'We provide ready-to-use embed codes that you copy and paste into your site. Options include video carousels for collection pages, floating players that follow users as they scroll, and inline players for product detail pages. No coding required.',
      },
      {
        question: 'How difficult is it to get started technically?',
        answer: 'Setup takes about 2 minutes. Connect your store, and your products sync automatically. For embedding widgets, just copy and paste the code snippet. No developers required for basic setup, though we offer API access for custom integrations.',
      },
      {
        question: 'Can I use my own streaming software?',
        answer: 'Yes. Stream directly from your browser using our built-in WebRTC streaming, or use professional software like OBS, Streamlabs, or mobile apps like Larix Broadcaster via RTMPS. We support both approaches.',
      },
      {
        question: 'Can I handle big traffic surges during major events?',
        answer: 'Yes. Our infrastructure is built to scale automatically. Whether you have 100 viewers or 100,000, the experience remains smooth. We use global CDN distribution to ensure low-latency streaming worldwide.',
      },
    ],
  },
  {
    title: 'Content & Videos',
    faqs: [
      {
        question: 'Can I source videos from Instagram and TikTok?',
        answer: 'Yes. You can import videos from Instagram and TikTok to create shoppable versions on your site. This lets you repurpose social content while owning the shopping experience and customer data.',
      },
      {
        question: 'What types of videos can I use?',
        answer: 'Any video works—product demos, tutorials, unboxings, user-generated content, influencer collaborations, behind-the-scenes, and more. Both horizontal and vertical formats are supported.',
      },
      {
        question: 'What is the best video format and length?',
        answer: 'We support all major formats (MP4, MOV, WebM). For live shows, 15-60 minutes works well. For shoppable clips, 30 seconds to 3 minutes is ideal. Vertical video performs best on mobile; horizontal on desktop.',
      },
      {
        question: 'Can I upload my own videos?',
        answer: 'Yes. Upload any video file, and we\'ll process it for optimal streaming. You can then tag products at specific timestamps to make it shoppable.',
      },
      {
        question: 'How many videos can I add to a page?',
        answer: 'No limit. You can add as many shoppable videos as you want—carousels, grids, or individual players. Videos load efficiently without impacting page performance.',
      },
    ],
  },
  {
    title: 'Data & Analytics',
    faqs: [
      {
        question: 'What kind of data and insights do you provide?',
        answer: 'Real-time metrics during shows include viewer count, engagement (chat, reactions), and add-to-cart events. Post-show analytics include conversion rates, revenue attribution, watch time, drop-off points, and product performance.',
      },
      {
        question: 'Do I own the customer data collected during live events?',
        answer: 'Yes. You own 100% of the first-party data collected through your live shows and shoppable videos. This includes viewer behavior, engagement metrics, and any information they provide. We never sell or share your data.',
      },
      {
        question: 'What\'s the difference between influenced revenue and direct revenue?',
        answer: 'Direct revenue is purchases made directly through the video (clicked product, added to cart, checked out). Influenced revenue includes purchases where the customer watched a video but bought later through another channel. We track both.',
      },
      {
        question: 'How do I know which orders came through shoppable videos?',
        answer: 'Every purchase through our platform is tracked with attribution data. You can see exactly which videos, products, and moments drove each sale in your analytics dashboard.',
      },
    ],
  },
  {
    title: 'Use Cases & Industries',
    faqs: [
      {
        question: 'What industries use live shopping?',
        answer: 'Live shopping works across all product categories—fashion, beauty, electronics, home goods, food & beverage, fitness, automotive, and more. Any product that benefits from demonstration or explanation works well.',
      },
      {
        question: 'Is live shopping suitable for small businesses?',
        answer: 'Yes. Live shopping scales to any size. Small brands often see the biggest impact because it helps them compete with larger retailers by providing personalized, engaging experiences that build loyal communities.',
      },
      {
        question: 'What is a good first live show format for a new brand?',
        answer: 'Start simple—a product showcase or Q&A session works great. Introduce 3-5 products, answer viewer questions, and offer an exclusive discount for live viewers. Keep it 15-30 minutes. Your first show is about learning.',
      },
      {
        question: 'How often should brands run live shows?',
        answer: 'Consistency matters more than frequency. Start with weekly or bi-weekly shows at a regular time. This trains your audience to tune in. Many successful brands do 1-2 shows per week, plus special events for launches.',
      },
      {
        question: 'How can influencers and creators collaborate on live shows?',
        answer: 'Creators can host shows featuring your products from anywhere. You provide product access, they bring their audience. Track attribution by creator, share revenue based on performance, and build ongoing partnerships.',
      },
    ],
  },
  {
    title: 'Pricing & Support',
    faqs: [
      {
        question: 'Is there a free trial?',
        answer: 'Yes. We offer a free pilot period so you can run real shows and see results before committing. Book a demo and we\'ll set you up with full access to test the platform with your actual products and audience.',
      },
      {
        question: 'What pricing options are available?',
        answer: 'We offer flexible pricing based on your needs—contact us for a custom quote. Plans typically include a base fee plus usage-based components. No long-term contracts required.',
      },
      {
        question: 'What kind of support do you offer?',
        answer: 'All plans include email support and access to our knowledge base. Premium plans include dedicated success managers, live chat support, and help with show strategy and optimization.',
      },
      {
        question: 'Can I add team members to my account?',
        answer: 'Yes. Invite unlimited team members with role-based permissions. Assign hosts, editors, and admins with appropriate access levels.',
      },
    ],
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<string | null>('0-0');

  return (
    <section id="faq" className="py-24 px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-pink-500 text-sm font-semibold tracking-wide uppercase mb-4">FAQ</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-500">
            Everything you need to know about live shopping and shoppable video.
          </p>
        </div>

        <div className="space-y-12">
          {faqCategories.map((category, catIndex) => (
            <div key={catIndex}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center text-pink-500 text-sm font-bold">
                  {catIndex + 1}
                </span>
                {category.title}
              </h3>
              <div className="space-y-3">
                {category.faqs.map((faq, faqIndex) => {
                  const key = `${catIndex}-${faqIndex}`;
                  const isOpen = openIndex === key;
                  return (
                    <div
                      key={faqIndex}
                      className={`bg-white rounded-xl overflow-hidden transition-all duration-200 shadow-sm ${
                        isOpen ? 'ring-1 ring-pink-200' : ''
                      }`}
                    >
                      <button
                        className="w-full px-6 py-4 flex items-center justify-between text-left"
                        onClick={() => setOpenIndex(isOpen ? null : key)}
                        aria-expanded={isOpen}
                      >
                        <span className="font-medium text-gray-900 pr-8 text-sm">{faq.question}</span>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          isOpen ? 'bg-pink-100' : 'bg-gray-100'
                        }`}>
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isOpen ? 'rotate-180 text-pink-500' : 'text-gray-400'
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </button>

                      <div
                        className={`overflow-hidden transition-all duration-200 ${
                          isOpen ? 'max-h-96' : 'max-h-0'
                        }`}
                      >
                        <div className="px-6 pb-5">
                          <p className="text-gray-500 leading-relaxed text-sm">{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
