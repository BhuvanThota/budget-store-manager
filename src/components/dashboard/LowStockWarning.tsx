// src/components/dashboard/LowStockWarning.tsx
import { Product } from '@prisma/client';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function LowStockWarning({ items }: { items: Product[] }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-yellow-700 flex items-center gap-2 mb-2">
        <AlertTriangle /> Low Stock Items
      </h3>
      <p className="text-sm text-gray-600 mb-4">These items are at or below your set threshold.</p>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No items are currently low on stock. Great job!</p>
      ) : (
        <>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {items.map(item => (
              <li key={item.id} className="flex justify-between p-2 bg-yellow-50 rounded-md text-sm">
                <span>{item.name}</span>
                <span className="font-bold">{item.currentStock} left</span>
              </li>
            ))}
          </ul>
          <Link href="/inventory" className="text-sm text-brand-primary hover:underline mt-4 inline-block">
            Go to Inventory →
          </Link>
        </>
      )}
    </div>
  );
}