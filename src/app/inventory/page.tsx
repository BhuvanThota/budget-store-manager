// src/app/inventory/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '@/types/product';
import { Category } from '@/types/category';
import ProductList from '@/components/inventory/ProductList';
import ProductDetail from '@/components/inventory/ProductDetail';
import ProductDetailModal from '@/components/inventory/ProductDetailModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import SuccessModal from '@/components/SuccessModal';
import PasswordConfirmationModal from '@/components/PasswordConfirmationModal';
import { Boxes } from 'lucide-react';
import ManageCategoriesModal from '@/components/inventory/ManageCategoriesModal'; // NEW: Import modal

export default function InventoryPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // Modal states
  const [isMobileDetailModalOpen, setIsMobileDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isManageCategoriesModalOpen, setIsManageCategoriesModalOpen] = useState(false); // NEW: State for category modal

  const fetchInitialData = useCallback(async () => {
    // Only set loading true on the very first fetch
    if (allProducts.length === 0) setIsLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/categories'),
      ]);
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      
      setAllProducts(productsData);
      setCategories(categoriesData);
      // Select first product only if one isn't already selected
      if (!selectedProduct) {
        setSelectedProduct(productsData[0] || null);
      }
    } catch (error) {
      console.error('Failed to fetch initial data', error);
    } finally {
      setIsLoading(false);
    }
  }, [allProducts.length, selectedProduct]);

  const refreshProducts = useCallback(async (postAction: 'keep_selection' | 'clear_selection' = 'keep_selection') => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setAllProducts(data);

      if (postAction === 'clear_selection') {
        setSelectedProduct(null);
      } else {
        setSelectedProduct(prev => data.find((p: Product) => p.id === prev?.id) || null);
      }
    } catch (error) {
      console.error('Failed to refresh products', error);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, []); // Note: We only want this to run once on mount. The dependency array is intentionally empty.

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    if (window.innerWidth < 768) {
      setIsMobileDetailModalOpen(true);
    }
  };
  
  const handleOpenDeleteModal = (productId: string) => {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      setProductToDelete(product);
      setIsDeleteModalOpen(true);
    }
  };

  const handleInitialDeleteConfirm = () => {
    setIsDeleteModalOpen(false);
    setIsPasswordModalOpen(true);
  };

  const handleFinalDelete = async (password: string) => {
    if (!productToDelete) return;
    const verifyRes = await fetch('/api/auth/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!verifyRes.ok) {
      const errorData = await verifyRes.json();
      throw new Error(errorData.message || 'Password verification failed.');
    }
    const deleteRes = await fetch(`/api/inventory/${productToDelete.id}`, { method: 'DELETE' });
    if (!deleteRes.ok) {
        throw new Error('Failed to delete the product after verification.');
    }
    setIsPasswordModalOpen(false);
    setIsMobileDetailModalOpen(false);
    setSuccessMessage(`Product "${productToDelete.name}" was successfully deleted.`);
    setIsSuccessModalOpen(true);
    setProductToDelete(null);
    await refreshProducts('clear_selection');
    await fetchInitialData(); // Also refresh categories
  };

  const handleSaveAndCloseMobile = async () => {
    await refreshProducts();
    await fetchInitialData(); // Also refresh categories
    setIsMobileDetailModalOpen(false);
  };
  
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategoryId || p.categoryId === selectedCategoryId;
      return matchesSearch && matchesCategory;
    });
  }, [allProducts, searchQuery, selectedCategoryId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }
  
  if (allProducts.length === 0 && !isLoading) {
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
      <div className="mx-auto max-w-[1000px]">
        {/* Mobile Layout */}
        <div className="md:hidden h-[calc(100vh-80px)]">
           <ProductList
            products={filteredProducts}
            selectedProduct={null}
            onSelectProduct={handleSelectProduct}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
            onManageCategories={() => setIsManageCategoriesModalOpen(true)}
          />
        </div>

        {/* Tablet & Desktop Layout */}
        <div className="hidden md:flex h-[calc(100vh-80px)] p-6 gap-6">
          <div className="w-[40%] lg:w-[30%] h-full">
           <ProductList
            products={filteredProducts}
            selectedProduct={selectedProduct}
            onSelectProduct={setSelectedProduct}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
            onManageCategories={() => setIsManageCategoriesModalOpen(true)}
          />
          </div>
          <div className="w-[60%] lg:w-[70%] h-full">
            <ProductDetail 
              product={selectedProduct} 
              onSave={() => refreshProducts()}
              onDelete={handleOpenDeleteModal}
            />
          </div>
        </div>
      </div>

      {/* NEW: Render the Manage Categories Modal */}
      <ManageCategoriesModal
        isOpen={isManageCategoriesModalOpen}
        onClose={() => setIsManageCategoriesModalOpen(false)}
        onUpdate={fetchInitialData}
      />

      <ProductDetailModal
        isOpen={isMobileDetailModalOpen}
        onClose={() => setIsMobileDetailModalOpen(false)}
        product={selectedProduct}
        onSave={handleSaveAndCloseMobile}
        onDelete={handleOpenDeleteModal}
      />
      
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleInitialDeleteConfirm}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Yes, Continue"
      />
      
      <PasswordConfirmationModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onConfirm={handleFinalDelete}
        title="Confirm Product Deletion"
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Success"
        message={successMessage}
      />
    </>
  );
}