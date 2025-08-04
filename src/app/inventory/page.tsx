// src/app/inventory/page.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '@/types/product';
import ProductList from '@/components/inventory/ProductList';
import ProductDetail from '@/components/inventory/ProductDetail';
import ProductDetailModal from '@/components/inventory/ProductDetailModal';
import { Boxes } from 'lucide-react';

export default function InventoryPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (allProducts.length === 0) setIsLoading(true);
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setAllProducts(data);
      setSelectedProduct(prev => data.find((p: Product) => p.id === prev?.id) || data[0] || null);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setIsLoading(false);
    }
  }, [allProducts.length]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    if (window.innerWidth < 768) { // md breakpoint in Tailwind
      setIsModalOpen(true);
    }
  };

  const handleSaveAndClose = () => {
    fetchProducts();
    setIsModalOpen(false);
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return allProducts;
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allProducts, searchQuery]);

  // Loading and Empty States
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }
  
  if (allProducts.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] text-center px-4">
        <div>
          <Boxes size={48} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700">No Products in Inventory</h2>
          <p className="text-gray-500 mt-2">Go to the Purchase Orders page to add your first batch of stock.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden h-[calc(100vh-80px)]">
         <ProductList
            products={filteredProducts}
            selectedProduct={selectedProduct}
            onSelectProduct={handleSelectProduct}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
      </div>

      {/* Tablet & Desktop Layout */}
      <div className="hidden md:flex h-[calc(100vh-80px)] p-6 gap-6">
        <div className="w-[40%] lg:w-[30%] h-full">
           <ProductList
            products={filteredProducts}
            selectedProduct={selectedProduct}
            onSelectProduct={handleSelectProduct}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
        <div className="w-[60%] lg:w-[70%] h-full">
          <ProductDetail product={selectedProduct} onSave={fetchProducts} />
        </div>
      </div>

      {/* Modal for both mobile and creating new products */}
      <ProductDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSave={handleSaveAndClose}
      />
    </>
  );
}