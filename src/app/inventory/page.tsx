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
import ManageCategoriesModal from '@/components/inventory/ManageCategoriesModal';
import AddEditProductModal from '@/components/AddEditProductModal'; // NEW: Import modal

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
  const [isManageCategoriesModalOpen, setIsManageCategoriesModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false); // NEW: State for add product modal

  const fetchInitialData = useCallback(async () => {
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
  }, [fetchInitialData]);

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
    await fetchInitialData();
  };

  const handleSaveAndCloseMobile = async () => {
    await refreshProducts();
    await fetchInitialData();
    setIsMobileDetailModalOpen(false);
  };
  
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategoryId || p.categoryId === selectedCategoryId;
      return matchesSearch && matchesCategory;
    });
  }, [allProducts, searchQuery, selectedCategoryId]);

  // NEW: Handler to open the add product modal
  const handleAddProduct = () => {
    setIsAddProductModalOpen(true);
  };
  
  // NEW: Handler for when a new product is saved
  const handleProductSaved = () => {
    fetchInitialData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }
  
  if (allProducts.length === 0 && !isLoading) {
    // MODIFIED: Show a different message if there are no products, and include the add product button
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)] text-center px-4">
        <div>
          <Boxes size={48} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700">Your Inventory is Empty</h2>
          <p className="text-gray-500 mt-2 mb-6">Get started by adding your first product.</p>
          <button
            onClick={handleAddProduct}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2 px-5 rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            Add First Product
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-[1000px]">
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
            onAddProduct={handleAddProduct} // Pass handler
          />
        </div>

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
            onAddProduct={handleAddProduct} // Pass handler
          />
          </div>
          <div className="w-[60%] lg:w-[70%] h-full">
            <ProductDetail 
              product={selectedProduct} 
              onSave={handleProductSaved}
              onDelete={handleOpenDeleteModal}
            />
          </div>
        </div>
      </div>
      
      {/* MODAL WIRING */}
      <AddEditProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onSave={handleProductSaved}
        productToEdit={null}
        productToRestock={null}
      />
      
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