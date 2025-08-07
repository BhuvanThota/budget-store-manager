// src/components/inventory/ProductList.tsx
'use client';

import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { Search, Tag, PlusCircle } from 'lucide-react'; // MODIFIED: Added PlusCircle

interface ProductListProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelectProduct: (product: Product) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: Category[];
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
  onManageCategories: () => void;
  // NEW: Add prop to open the Add Product modal
  onAddProduct: () => void;
}

export default function ProductList({
  products,
  selectedProduct,
  onSelectProduct,
  searchQuery,
  setSearchQuery,
  categories,
  selectedCategoryId,
  setSelectedCategoryId,
  onManageCategories,
  onAddProduct, // NEW
}: ProductListProps) {
  return (
    <div className="bg-white h-full md:rounded-lg shadow-md flex flex-col">
      {/* NEW: Header for adding a new product */}
      <div className="p-4 border-b">
        <button
          onClick={onAddProduct}
          className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <PlusCircle size={18} />
          Add New Product
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="p-4 border-b space-y-3">
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
        <div className="flex gap-2">
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button
            onClick={onManageCategories}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
            title="Manage Categories"
          >
            <Tag size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Product List */}
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