// src/components/inventory/ProductList.tsx
'use client';

import { Product } from '@/types/product';
import { Search } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelectProduct: (product: Product) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function ProductList({
  products,
  selectedProduct,
  onSelectProduct,
  searchQuery,
  setSearchQuery,
}: ProductListProps) {
  return (
    <div className="bg-white h-full md:rounded-lg shadow-md flex flex-col">
      {/* Search Header */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full p-2 pl-10 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Product List - Updated classes for custom scrollbar */}
      <div className="flex-grow overflow-y-auto scrollbar-custom">
        <ul className="space-y-1 p-2">
          {products.map((product) => (
            <li key={product.id}>
              <button
                onClick={() => onSelectProduct(product)}
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  selectedProduct?.id === product.id
                    ? 'bg-brand-primary text-white shadow'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="font-semibold">{product.name}</div>
                <div className={`text-sm ${selectedProduct?.id === product.id ? 'text-gray-200' : 'text-gray-500'}`}>
                  Stock: {product.currentStock}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}