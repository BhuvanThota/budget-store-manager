// src/app/purchase-orders/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { Search, Package } from 'lucide-react'; // MODIFIED: Removed PlusCircle
import AddEditPurchaseOrderModal from '@/components/purchase-orders/AddEditPurchaseOrderModal';
import PurchaseHistoryModal from '@/components/purchase-orders/PurchaseHistoryModal';
import ProductPurchaseCard from '@/components/purchase-orders/ProductPurchaseCard';

export default function PurchaseOrdersPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // Modal states
  // MODIFIED: Removed state for AddProductModal
  const [isAddPurchaseModalOpen, setIsAddPurchaseModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/categories')
      ]);
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      setAllProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategoryId || p.categoryId === selectedCategoryId;
      return matchesSearch && matchesCategory;
    });
  }, [allProducts, searchQuery, selectedCategoryId]);

  const handleOpenAddPurchaseModal = (product: Product) => {
    setSelectedProduct(product);
    setIsAddPurchaseModalOpen(true);
  };

  const handleOpenHistoryModal = (product: Product) => {
    setSelectedProduct(product);
    setIsHistoryModalOpen(true);
  };
  
  const handlePurchaseSaved = () => {
    // We only need to refetch products here as purchases affect stock levels
    fetchData();
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
      <div className="container mx-auto p-4 max-w-7xl">
        <div>
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Create Purchase Orders</h1>
                <p className="text-sm md:text-base text-gray-500">Select a product below to record a new purchase and update its stock.</p>
              </div>
              <div className="w-full md:w-auto flex flex-col md:flex-row md:items-center gap-2">
                {/* MODIFIED: "Add Product" button has been removed from here */}
                <div className="relative w-full md:w-48">
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="relative w-full md:w-64">
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
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              <p className="text-gray-500 mt-2">
                No products match your search or filter.
              </p>
               <p className="text-gray-500 mt-1">
                Go to the <a href="/inventory" className="text-brand-primary font-semibold hover:underline">Inventory</a> page to add a new product.
              </p>
            </div>
          )}
        </div>
      </div>

      <AddEditPurchaseOrderModal
        isOpen={isAddPurchaseModalOpen}
        onClose={() => setIsAddPurchaseModalOpen(false)}
        onSave={handlePurchaseSaved}
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