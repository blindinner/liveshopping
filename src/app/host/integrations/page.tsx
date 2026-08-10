'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

type WidgetType = 'carousel' | 'product-carousel';

interface WidgetConfig {
  type: WidgetType;
  brandId?: string;
  layout?: 'horizontal' | 'grid';
  title?: string;
  productCarouselTitle?: string;
  thumbnailWidth?: number;
  showTitle?: boolean;
}

export default function IntegrationsPage() {
  const [brandId, setBrandId] = useState<string | null>(null);
  const [brandDomain, setBrandDomain] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [shopDomain, setShopDomain] = useState('');
  const [selectedWidget, setSelectedWidget] = useState<WidgetType>('carousel');
  const [config, setConfig] = useState<WidgetConfig>({
    type: 'carousel',
    layout: 'horizontal',
    title: 'Shop Our Videos',
    thumbnailWidth: 160,
    showTitle: true,
    productCarouselTitle: 'Seen in Action',
  });
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const brandsRes = await fetch('/api/brands');
        const brandsData = await brandsRes.json();

        if (brandsData.brands?.[0]) {
          setBrandId(brandsData.brands[0].id);
          setBrandDomain(brandsData.brands[0].shopify_domain || null);
          setConfig((c) => ({ ...c, brandId: brandsData.brands[0].id }));
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleConnectShopify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopDomain) return;

    let domain = shopDomain.trim().toLowerCase();
    domain = domain.replace(/^https?:\/\//, '');
    domain = domain.replace(/\/+$/, '');

    if (!domain.includes('.myshopify.com')) {
      domain = `${domain}.myshopify.com`;
    }

    window.location.href = `/api/shopify/auth?shop=${encodeURIComponent(domain)}`;
  };

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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      bestFor: 'Homepage, Collection pages',
    },
    {
      type: 'product-carousel' as WidgetType,
      title: 'Product Carousel',
      description: 'Shows all videos featuring a specific product',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      bestFor: 'Product detail pages (Shopify)',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Connect Shopify Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Connect Shopify Store</h2>
            <form onSubmit={handleConnectShopify} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Your Shopify store URL
                </label>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="your-store"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                    className="flex-1 bg-white/10 border border-white/20 rounded-l-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-pink-500"
                    required
                  />
                  <span className="bg-white/5 border border-l-0 border-white/20 rounded-r-lg px-3 py-3 text-white/40 text-sm">
                    .myshopify.com
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowConnectModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Connect
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Integrations & Widgets</h1>
        <p className="text-white/60 mt-1">Connect your store and get embed codes</p>
      </div>

      {/* Store Connection */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Store Connection</h2>
        {!brandDomain ? (
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Connect Your Store</h3>
                <p className="text-white/60 text-sm mt-1">
                  Connect your Shopify store to start creating shoppable videos
                </p>
              </div>
              <Button onClick={() => setShowConnectModal(true)} size="sm">
                Connect Shopify
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">Store Connected</h3>
                  <p className="text-white/50 text-sm">{brandDomain}</p>
                </div>
              </div>
              <button
                onClick={() => setShowConnectModal(true)}
                className="text-sm text-white/40 hover:text-white"
              >
                Change
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Widget Embed Codes */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">Embed Widgets</h2>
        <p className="text-white/60 mb-6 text-sm">
          Choose a widget type and customize it for your website.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Widget selector */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-white">Widget Type</h3>
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
              <h3 className="text-base font-medium text-white">Configuration</h3>

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
            <h3 className="text-base font-medium text-white">Embed Code</h3>

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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
