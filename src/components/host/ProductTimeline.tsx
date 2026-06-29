'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatTime } from '@/hooks/useVideoProducts';
import type { VideoProduct } from '@/types/database';

interface ShopifyProduct {
  shopify_product_id: string;
  shopify_variant_id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
}

interface ProductTimelineProps {
  videoId: string;
  brandId: string;
  videoDuration: number | null;
  onProductsChange?: (products: VideoProduct[]) => void;
}

export function ProductTimeline({
  videoId,
  brandId,
  videoDuration,
  onProductsChange,
}: ProductTimelineProps) {
  const [videoProducts, setVideoProducts] = useState<VideoProduct[]>([]);
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const duration = videoDuration || 60;

  useEffect(() => {
    const loadVideoProducts = async () => {
      try {
        const response = await fetch(`/api/videos/${videoId}/products`);
        const data = await response.json();
        setVideoProducts(data.videoProducts || []);
        onProductsChange?.(data.videoProducts || []);
      } catch (error) {
        console.error('Failed to load video products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const loadShopifyProducts = async () => {
      try {
        const response = await fetch('/api/shopify/products');
        const data = await response.json();
        setShopifyProducts(data.products || []);
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };

    loadVideoProducts();
    loadShopifyProducts();
  }, [videoId, onProductsChange]);

  const addProduct = async (shopifyProduct: ShopifyProduct) => {
    setIsAdding(true);
    try {
      // First create/get product in our database
      const productResponse = await fetch('/api/shopify/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          shopifyProductId: shopifyProduct.shopify_product_id,
          shopifyVariantId: shopifyProduct.shopify_variant_id,
          title: shopifyProduct.title,
          price: shopifyProduct.price,
          currency: shopifyProduct.currency,
          imageUrl: shopifyProduct.image_url,
        }),
      });

      if (!productResponse.ok) throw new Error('Failed to create product');
      const { product } = await productResponse.json();

      // Then add to video
      const response = await fetch(`/api/videos/${videoId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          startTimeSeconds: 0,
          endTimeSeconds: null,
          displayOrder: videoProducts.length,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.error?.includes('already added')) {
          alert('This product is already in the video');
          return;
        }
        throw new Error('Failed to add product');
      }

      const { videoProduct } = await response.json();
      const updated = [...videoProducts, videoProduct];
      setVideoProducts(updated);
      onProductsChange?.(updated);
      setShowProductSelector(false);
    } catch (error) {
      console.error('Failed to add product:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const updateProduct = async (productId: string, updates: Partial<VideoProduct>) => {
    try {
      const response = await fetch(`/api/videos/${videoId}/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update');

      const { videoProduct } = await response.json();
      const updated = videoProducts.map(vp =>
        vp.product_id === productId ? videoProduct : vp
      );
      setVideoProducts(updated);
      onProductsChange?.(updated);
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const removeProduct = async (productId: string) => {
    try {
      await fetch(`/api/videos/${videoId}/products/${productId}`, {
        method: 'DELETE',
      });

      const updated = videoProducts.filter(vp => vp.product_id !== productId);
      setVideoProducts(updated);
      onProductsChange?.(updated);
    } catch (error) {
      console.error('Failed to remove product:', error);
    }
  };

  const filteredProducts = shopifyProducts.filter(p =>
    p.title.toLowerCase().includes(productSearch.toLowerCase()) &&
    !videoProducts.some(vp => vp.product?.shopify_variant_id === p.shopify_variant_id)
  );

  if (isLoading) {
    return (
      <div className="bg-white/5 rounded-2xl p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="h-20 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Products Timeline</h2>
          <p className="text-white/50 text-xs mt-0.5">
            {videoProducts.length === 0
              ? 'Add products that appear in the video'
              : videoProducts.length === 1
              ? 'Single product - always visible'
              : `${videoProducts.length} products with timestamps`}
          </p>
        </div>
        <button
          onClick={() => setShowProductSelector(!showProductSelector)}
          className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Product selector */}
      {showProductSelector && (
        <div className="bg-black/30 rounded-xl p-3 border border-white/10">
          <input
            type="text"
            placeholder="Search products..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="w-full bg-black/30 text-white text-sm rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-1 focus:ring-pink-500/50 placeholder:text-white/30 border border-white/10"
          />
          <div className="max-h-48 overflow-y-auto space-y-1">
            {filteredProducts.slice(0, 10).map((product) => (
              <button
                key={product.shopify_variant_id}
                onClick={() => addProduct(product)}
                disabled={isAdding}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left disabled:opacity-50"
              >
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/10 shrink-0">
                  {product.image_url && (
                    <Image src={product.image_url} alt={product.title} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{product.title}</p>
                  <p className="text-white/50 text-xs">{product.currency} {product.price}</p>
                </div>
              </button>
            ))}
            {filteredProducts.length === 0 && (
              <p className="text-white/50 text-sm text-center py-2">No products found</p>
            )}
          </div>
        </div>
      )}

      {/* Timeline visualization */}
      {videoProducts.length > 0 && (
        <div className="space-y-3">
          {/* Timeline bar */}
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            {videoProducts.map((vp) => {
              const start = vp.start_time_seconds || 0;
              const end = vp.end_time_seconds ?? duration;
              const width = ((end - start) / duration) * 100;
              const left = (start / duration) * 100;

              return (
                <div
                  key={vp.id}
                  className="absolute h-full bg-pink-500/70"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                  }}
                  title={`${vp.product?.title}: ${formatTime(start)} - ${formatTime(end)}`}
                />
              );
            })}
          </div>

          {/* Time markers */}
          <div className="flex justify-between text-white/40 text-xs">
            <span>0:00</span>
            <span>{formatTime(duration / 2)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {/* Product list */}
      <div className="space-y-2">
        {videoProducts.map((vp) => (
          <div
            key={vp.id}
            className="flex items-center gap-3 p-3 bg-black/20 rounded-xl"
          >
            {/* Product image */}
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/10 shrink-0">
              {vp.product?.image_url && (
                <Image src={vp.product.image_url} alt={vp.product.title} fill className="object-cover" />
              )}
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{vp.product?.title}</p>
              <div className="flex items-center gap-2 mt-1">
                {videoProducts.length > 1 ? (
                  <>
                    {/* Start time */}
                    <div className="flex items-center gap-1">
                      <span className="text-white/40 text-xs">Start:</span>
                      <input
                        type="number"
                        min={0}
                        max={duration}
                        value={vp.start_time_seconds || 0}
                        onChange={(e) =>
                          updateProduct(vp.product_id, {
                            start_time_seconds: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-14 bg-black/30 text-white text-xs rounded px-1.5 py-0.5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-pink-500/50"
                      />
                      <span className="text-white/40 text-xs">s</span>
                    </div>

                    {/* End time */}
                    <div className="flex items-center gap-1">
                      <span className="text-white/40 text-xs">End:</span>
                      <input
                        type="number"
                        min={vp.start_time_seconds || 0}
                        max={duration}
                        value={vp.end_time_seconds ?? ''}
                        placeholder="∞"
                        onChange={(e) =>
                          updateProduct(vp.product_id, {
                            end_time_seconds: e.target.value ? parseInt(e.target.value) : null,
                          })
                        }
                        className="w-14 bg-black/30 text-white text-xs rounded px-1.5 py-0.5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-pink-500/50 placeholder:text-white/30"
                      />
                      <span className="text-white/40 text-xs">s</span>
                    </div>
                  </>
                ) : (
                  <span className="text-white/50 text-xs">Always visible</span>
                )}
              </div>
            </div>

            {/* Remove button */}
            <button
              onClick={() => removeProduct(vp.product_id)}
              className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {videoProducts.length === 0 && !showProductSelector && (
        <div className="text-center py-8 text-white/40">
          <svg className="w-10 h-10 mx-auto mb-2 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p>No products added yet</p>
          <p className="text-xs mt-1">Click &quot;Add Product&quot; to feature products in this video</p>
        </div>
      )}
    </div>
  );
}
