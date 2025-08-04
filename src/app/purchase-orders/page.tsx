// src/app/purchase-orders/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Product } from '@/types/product';
import { PlusCircle, Search, Package } from 'lucide-react';
import AddEditProductModal from '@/components/AddEditProductModal';
import AddEditPurchaseOrderModal from '@/components/purchase-orders/AddEditPurchaseOrderModal';
import PurchaseHistoryModal from '@/components/purchase-orders/PurchaseHistoryModal';
import ProductPurchaseCard from '@/components/purchase-orders/ProductPurchaseCard';

export default function PurchaseOrdersPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddPurchaseModalOpen, setIsAddPurchaseModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setAllProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return allProducts;
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allProducts, searchQuery]);

  const handleOpenAddPurchaseModal = (product: Product) => {
    setSelectedProduct(product);
    setIsAddPurchaseModalOpen(true);
  };

  const handleOpenHistoryModal = (product: Product) => {
    setSelectedProduct(product);
    setIsHistoryModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="text-center py-10 flex items-center justify-center h-[calc(100vh-80px)]">
        <div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {/* Header and Search */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Manage Purchases / Add New Product</h1>
                <p className="text-sm md:text-base text-gray-500">Add new product or view the history for any product.</p>
              </div>
              <div className="relative w-full md:w-2/5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search or Add new product..."
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <ProductPurchaseCard
                  key={product.id}
                  product={product}
                  onAddPurchase={handleOpenAddPurchaseModal}
                  onViewHistory={handleOpenHistoryModal}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-md">
              <div className="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Package size={48} className="text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700">No Products Found</h2>
              <p className="text-gray-500 mt-2 mb-6">
                No products match your search. Would you like to create it?
              </p>
              <button
                onClick={() => setIsAddProductModalOpen(true)}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <PlusCircle size={18} />
                Create Product: &quot;{searchQuery}&quot;
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      <AddEditProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSave={fetchProducts}
        productToEdit={null}
        productToRestock={{ name: searchQuery }}
      />
      
      <AddEditPurchaseOrderModal
        isOpen={isAddPurchaseModalOpen}
        onClose={() => setIsAddPurchaseModalOpen(false)}
        onSave={fetchProducts}
        allProducts={allProducts}
        orderToEdit={null}
        initialProduct={selectedProduct}
      />

      {selectedProduct && (
        <PurchaseHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
        />
      )}
    </>
  );
}