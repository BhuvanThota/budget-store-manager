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
  const [requests, setRequests] = useState(initialRequests);
  const [newItem, setNewItem] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAddRequest = async () => {
    if (!newItem.trim()) return;
    setIsSubmitting(true);
    await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: newItem }),
    });
    setNewItem('');
    router.refresh();
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    setRequests(currentRequests => currentRequests.filter(req => req.id !== id));
    await fetch(`/api/requests/${id}`, { method: 'DELETE' });
    router.refresh();
  };

  return (
    <DashboardCard title="Customer Requests" icon={<Lightbulb />}>
      <div className="flex flex-col h-full">
        <p className="text-sm text-gray-600 mb-4">Track items your customers are asking for.</p>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Enter requested item..."
            className="flex-grow p-2 border border-gray-300 rounded-md text-sm"
          />
          <button onClick={handleAddRequest} disabled={isSubmitting} className="bg-brand-primary text-white py-2 px-3 rounded-md hover:bg-brand-primary/90 disabled:opacity-50 text-sm">
            Add
          </button>
        </div>
        <ul className="space-y-2 flex-grow max-h-48 overflow-y-auto pr-2">
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
    </DashboardCard>
  );
}