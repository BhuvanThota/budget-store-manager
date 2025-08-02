// src/app/inventory/page.tsx
'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';

interface Product {
  id: string;
  name: string;
  totalCost: number;
  initialStock: number;
  currentStock: number;
  sellPrice: number;
}

const initialFormState = {
  id: '',
  name: '',
  totalCost: '',
  initialStock: '',
  sellPrice: '',
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for the custom delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // State for the price calculator
  const [calcCost, setCalcCost] = useState('');
  const [calcItems, setCalcItems] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);
  const isEditing = !!formData.id;

  useEffect(() => {
    fetchProducts();
  }, []);

  // Effect to handle closing modals on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isModalOpen && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
      if (isDeleteModalOpen && deleteModalRef.current && !deleteModalRef.current.contains(event.target as Node)) {
        closeDeleteModal();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen, isDeleteModalOpen]);

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

  const openModal = () => setIsModalOpen(true);
  
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
  };

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setProductToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddNewClick = () => {
    setFormData(initialFormState);
    openModal();
  };

  const handleEditClick = (product: Product) => {
    setFormData({
      id: product.id,
      name: product.name,
      totalCost: String(product.totalCost),
      initialStock: String(product.initialStock),
      sellPrice: String(product.sellPrice),
    });
    openModal();
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await fetch(`/api/inventory/${productToDelete.id}`, { method: 'DELETE' });
      fetchProducts();
      closeDeleteModal();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const url = isEditing ? `/api/inventory/${formData.id}` : '/api/inventory';
    const method = isEditing ? 'PUT' : 'POST';

    interface ProductPayload {
      name: string;
      totalCost: number;
      initialStock: number;
      sellPrice: number;
      currentStock?: number;
    }

    const payload: ProductPayload = {
      name: formData.name,
      totalCost: parseFloat(formData.totalCost),
      initialStock: parseInt(formData.initialStock, 10),
      sellPrice: parseFloat(formData.sellPrice),
    };

    if (isEditing) {
        const originalProduct = products.find(p => p.id === formData.id);
        if (originalProduct && originalProduct.initialStock === parseInt(formData.initialStock, 10)) {
            payload.currentStock = originalProduct.currentStock;
        } else {
            payload.currentStock = parseInt(formData.initialStock, 10);
        }
    }

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      closeModal();
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Price Calculator Logic ---
  const calcCostPerItem = parseFloat(calcCost) > 0 && parseInt(calcItems) > 0
    ? parseFloat(calcCost) / parseInt(calcItems)
    : 0;

  const profitMargins = [
    { label: '20% Profit', value: calcCostPerItem * 1.20 },
    { label: '50% Profit', value: calcCostPerItem * 1.50 },
    { label: '75% Profit', value: calcCostPerItem * 1.75 },
    { label: '100% Profit (2x)', value: calcCostPerItem * 2.00 },
    { label: '200% Profit (3x)', value: calcCostPerItem * 3.00 },
  ];

  // --- Live Profit/Loss Margin for Form ---
  const formCostPerItem = parseFloat(formData.totalCost) > 0 && parseInt(formData.initialStock) > 0
    ? parseFloat(formData.totalCost) / parseInt(formData.initialStock)
    : 0;
  
  const formSellPrice = parseFloat(formData.sellPrice);
  
  const formProfitMargin = formCostPerItem > 0 && formSellPrice > formCostPerItem
    ? ((formSellPrice - formCostPerItem) / formCostPerItem) * 100
    : 0;
  
  const formLossMargin = formCostPerItem > 0 && formSellPrice < formCostPerItem
    ? ((formCostPerItem - formSellPrice) / formCostPerItem) * 100
    : 0;

  return (
    <>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Inventory Table Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-xl font-bold text-gray-700">📦 My Inventory</h2>
            <button
              onClick={handleAddNewClick}
              className="bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-primary/90 transition-colors"
            >
              + Add Product
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sell Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-4">Loading inventory...</td></tr>
                ) : products.map(product => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.currentStock} / {product.initialStock}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{(product.initialStock > 0 ? product.totalCost / product.initialStock : 0).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₹{product.sellPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                      <button onClick={() => handleEditClick(product)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                      <button onClick={() => openDeleteModal(product)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Price Calculator Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-700 border-b pb-4 mb-4">
            💡 Sell Price Calculator
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="calcCost" className="block text-sm font-medium text-gray-700 mb-1">Total Purchase Cost (₹)</label>
              <input type="number" id="calcCost" value={calcCost} onChange={(e) => setCalcCost(e.target.value)} placeholder="e.g., 1000" className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="calcItems" className="block text-sm font-medium text-gray-700 mb-1">Number of Items</label>
              <input type="number" id="calcItems" value={calcItems} onChange={(e) => setCalcItems(e.target.value)} placeholder="e.g., 100" className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
          </div>
          {calcCostPerItem > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Cost per item: <span className="font-bold text-brand-primary">₹{calcCostPerItem.toFixed(2)}</span></p>
              <h3 className="text-md font-semibold text-gray-800 mb-2">Suggested Selling Prices:</h3>
              <ul className="space-y-1 text-sm">
                {profitMargins.map(margin => (
                  <li key={margin.label} className="flex justify-between p-2 bg-gray-50 rounded-md">
                    <span className="text-gray-700">{margin.label}:</span>
                    <span className="font-bold text-green-600">₹{margin.value.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Modal Backdrop */}
      {(isModalOpen || isDeleteModalOpen) && (
        <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm z-40 transition-opacity duration-300"></div>
      )}

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">
                {isEditing ? '✏️ Edit Product' : '✨ Add New Product'}
              </h2>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md"/>
              </div>
              <div>
                <label htmlFor="totalCost" className="block text-sm font-medium text-gray-700 mb-1">Total Purchase Cost (₹)</label>
                <input type="number" step="0.01" id="totalCost" name="totalCost" value={formData.totalCost} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label htmlFor="initialStock" className="block text-sm font-medium text-gray-700 mb-1">Number of Items / Stock</label>
                <input type="number" id="initialStock" name="initialStock" value={formData.initialStock} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md" />
              </div>

              {formCostPerItem > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-left">
                  <p className="text-sm font-medium text-blue-800">
                    Calculated cost per item: <span className="font-bold">₹{formCostPerItem.toFixed(2)}</span>
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="sellPrice" className="block text-sm font-medium text-gray-700 mb-1">Selling Price per Item (₹)</label>
                <input type="number" step="0.01" id="sellPrice" name="sellPrice" value={formData.sellPrice} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              
              {formProfitMargin > 0 ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md text-center">
                  <p className="text-sm font-medium text-green-800">
                    Profit Margin: <span className="font-bold">{formProfitMargin.toFixed(1)}%</span>
                  </p>
                </div>
              ) : formLossMargin > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-center">
                  <p className="text-sm font-medium text-red-800">
                    Loss: <span className="font-bold">{formLossMargin.toFixed(1)}%</span>
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={closeModal} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-primary/90 disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : (isEditing ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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