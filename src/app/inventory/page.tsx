// src/app/inventory/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types/product';
import ProductList from '@/components/inventory/ProductList';
import ProductDetail from '@/components/inventory/ProductDetail';
import ProductDetailModal from '@/components/inventory/ProductDetailModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import SuccessModal from '@/components/SuccessModal'; // Import the new modal
import PasswordConfirmationModal from '@/components/PasswordConfirmationModal'; // Import the new modal
import { Boxes } from 'lucide-react';

export default function InventoryPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isMobileDetailModalOpen, setIsMobileDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // New state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchProducts = useCallback(async (postAction: 'select_first' | 'keep_selection' | 'clear_selection' = 'keep_selection') => {
    if (allProducts.length === 0) setIsLoading(true);
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setAllProducts(data);

      // FIX: Control how the selection is updated after fetching
      if (postAction === 'select_first') {
        setSelectedProduct(data[0] || null);
      } else if (postAction === 'clear_selection') {
        setSelectedProduct(null);
      } else { // 'keep_selection'
        setSelectedProduct(prev => data.find((p: Product) => p.id === prev?.id) || null);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setIsLoading(false);
    }
  }, [allProducts.length]);

  useEffect(() => {
    fetchProducts('select_first');
  }, [fetchProducts]); // Remove fetchProducts from dependency array to only run once on mount

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
    // This is step 2: User confirmed "Are you sure?"
    setIsDeleteModalOpen(false);
    setIsPasswordModalOpen(true); // Open the password modal
  };

  const handleFinalDelete = async (password: string) => {
    // This is step 3: User entered password and clicked confirm
    if (!productToDelete) return;

    // First, verify the password
    const verifyRes = await fetch('/api/auth/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!verifyRes.ok) {
      const errorData = await verifyRes.json();
      throw new Error(errorData.message || 'Password verification failed.');
    }

    // If password is correct, proceed with deletion
    const deleteRes = await fetch(`/api/inventory/${productToDelete.id}`, { method: 'DELETE' });
    if (!deleteRes.ok) {
        throw new Error('Failed to delete the product after verification.');
    }

    // If deletion is successful
    setIsPasswordModalOpen(false);
    setIsMobileDetailModalOpen(false);
    
    setSuccessMessage(`Product "${productToDelete.name}" was successfully deleted.`);
    setIsSuccessModalOpen(true);
    
    setProductToDelete(null);
    fetchProducts('clear_selection');
  };


  const handleSaveAndCloseMobile = () => {
    fetchProducts();
    setIsMobileDetailModalOpen(false);
  };
  
  const filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            selectedProduct={null} // Don't show selection on mobile list
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
            onSelectProduct={setSelectedProduct}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          </div>
          <div className="w-[60%] lg:w-[70%] h-full">
            <ProductDetail 
              product={selectedProduct} 
              onSave={() => fetchProducts()}
              onDelete={handleOpenDeleteModal}
            />
          </div>
        </div>
      </div>

       {/* MODAL: Mobile Product Detail */}
       <ProductDetailModal
        isOpen={isMobileDetailModalOpen}
        onClose={() => setIsMobileDetailModalOpen(false)}
        product={selectedProduct}
        onSave={handleSaveAndCloseMobile}
        onDelete={handleOpenDeleteModal}
      />
      
      {/* MODAL 1: Initial "Are you sure?" Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleInitialDeleteConfirm}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Yes, Continue"
      />
      
      {/* MODAL 2: Password Confirmation */}
      <PasswordConfirmationModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onConfirm={handleFinalDelete}
        title="Confirm Product Deletion"
      />

      {/* MODAL 3: Success Message */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Success"
        message={successMessage}
      />
    </>
  );
}