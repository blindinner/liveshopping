'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import type { ShowProduct } from '@/types/database';

interface ShopifyProduct {
  shopify_product_id: string;
  shopify_variant_id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
  available: boolean;
}

interface ManualProductForm {
  title: string;
  price: string;
  currency: string;
  imageUrl: string;
  checkoutUrl: string;
}

const emptyManualProduct: ManualProductForm = {
  title: '',
  price: '',
  currency: 'ILS',
  imageUrl: '',
  checkoutUrl: '',
};

interface ProductStagingProps {
  showId: string;
  brandId: string | null;
  showProducts: ShowProduct[];
  onProductsChange: (products: ShowProduct[]) => void;
  activeProductId?: string;
  onSelectActive: (productId: string, activate: boolean) => void;
  isTogglingProduct?: boolean;
}

export function ProductStaging({
  showId,
  brandId,
  showProducts,
  onProductsChange,
  activeProductId,
  onSelectActive,
  isTogglingProduct,
}: ProductStagingProps) {
  const [storeProducts, setStoreProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualProduct, setManualProduct] = useState<ManualProductForm>(emptyManualProduct);
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);

  // Load all products from store on mount
  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch('/api/shopify/products');
        const data = await response.json();
        setStoreProducts(data.products || []);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Check if a store product is already in the shortlist
  const isInShortlist = useCallback(
    (shopifyProductId: string) => {
      return showProducts.some(
        (sp) => sp.product?.shopify_product_id === shopifyProductId
      );
    },
    [showProducts]
  );

  // Add product to shortlist
  const addToShortlist = async (product: ShopifyProduct) => {
    if (!brandId) return;
    setIsAdding(product.shopify_product_id);

    try {
      const response = await fetch(`/api/shows/${showId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopifyProductId: product.shopify_product_id,
          shopifyVariantId: product.shopify_variant_id,
          title: product.title,
          price: product.price,
          currency: product.currency,
          imageUrl: product.image_url,
          brandId,
          displayOrder: showProducts.length,
        }),
      });

      if (response.ok) {
        const { showProduct } = await response.json();
        onProductsChange([...showProducts, showProduct]);
      }
    } catch (error) {
      console.error('Failed to add product:', error);
    } finally {
      setIsAdding(null);
    }
  };

  // Remove product from shortlist
  const removeFromShortlist = async (showProductId: string) => {
    try {
      await fetch(`/api/shows/${showId}/products/${showProductId}`, {
        method: 'DELETE',
      });
      onProductsChange(showProducts.filter((sp) => sp.id !== showProductId));
    } catch (error) {
      console.error('Failed to remove product:', error);
    }
  };

  // Move product up in order
  const moveUp = async (index: number) => {
    if (index === 0) return;
    const newProducts = [...showProducts];
    [newProducts[index - 1], newProducts[index]] = [newProducts[index], newProducts[index - 1]];
    await updateOrder(newProducts);
  };

  // Move product down in order
  const moveDown = async (index: number) => {
    if (index === showProducts.length - 1) return;
    const newProducts = [...showProducts];
    [newProducts[index], newProducts[index + 1]] = [newProducts[index + 1], newProducts[index]];
    await updateOrder(newProducts);
  };

  // Update display order on server
  const updateOrder = async (newProducts: ShowProduct[]) => {
    onProductsChange(newProducts);

    // Update order on server
    try {
      await Promise.all(
        newProducts.map((sp, index) =>
          fetch(`/api/shows/${showId}/products/${sp.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ display_order: index }),
          })
        )
      );
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  // Open notes editor
  const startEditingNotes = (sp: ShowProduct) => {
    setEditingNotesId(sp.id);
    setNotesValue(sp.host_notes || '');
  };

  // Save notes
  const saveNotes = async () => {
    if (!editingNotesId) return;

    try {
      await fetch(`/api/shows/${showId}/products/${editingNotesId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host_notes: notesValue || null }),
      });

      onProductsChange(
        showProducts.map((sp) =>
          sp.id === editingNotesId
            ? { ...sp, host_notes: notesValue || null }
            : sp
        )
      );
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setEditingNotesId(null);
      setNotesValue('');
    }
  };

  // Cancel notes editing
  const cancelEditingNotes = () => {
    setEditingNotesId(null);
    setNotesValue('');
  };

  // Add manual product
  const addManualProduct = async () => {
    if (!brandId || !manualProduct.title || !manualProduct.price) return;
    setIsAddingManual(true);

    try {
      const response = await fetch(`/api/shows/${showId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: manualProduct.title,
          price: parseFloat(manualProduct.price),
          currency: manualProduct.currency,
          imageUrl: manualProduct.imageUrl || null,
          checkoutUrl: manualProduct.checkoutUrl || null,
          brandId,
          source: 'manual',
          displayOrder: showProducts.length,
        }),
      });

      if (response.ok) {
        const { showProduct } = await response.json();
        onProductsChange([...showProducts, showProduct]);
        setManualProduct(emptyManualProduct);
        setShowManualForm(false);
      }
    } catch (error) {
      console.error('Failed to add manual product:', error);
    } finally {
      setIsAddingManual(false);
    }
  };

  // Parse and upload CSV
  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !brandId) return;

    setIsUploadingCsv(true);
    setCsvError(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        setCsvError('CSV must have a header row and at least one product');
        return;
      }

      // Parse header to find column indices
      const header = lines[0].split(',').map(h => h.trim().toLowerCase());
      const titleIdx = header.findIndex(h => h === 'title' || h === 'name' || h === 'product');
      const priceIdx = header.findIndex(h => h === 'price');
      const currencyIdx = header.findIndex(h => h === 'currency');
      const imageIdx = header.findIndex(h => h === 'image' || h === 'image_url' || h === 'imageurl');
      const checkoutIdx = header.findIndex(h => h === 'checkout' || h === 'checkout_url' || h === 'checkouturl' || h === 'url' || h === 'link');

      if (titleIdx === -1 || priceIdx === -1) {
        setCsvError('CSV must have "title" and "price" columns');
        return;
      }

      // Parse rows
      const products: ManualProductForm[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length <= Math.max(titleIdx, priceIdx)) continue;

        const title = values[titleIdx]?.trim();
        const price = values[priceIdx]?.trim();

        if (!title || !price) continue;

        products.push({
          title,
          price,
          currency: currencyIdx !== -1 ? values[currencyIdx]?.trim() || 'ILS' : 'ILS',
          imageUrl: imageIdx !== -1 ? values[imageIdx]?.trim() || '' : '',
          checkoutUrl: checkoutIdx !== -1 ? values[checkoutIdx]?.trim() || '' : '',
        });
      }

      if (products.length === 0) {
        setCsvError('No valid products found in CSV');
        return;
      }

      // Add products one by one
      const newProducts: typeof showProducts = [];
      for (const product of products) {
        const response = await fetch(`/api/shows/${showId}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: product.title,
            price: parseFloat(product.price),
            currency: product.currency,
            imageUrl: product.imageUrl || null,
            checkoutUrl: product.checkoutUrl || null,
            brandId,
            source: 'manual',
            displayOrder: showProducts.length + newProducts.length,
          }),
        });

        if (response.ok) {
          const { showProduct } = await response.json();
          newProducts.push(showProduct);
        }
      }

      if (newProducts.length > 0) {
        onProductsChange([...showProducts, ...newProducts]);
      }

      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('Failed to parse CSV:', error);
      setCsvError('Failed to parse CSV file');
    } finally {
      setIsUploadingCsv(false);
    }
  };

  // Helper to parse CSV line (handles quoted values with commas)
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  return (
    <div className="space-y-6">
      {/* Shortlisted Products - Show Queue */}
      <section className="bg-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Show Queue</h2>
            <p className="text-white/50 text-xs mt-0.5">
              Products staged for this show, in display order
            </p>
          </div>
          <span className="text-white/40 text-sm">{showProducts.length} products</span>
        </div>

        {showProducts.length === 0 ? (
          <div className="text-center py-8 text-white/50">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-white/20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p>No products in queue</p>
            <p className="text-xs mt-1">Add products from your store below</p>
          </div>
        ) : (
          <div className="space-y-2">
            {showProducts.map((sp, index) => {
              const isActive = sp.id === activeProductId || sp.is_active;

              return (
                <div key={sp.id} className="space-y-2">
                  <div
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-pink-500/20 border border-pink-500/30'
                        : 'bg-black/20 hover:bg-black/30'
                    }`}
                  >
                    <span className="text-white/40 text-sm font-mono w-5 text-center">
                      {index + 1}
                    </span>

                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === showProducts.length - 1}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/10 shrink-0">
                      {sp.product?.image_url ? (
                        <Image
                          src={sp.product.image_url}
                          alt={sp.product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/40">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-white text-sm font-medium truncate">
                          {sp.product?.title}
                        </p>
                        {sp.product?.source === 'manual' && (
                          <span className="shrink-0 px-1.5 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-medium rounded">
                            Manual
                          </span>
                        )}
                      </div>
                      <p className="text-white/60 text-xs">
                        {sp.product?.currency} {sp.product?.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditingNotes(sp)}
                        className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                          sp.host_notes
                            ? 'text-yellow-400 hover:bg-yellow-500/10'
                            : 'text-white/50 hover:text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {sp.host_notes ? 'Edit notes' : 'Add notes'}
                      </button>
                      <button
                        onClick={() => onSelectActive(sp.id, !isActive)}
                        disabled={isTogglingProduct}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-pink-500 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        {isActive ? 'On Screen' : 'Show'}
                      </button>
                      <button
                        onClick={() => removeFromShortlist(sp.id)}
                        className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove from queue"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {editingNotesId === sp.id && (
                    <div className="p-3 bg-black/30 rounded-xl border border-white/10">
                      <textarea
                        value={notesValue}
                        onChange={(e) => setNotesValue(e.target.value)}
                        placeholder="Add talking points, key features, pricing info..."
                        className="w-full bg-black/30 text-white text-sm rounded-lg p-3 resize-none focus:outline-none focus:ring-1 focus:ring-pink-500/50 placeholder:text-white/30"
                        rows={4}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={cancelEditingNotes}
                          className="px-3 py-1.5 text-white/60 hover:text-white text-sm transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveNotes}
                          className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-sm rounded-lg transition-colors"
                        >
                          Save Notes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add Manual Product */}
      <section className="bg-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Manual Products</h2>
            <p className="text-white/50 text-xs mt-0.5">
              Add products not from your Shopify store
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const template = 'title,price,currency,image_url,checkout_url\nExample Product,99.99,ILS,https://example.com/image.jpg,https://example.com/buy\n';
                const blob = new Blob([template], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'products_template.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Template
            </button>
            <label className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {isUploadingCsv ? 'Uploading...' : 'Upload CSV'}
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                disabled={isUploadingCsv}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setShowManualForm(!showManualForm)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {showManualForm ? 'Cancel' : 'Add One'}
            </button>
          </div>
        </div>

        {csvError && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
            {csvError}
          </div>
        )}

        {showManualForm && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-white/70 text-xs mb-1">Product Name *</label>
                <input
                  type="text"
                  value={manualProduct.title}
                  onChange={(e) => setManualProduct({ ...manualProduct, title: e.target.value })}
                  placeholder="Enter product name"
                  className="w-full bg-black/30 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500/50 placeholder:text-white/30 border border-white/10"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-white/70 text-xs mb-1">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualProduct.price}
                    onChange={(e) => setManualProduct({ ...manualProduct, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-black/30 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500/50 placeholder:text-white/30 border border-white/10"
                  />
                </div>
                <div className="w-20">
                  <label className="block text-white/70 text-xs mb-1">Currency</label>
                  <select
                    value={manualProduct.currency}
                    onChange={(e) => setManualProduct({ ...manualProduct, currency: e.target.value })}
                    className="w-full bg-black/30 text-white text-sm rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500/50 border border-white/10"
                  >
                    <option value="ILS">ILS</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white/70 text-xs mb-1">Image URL</label>
              <input
                type="url"
                value={manualProduct.imageUrl}
                onChange={(e) => setManualProduct({ ...manualProduct, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-black/30 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500/50 placeholder:text-white/30 border border-white/10"
              />
            </div>

            <div>
              <label className="block text-white/70 text-xs mb-1">Checkout URL</label>
              <input
                type="url"
                value={manualProduct.checkoutUrl}
                onChange={(e) => setManualProduct({ ...manualProduct, checkoutUrl: e.target.value })}
                placeholder="https://example.com/buy"
                className="w-full bg-black/30 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500/50 placeholder:text-white/30 border border-white/10"
              />
              <p className="text-white/40 text-xs mt-1">External link where viewers can purchase this product</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={addManualProduct}
                disabled={!manualProduct.title || !manualProduct.price || isAddingManual}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center gap-2"
              >
                {isAddingManual ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Adding...
                  </>
                ) : (
                  'Add to Queue'
                )}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* All Store Products */}
      <section className="bg-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Store Products</h2>
            <p className="text-white/50 text-xs mt-0.5">
              Click to add products to the show queue
            </p>
          </div>
          <span className="text-white/40 text-sm">{storeProducts.length} available</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-white/5 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : storeProducts.length === 0 ? (
          <div className="text-center py-8 text-white/50">
            <p>No products found in store</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {storeProducts.map((product) => {
              const inShortlist = isInShortlist(product.shopify_product_id);
              const isAddingThis = isAdding === product.shopify_product_id;

              return (
                <button
                  key={product.shopify_variant_id}
                  onClick={() => !inShortlist && addToShortlist(product)}
                  disabled={inShortlist || isAddingThis}
                  className={`relative aspect-square rounded-xl overflow-hidden transition-all ${
                    inShortlist
                      ? 'opacity-40 cursor-not-allowed ring-2 ring-pink-500/50'
                      : 'hover:scale-105 hover:ring-2 hover:ring-white/30 cursor-pointer'
                  }`}
                >
                  {/* Product image */}
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/10 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Gradient overlay with info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2">
                    <p className="text-white text-xs font-medium truncate">
                      {product.title}
                    </p>
                    <p className="text-white/70 text-xs">
                      {product.currency} {product.price}
                    </p>
                  </div>

                  {/* Added indicator */}
                  {inShortlist && (
                    <div className="absolute top-2 right-2 bg-pink-500 rounded-full p-1">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  {/* Loading state */}
                  {isAddingThis && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                    </div>
                  )}

                  {/* Add button overlay on hover */}
                  {!inShortlist && !isAddingThis && (
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
