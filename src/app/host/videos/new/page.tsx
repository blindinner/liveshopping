'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Product } from '@/types/database';

interface ShopifyProduct {
  shopify_product_id: string;
  shopify_variant_id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
}

export default function NewVideoPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [brandId, setBrandId] = useState<string | null>(null);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [cloudflareStreamId, setCloudflareStreamId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Product search
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productSearch, setProductSearch] = useState('');

  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadBrand = async () => {
      const response = await fetch('/api/brands');
      const data = await response.json();
      if (data.brands?.[0]) {
        setBrandId(data.brands[0].id);
      }
    };

    const loadProducts = async () => {
      try {
        const response = await fetch('/api/shopify/products');
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadBrand();
    loadProducts();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get upload URL from our API
      const urlResponse = await fetch('/api/videos/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: title || file.name }),
      });

      if (!urlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uid, uploadUrl } = await urlResponse.json();
      setCloudflareStreamId(uid);

      // Upload directly to Cloudflare using TUS
      await uploadWithProgress(file, uploadUrl);

      setUploadProgress(100);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadWithProgress = async (file: File, uploadUrl: string) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percent);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload failed')));

      // Cloudflare Stream expects multipart form-data with a 'file' field
      const formData = new FormData();
      formData.append('file', file);

      xhr.open('POST', uploadUrl);
      xhr.send(formData);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !cloudflareStreamId || !brandId) return;

    setIsCreating(true);

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          title,
          description: description || null,
          productId: selectedProduct?.id || null,
          cloudflareStreamId,
        }),
      });

      if (response.ok) {
        const { video } = await response.json();
        router.push(`/host/videos/${video.id}/edit`);
      } else {
        throw new Error('Failed to create video');
      }
    } catch (error) {
      console.error('Failed to create video:', error);
      alert('Failed to create video. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectProduct = async (shopifyProduct: ShopifyProduct) => {
    if (!brandId) return;

    // Create or find product in our database
    try {
      const response = await fetch(`/api/shopify/products`, {
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

      if (response.ok) {
        const { product } = await response.json();
        setSelectedProduct(product);
      }
    } catch (error) {
      console.error('Failed to select product:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 border-b border-white/10">
        <Link href="/host/videos" className="text-white/60 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-white">Upload Video</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 max-w-2xl mx-auto space-y-6">
        {/* Video Upload */}
        <section className="bg-white/5 rounded-2xl p-4">
          <h2 className="text-base font-semibold text-white mb-4">Video File</h2>

          {!cloudflareStreamId ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                ${isUploading ? 'border-pink-500/50 bg-pink-500/5' : 'border-white/20 hover:border-white/40 hover:bg-white/5'}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />

              {isUploading ? (
                <div className="space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-pink-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-pink-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">Uploading...</p>
                    <p className="text-white/50 text-sm">{uploadProgress}%</p>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-pink-500 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-white font-medium">Click to upload video</p>
                  <p className="text-white/50 text-sm mt-1">MP4, MOV, or WebM up to 1 hour</p>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Video uploaded</p>
                <p className="text-white/50 text-sm">Processing will begin after you save</p>
              </div>
            </div>
          )}
        </section>

        {/* Video Details */}
        <section className="bg-white/5 rounded-2xl p-4 space-y-4">
          <h2 className="text-base font-semibold text-white">Video Details</h2>

          <Input
            name="title"
            label="Title"
            placeholder="e.g., Summer Collection Preview"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-white/70 text-sm mb-1.5">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your video..."
              rows={3}
              className="w-full bg-black/30 text-white text-sm rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/50 placeholder:text-white/30 border border-white/10"
            />
          </div>
        </section>

        {/* Product Selection */}
        <section className="bg-white/5 rounded-2xl p-4">
          <h2 className="text-base font-semibold text-white mb-4">Featured Product</h2>

          {selectedProduct ? (
            <div className="flex items-center gap-3 p-3 bg-pink-500/10 border border-pink-500/30 rounded-xl">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/10 shrink-0">
                {selectedProduct.image_url ? (
                  <Image
                    src={selectedProduct.image_url}
                    alt={selectedProduct.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{selectedProduct.title}</p>
                <p className="text-white/60 text-sm">{selectedProduct.currency} {selectedProduct.price}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <Input
                name="search"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />

              <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
                {isLoadingProducts ? (
                  <div className="text-center py-4">
                    <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-center py-4 text-white/50 text-sm">No products found</p>
                ) : (
                  filteredProducts.slice(0, 10).map((product) => (
                    <button
                      key={product.shopify_variant_id}
                      type="button"
                      onClick={() => selectProduct(product)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left"
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/10 shrink-0">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{product.title}</p>
                        <p className="text-white/50 text-xs">{product.currency} {product.price}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </section>

        {/* Submit */}
        <Button
          type="submit"
          isLoading={isCreating}
          disabled={!title || !cloudflareStreamId || !brandId}
          className="w-full"
        >
          Create Video
        </Button>
      </form>
    </main>
  );
}
