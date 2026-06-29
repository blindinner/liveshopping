'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Video } from '@/types/database';

type WidgetType = 'carousel' | 'floating' | 'pdp' | 'product-carousel';

interface WidgetConfig {
  type: WidgetType;
  brandId?: string;
  videoId?: string;
  shopifyProductId?: string;
  // Carousel options
  layout?: 'horizontal' | 'grid';
  title?: string;
  // Product carousel options
  productCarouselTitle?: string;
  thumbnailWidth?: number;
  showTitle?: boolean;
  // Floating options
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  // PDP options
  autoplay?: boolean;
  loop?: boolean;
  width?: string;
  maxWidth?: string;
}

export default function WidgetsPage() {
  const [brandId, setBrandId] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<WidgetType>('carousel');
  const [config, setConfig] = useState<WidgetConfig>({
    type: 'carousel',
    layout: 'horizontal',
    title: 'Shop Our Videos',
    thumbnailWidth: 160,
    showTitle: true,
    position: 'bottom-right',
    autoplay: true,
    loop: true,
    width: '100%',
    maxWidth: '400px',
    shopifyProductId: '',
    productCarouselTitle: 'Seen in Action',
  });
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [brandsRes, videosRes] = await Promise.all([
          fetch('/api/brands'),
          fetch('/api/videos'),
        ]);

        const brandsData = await brandsRes.json();
        const videosData = await videosRes.json();

        if (brandsData.brands?.[0]) {
          setBrandId(brandsData.brands[0].id);
          setConfig((c) => ({ ...c, brandId: brandsData.brands[0].id }));
        }

        setVideos(videosData.videos || []);
        if (videosData.videos?.[0]) {
          setConfig((c) => ({ ...c, videoId: videosData.videos[0].id }));
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getEmbedCode = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    switch (selectedWidget) {
      case 'carousel':
        return `<script
  src="${baseUrl}/widgets/carousel.js"
  data-brand-id="${config.brandId || brandId}"
  data-layout="${config.layout}"
  data-title="${config.title}"
  data-thumbnail-width="${config.thumbnailWidth}"
  data-show-title="${config.showTitle}"
></script>`;

      case 'floating':
        return `<script
  src="${baseUrl}/widgets/floating.js"
  data-brand-id="${config.brandId || brandId}"
  data-position="${config.position}"
></script>`;

      case 'pdp':
        return `<script
  src="${baseUrl}/widgets/pdp.js"
  data-video-id="${config.videoId}"
  data-autoplay="${config.autoplay}"
  data-loop="${config.loop}"
  data-width="${config.width}"
  data-max-width="${config.maxWidth}"
></script>`;

      case 'product-carousel':
        return `<!-- Add this to your Shopify product template (e.g., sections/main-product.liquid) -->
<script
  src="${baseUrl}/widgets/product-carousel.js"
  data-shopify-product-id="{{ product.id }}"
  data-title="${config.productCarouselTitle}"
></script>`;

      default:
        return '';
    }
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const widgets = [
    {
      type: 'carousel' as WidgetType,
      title: 'Video Carousel',
      description: 'A horizontal or grid carousel of shoppable videos',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
      bestFor: 'Homepage, Collection pages',
    },
    {
      type: 'floating' as WidgetType,
      title: 'Floating Bubble',
      description: 'A floating video bubble that expands on click',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      bestFor: 'Any page, Always visible',
    },
    {
      type: 'pdp' as WidgetType,
      title: 'PDP Video',
      description: 'Single video embed for product detail pages',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
      bestFor: 'Product pages',
    },
    {
      type: 'product-carousel' as WidgetType,
      title: 'Product Carousel',
      description: 'Shows all videos featuring a specific product',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
      bestFor: 'Product detail pages (Shopify)',
    },
  ];

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link href="/host" className="text-white/60 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-white">Embed Widgets</h1>
        </div>
      </header>

      <div className="p-4 max-w-5xl mx-auto">
        <p className="text-white/60 mb-6">
          Choose a widget type and customize it for your website.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Widget selector */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-white">Widget Type</h2>
            <div className="space-y-3">
              {widgets.map((widget) => (
                <button
                  key={widget.type}
                  onClick={() => {
                    setSelectedWidget(widget.type);
                    setConfig((c) => ({ ...c, type: widget.type }));
                  }}
                  className={`w-full p-4 rounded-xl border transition-all text-left flex items-start gap-4 ${
                    selectedWidget === widget.type
                      ? 'bg-pink-500/20 border-pink-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      selectedWidget === widget.type ? 'bg-pink-500 text-white' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {widget.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{widget.title}</p>
                    <p className="text-white/50 text-sm mt-1">{widget.description}</p>
                    <p className="text-pink-400 text-xs mt-2">Best for: {widget.bestFor}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Configuration options */}
            <div className="bg-white/5 rounded-xl p-4 space-y-4 border border-white/10">
              <h3 className="text-base font-semibold text-white">Configuration</h3>

              {selectedWidget === 'carousel' && (
                <>
                  <div>
                    <label className="block text-white/70 text-sm mb-1.5">Layout</label>
                    <select
                      value={config.layout}
                      onChange={(e) => setConfig({ ...config, layout: e.target.value as 'horizontal' | 'grid' })}
                      className="w-full bg-black/30 text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:ring-1 focus:ring-pink-500/50"
                    >
                      <option value="horizontal">Horizontal Scroll</option>
                      <option value="grid">Grid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1.5">Section Title</label>
                    <input
                      type="text"
                      value={config.title}
                      onChange={(e) => setConfig({ ...config, title: e.target.value })}
                      className="w-full bg-black/30 text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:ring-1 focus:ring-pink-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1.5">Thumbnail Width (px)</label>
                    <input
                      type="number"
                      value={config.thumbnailWidth}
                      onChange={(e) => setConfig({ ...config, thumbnailWidth: parseInt(e.target.value) || 160 })}
                      className="w-full bg-black/30 text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:ring-1 focus:ring-pink-500/50"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showTitle}
                      onChange={(e) => setConfig({ ...config, showTitle: e.target.checked })}
                      className="rounded border-white/20 bg-black/30 text-pink-500 focus:ring-pink-500/50"
                    />
                    <span className="text-white/70 text-sm">Show video titles on thumbnails</span>
                  </label>
                </>
              )}

              {selectedWidget === 'floating' && (
                <div>
                  <label className="block text-white/70 text-sm mb-1.5">Position</label>
                  <select
                    value={config.position}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        position: e.target.value as 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left',
                      })
                    }
                    className="w-full bg-black/30 text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:ring-1 focus:ring-pink-500/50"
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                  </select>
                </div>
              )}

              {selectedWidget === 'pdp' && (
                <>
                  <div>
                    <label className="block text-white/70 text-sm mb-1.5">Video</label>
                    <select
                      value={config.videoId}
                      onChange={(e) => setConfig({ ...config, videoId: e.target.value })}
                      className="w-full bg-black/30 text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:ring-1 focus:ring-pink-500/50"
                    >
                      {videos.map((video) => (
                        <option key={video.id} value={video.id}>
                          {video.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white/70 text-sm mb-1.5">Width</label>
                      <input
                        type="text"
                        value={config.width}
                        onChange={(e) => setConfig({ ...config, width: e.target.value })}
                        className="w-full bg-black/30 text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:ring-1 focus:ring-pink-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-1.5">Max Width</label>
                      <input
                        type="text"
                        value={config.maxWidth}
                        onChange={(e) => setConfig({ ...config, maxWidth: e.target.value })}
                        className="w-full bg-black/30 text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:ring-1 focus:ring-pink-500/50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.autoplay}
                        onChange={(e) => setConfig({ ...config, autoplay: e.target.checked })}
                        className="rounded border-white/20 bg-black/30 text-pink-500 focus:ring-pink-500/50"
                      />
                      <span className="text-white/70 text-sm">Autoplay</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.loop}
                        onChange={(e) => setConfig({ ...config, loop: e.target.checked })}
                        className="rounded border-white/20 bg-black/30 text-pink-500 focus:ring-pink-500/50"
                      />
                      <span className="text-white/70 text-sm">Loop</span>
                    </label>
                  </div>
                </>
              )}

              {selectedWidget === 'product-carousel' && (
                <>
                  <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3">
                    <p className="text-pink-300 text-sm">
                      This widget automatically shows videos linked to each product. Just add the code once to your Shopify product template.
                    </p>
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1.5">Section Title</label>
                    <input
                      type="text"
                      value={config.productCarouselTitle}
                      onChange={(e) => setConfig({ ...config, productCarouselTitle: e.target.value })}
                      className="w-full bg-black/30 text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:ring-1 focus:ring-pink-500/50"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Embed code */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-white">Embed Code</h2>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-white/50 text-sm mb-4">
                Copy this code and paste it into your website where you want the widget to appear.
              </p>

              <div className="relative">
                <pre className="bg-black/30 rounded-xl p-4 text-sm text-white/70 overflow-x-auto border border-white/10 whitespace-pre-wrap">
                  {getEmbedCode()}
                </pre>
                <button
                  onClick={copyEmbedCode}
                  className="absolute top-2 right-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Preview info */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="text-base font-semibold text-white mb-3">Preview</h3>
              <p className="text-white/50 text-sm mb-4">
                The widget will load your videos and display them on your website. Here&apos;s what to expect:
              </p>

              {selectedWidget === 'carousel' && (
                <ul className="text-white/70 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-pink-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Displays all published videos as thumbnails
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-pink-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Click to open video in modal with products
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-pink-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Swipe or scroll to browse videos
                  </li>
                </ul>
              )}

              {selectedWidget === 'floating' && (
                <ul className="text-white/70 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-pink-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Shows as a small bubble on the corner
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-pink-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Click to expand into full player
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-pink-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Navigate between videos with dots
                  </li>
                </ul>
              )}

              {selectedWidget === 'pdp' && (
                <ul className="text-white/70 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-pink-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Displays a single shoppable video
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-pink-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Products overlay appears during playback
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-pink-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Perfect for product detail pages
                  </li>
                </ul>
              )}

              {selectedWidget === 'product-carousel' && (
                <ul className="text-white/70 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-pink-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Automatically shows videos you linked to each product
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-pink-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Add once to Shopify theme, works for all products
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-pink-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Only displays if videos exist for the product
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 text-pink-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Shopify fills in the product ID automatically
                  </li>
                </ul>
              )}
            </div>

            {/* Test link */}
            {selectedWidget === 'pdp' && config.videoId && (
              <Link
                href={`/embed/video/${config.videoId}`}
                target="_blank"
                className="inline-flex items-center gap-2 text-pink-400 text-sm hover:text-pink-300"
              >
                Preview selected video
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
