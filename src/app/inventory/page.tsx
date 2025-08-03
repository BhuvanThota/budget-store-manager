// src/app/inventory/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Combobox } from '@headlessui/react';
import { Product } from '@/types/product';
import InventoryTable from '@/components/InventoryTable';
import PriceCalculator from '@/components/PriceCalculator';
import AddEditProductModal from '@/components/AddEditProductModal';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToRestock, setProductToRestock] = useState<Partial<Product> | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const deleteModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDeleteModalOpen && deleteModalRef.current && !deleteModalRef.current.contains(event.target as Node)) {
        closeDeleteModal();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDeleteModalOpen]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNewClick = (name = '') => {
    setProductToEdit(null);
    setProductToRestock({ name });
    setIsModalOpen(true);
  };
  
  const handleEdit = (product: Product) => {
    setProductToRestock(null);
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleRestock = (product: Product) => {
    setProductToEdit(null);
    setProductToRestock({ name: product.name, sellPrice: product.sellPrice });
    setIsModalOpen(true);
  }

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setProductToDelete(null);
    setIsDeleteModalOpen(false);
  };
  
  const confirmDelete = async () => {
    if (productToDelete) {
      await fetch(`/api/inventory/${productToDelete.id}`, { method: 'DELETE' });
      fetchProducts();
      closeDeleteModal();
    }
  };

  const filteredProducts = searchQuery === ''
    ? []
    : products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <>
      {/* UPDATED: Responsive grid for all screen sizes */}
      <div className="container mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area */}
        <div className="md:col-span-2 lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md lg:hidden">
            <h2 className="text-xl font-bold text-gray-700 border-b pb-4 mb-4">
              🚀 Quick Actions
            </h2>
            <Combobox as="div" className="relative" onChange={(value: Product | string) => {
              if (typeof value === 'string') {
                handleAddNewClick(value);
              } else {
                handleRestock(value);
              }
              setSearchQuery('');
            }}>
              <Combobox.Label className="block text-sm font-medium text-gray-700 mb-1">Add New or Restock Product</Combobox.Label>
              <Combobox.Input
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Start typing a product name..."
                autoComplete="off"
              />
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {filteredProducts.map((product) => (
                  <Combobox.Option key={product.id} value={product} className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${ active ? 'bg-brand-primary text-white' : 'text-gray-900'}` }>
                    Restock: {product.name}
                  </Combobox.Option>
                ))}
                {searchQuery.length > 0 && !products.some(p => p.name.toLowerCase() === searchQuery.toLowerCase()) && (
                  <Combobox.Option value={searchQuery} onClick={() => handleAddNewClick(searchQuery)} className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${ active ? 'bg-brand-primary text-white' : 'text-gray-900'}` }>
                    + Create new product: &quot;{searchQuery}&quot;
                  </Combobox.Option>
                )}
              </Combobox.Options>
            </Combobox>
          </div>

          <InventoryTable
            products={products}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Sidebar Area */}
        <div className="md:col-span-2 lg:col-span-1 space-y-6">
           <div className="bg-white p-6 rounded-lg shadow-md hidden lg:block">
            <h2 className="text-xl font-bold text-gray-700 border-b pb-4 mb-4">
              🚀 Quick Actions
            </h2>
            <Combobox as="div" className="relative" onChange={(value: Product | string) => {
              if (typeof value === 'string') {
                handleAddNewClick(value);
              } else {
                handleRestock(value);
              }
              setSearchQuery('');
            }}>
              <Combobox.Label className="block text-sm font-medium text-gray-700 mb-1">Add New or Restock Product</Combobox.Label>
              <Combobox.Input
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary"
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Start typing a product name..."
                autoComplete="off"
              />
              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {filteredProducts.map((product) => (
                  <Combobox.Option key={product.id} value={product} className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${ active ? 'bg-brand-primary text-white' : 'text-gray-900'}` }>
                    Restock: {product.name}
                  </Combobox.Option>
                ))}
                {searchQuery.length > 0 && !products.some(p => p.name.toLowerCase() === searchQuery.toLowerCase()) && (
                  <Combobox.Option value={searchQuery} onClick={() => handleAddNewClick(searchQuery)} className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${ active ? 'bg-brand-primary text-white' : 'text-gray-900'}` }>
                    + Create new product: &quot;{searchQuery}&quot;
                  </Combobox.Option>
                )}
              </Combobox.Options>
            </Combobox>
          </div>
          <PriceCalculator />
        </div>
      </div>

      {/* Modal Backdrop */}
      {(isModalOpen || isDeleteModalOpen) && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm z-40 transition-opacity duration-300"></div>
      )}

      {/* Modals */}
      <AddEditProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchProducts}
        productToEdit={productToEdit}
        productToRestock={productToRestock}
        allProducts={products}
      />
      
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div ref={deleteModalRef} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-800">Confirm Deletion</h2>
            <p className="text-sm text-gray-600 mt-2 mb-4">
              Are you sure you want to delete the product &quot;{productToDelete.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={closeDeleteModal} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300">
                Cancel
              </button>
              <button onClick={confirmDelete} className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}