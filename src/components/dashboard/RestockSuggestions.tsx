// src/components/dashboard/RestockSuggestions.tsx
import { Product } from '@prisma/client';
import { ArchiveRestore } from 'lucide-react';
import Link from 'next/link';
import DashboardCard from './DashboardCard';

export default function RestockSuggestions({ items }: { items: Product[] }) {
  return (
    <DashboardCard title="Out of Stock" icon={<ArchiveRestore />}>
      {items.length === 0 ? (
         <p className="text-sm text-gray-500 h-full flex items-center justify-center">
          No items are out of stock.
        </p>
      ) : (
        <div className="flex flex-col h-full">
          <p className="text-sm text-gray-600 mb-4">These items should be restocked immediately.</p>
          <ul className="space-y-2 flex-grow max-h-48 overflow-y-auto pr-2">
            {items.map(item => (
              <li key={item.id} className="p-2 bg-red-50 rounded-md text-sm font-medium text-red-800">
                {item.name}
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