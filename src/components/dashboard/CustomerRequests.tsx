// src/components/dashboard/CustomerRequests.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Request } from '@prisma/client';
import { Lightbulb, Trash2 } from 'lucide-react';
import DashboardCard from './DashboardCard';

interface CustomerRequestsProps {
  initialRequests: Request[];
}

export default function CustomerRequests({ initialRequests }: CustomerRequestsProps) {
  // REMOVED: No longer need internal state for the list itself.
  // const [requests, setRequests] = useState(initialRequests);
  const [newItem, setNewItem] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAddRequest = async (e: React.FormEvent) => {
    e.preventDefault(); // Use form submission for better accessibility (e.g., pressing Enter)
    if (!newItem.trim()) return;
    setIsSubmitting(true);
    
    await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: newItem }),
    });

    setNewItem('');
    router.refresh(); // This will re-fetch data in the parent Server Component
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    // Note: With this pattern, we don't do an optimistic update.
    // We wait for the server to confirm the deletion.
    await fetch(`/api/requests/${id}`, { method: 'DELETE' });
    router.refresh(); // Re-fetch data to reflect the deletion
  };

  return (
    <DashboardCard title="Customer Requests" icon={<Lightbulb />}>
      <div className="flex flex-col h-full">
        <p className="text-sm text-gray-600 mb-4">Track items your customers are asking for.</p>
        <form onSubmit={handleAddRequest} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Enter requested item..."
            className="flex-grow p-2 border border-gray-300 rounded-md text-sm"
          />
          <button type="submit" disabled={isSubmitting} className="bg-brand-primary text-white py-2 px-3 rounded-md hover:bg-brand-primary/90 disabled:opacity-50 text-sm">
            {isSubmitting ? '...' : 'Add'}
          </button>
        </form>
        <ul className="space-y-2 flex-grow max-h-48 overflow-y-auto pr-2">
          {/* MODIFIED: Render directly from the 'initialRequests' prop */}
          {initialRequests.length > 0 ? initialRequests.map(req => (
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
    </DashboardCard>
  );
}