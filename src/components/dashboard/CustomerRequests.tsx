// src/components/dashboard/CustomerRequests.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Request } from '@prisma/client';
import { Lightbulb, Trash2 } from 'lucide-react';

interface CustomerRequestsProps {
  initialRequests: Request[];
}

export default function CustomerRequests({ initialRequests }: CustomerRequestsProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [newItem, setNewItem] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter(); // Initialize the router

  const handleAddRequest = async () => {
    if (!newItem.trim()) return;
    setIsSubmitting(true);
    await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: newItem }),
    });
    setNewItem('');
    router.refresh(); // Refresh server-side data
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    // Optimistically remove from UI
    setRequests(currentRequests => currentRequests.filter(req => req.id !== id));
    await fetch(`/api/requests/${id}`, { method: 'DELETE' });
    router.refresh(); // Re-validate data from server
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2 mb-2">
        <Lightbulb /> Customer Requests
      </h3>
       <p className="text-sm text-gray-600 mb-4">Track items your customers are asking for.</p>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Enter requested item..."
          className="flex-grow p-2 border border-gray-300 rounded-md"
        />
        <button onClick={handleAddRequest} disabled={isSubmitting} className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50">
          Add
        </button>
      </div>
      <ul className="space-y-2 max-h-48 overflow-y-auto">
        {requests.length > 0 ? requests.map(req => (
          <li key={req.id} className="flex justify-between items-center p-2 bg-blue-50 rounded-md text-sm">
            <span>{req.item}</span>
            <button onClick={() => handleDelete(req.id)} className="text-red-500 hover:text-red-700">
              <Trash2 size={16} />
            </button>
          </li>
        )) : (
          <p className="text-sm text-gray-500 text-center py-4">No customer requests yet.</p>
        )}
      </ul>
    </div>
  );
}