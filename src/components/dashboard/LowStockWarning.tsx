// src/components/dashboard/LowStockWarning.tsx
import { Product } from '@prisma/client';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import DashboardCard from './DashboardCard';

export default function LowStockWarning({ items }: { items: Product[] }) {
  return (
    <DashboardCard title="Low Stock Items" icon={<AlertTriangle />}>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500 h-full flex items-center justify-center">
          No items are currently low on stock.
        </p>
      ) : (
        <div className="flex flex-col h-full">
          <p className="text-sm text-gray-600 mb-4">These items are at or below your set threshold.</p>
          <ul className="space-y-2 flex-grow max-h-48 overflow-y-auto pr-2">
            {items.map(item => (
              <li key={item.id} className="flex justify-between p-2 bg-yellow-50 rounded-md text-sm">
                <span>{item.name}</span>
                <span className="font-bold">{item.currentStock} left</span>
              </li>
            ))}
          </ul>
          <Link href="/inventory" className="text-sm text-brand-primary hover:underline mt-4 font-semibold">
            Manage Inventory →
          </Link>
        </div>
      )}
    </DashboardCard>
  );
}