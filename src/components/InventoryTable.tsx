// src/components/InventoryTable.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Product } from '@/types/product';

interface InventoryTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ITEMS_PER_PAGE = 25;

export default function InventoryTable({ products, isLoading, onEdit, onDelete }: InventoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterQuery, setFilterQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!filterQuery) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(filterQuery.toLowerCase())
    );
  }, [products, filterQuery]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const goToNextPage = () => setCurrentPage((page) => Math.min(page + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage((page) => Math.max(page - 1, 1));
  
  // Reset to page 1 when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [filterQuery]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filter products by name..."
          className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost/Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sell Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-4">Loading inventory...</td></tr>
            ) : currentProducts.map(product => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.currentStock} / {product.initialStock}</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{(product.initialStock > 0 ? product.totalCost / product.initialStock : 0).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{product.sellPrice.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                  <button onClick={() => onEdit(product)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button onClick={() => onDelete(product)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}