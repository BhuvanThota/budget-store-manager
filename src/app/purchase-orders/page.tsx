// src/app/purchase-orders/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import { Search, Package, History, PlusCircle } from 'lucide-react';
import AddEditPurchaseOrderModal from '@/components/purchase-orders/AddEditPurchaseOrderModal';
import PurchaseHistoryModal from '@/components/purchase-orders/PurchaseHistoryModal';
import ProductPurchaseCard from '@/components/purchase-orders/ProductPurchaseCard';
// NEW: Import the list component we created
import PurchaseOrderList from '@/components/purchase-orders/PurchaseOrderList';

export default function PurchaseOrdersPage() {
  // NEW: State for active tab
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  // Existing state for the 'create' tab
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [isAddPurchaseModalOpen, setIsAddPurchaseModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    // Only fetch product grid data if the 'create' tab is active
    if (activeTab === 'create') {
      fetchData();
    }
  }, [activeTab]);

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
    fetchData();
  };
  
  const renderCreateView = () => {
    if (isLoading) {
      return (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
        </div>
      );
    }
    return (
       <>
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Create Purchase Orders</h1>
                <p className="text-sm md:text-base text-gray-500">Select a product below to record a new purchase and update its stock.</p>
              </div>
              <div className="w-full md:w-auto flex flex-col md:flex-row md:items-center gap-2">
                <div className="relative w-full md:w-48"><select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md"><option value="">All Categories</option>{categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}</select></div>
                <div className="relative w-full md:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full p-2 pl-10 border border-gray-300 rounded-md"/></div>
              </div>
            </div>
          </div>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (<ProductPurchaseCard key={product.id} product={product} onAddPurchase={handleOpenAddPurchaseModal} onViewHistory={handleOpenHistoryModal}/>))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-md"><div className="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center"><Package size={48} className="text-gray-400" /></div><h2 className="text-xl font-semibold text-gray-700">No Products Found</h2><p className="text-gray-500 mt-2">No products match your search or filter.</p><p className="text-gray-500 mt-1">Go to the <a href="/inventory" className="text-brand-primary font-semibold hover:underline">Inventory</a> page to add a new product.</p></div>
          )}
       </>
    );
  };

  return (
    <>
      <div className="container mx-auto p-4 max-w-7xl">
         <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="border-b">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('create')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'create' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <PlusCircle size={16} className="inline-block mr-2" />Create PO
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <History size={16} className="inline-block mr-2" />History
                    </button>
                </nav>
            </div>
         </div>
         
         {activeTab === 'create' ? renderCreateView() : <PurchaseOrderList />}

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