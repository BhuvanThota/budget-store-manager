// src/app/inventory/page.tsx
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Product } from '@/types/product';
import ProductList from '@/components/inventory/ProductList';
import ProductDetail from '@/components/inventory/ProductDetail';
import { Boxes } from 'lucide-react';

export default function InventoryPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Ref for the detail section to enable auto-scrolling on mobile
  const detailRef = useRef<HTMLDivElement>(null);

  const fetchProducts = useCallback(async () => {
    // Keep isLoading true only on the very first load
    if (allProducts.length === 0) {
      setIsLoading(true);
    }
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setAllProducts(data);

      // Update selection logic
      setSelectedProduct(prevSelected => {
        const newSelection = data.find((p: Product) => p.id === prevSelected?.id);
        return newSelection || data[0] || null;
      });

    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setIsLoading(false);
    }
  }, [allProducts.length]); // Rerun if products are wiped, but not on every selection change

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    // On smaller screens, scroll to the detail view after a selection
    if (window.innerWidth < 768) {
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100); // A small delay ensures the component is rendered before scrolling
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return allProducts;
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allProducts, searchQuery]);

  if (isLoading) {
    return (
      <div className="text-center py-10 flex items-center justify-center h-[calc(100vh-80px)]">
        <div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }
  
  if (allProducts.length === 0) {
    return (
        <div className="text-center py-10 flex items-center justify-center h-[calc(100vh-80px)]">
            <div>
                <div className="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <Boxes size={48} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-700">No Products in Inventory</h2>
                <p className="text-gray-500 mt-2">Add products via the Purchase Orders page to see them here.</p>
            </div>
        </div>
    );
  }

  return (
    // This div now controls the responsive layout
    <div className="h-[calc(100vh-80px)] md:p-6 flex flex-col md:flex-row md:gap-6">
      {/* Master Column: Product List */}
      {/* On mobile, it's 50% height. On desktop, it's 30% width. */}
      <div className="md:w-[30%] h-[50vh] md:h-full">
        <ProductList
          products={filteredProducts}
          selectedProduct={selectedProduct}
          onSelectProduct={handleSelectProduct}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>

      {/* Detail Column: Product Details */}
      {/* On mobile, it appears below the list. On desktop, it's on the right. */}
      <div className="md:w-[70%] h-full" ref={detailRef}>
        <ProductDetail
          product={selectedProduct}
          onSave={fetchProducts}
        />
      </div>
    </div>
  );
}