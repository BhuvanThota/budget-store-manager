// src/components/dashboard/RestockSuggestions.tsx
import { Product } from '@prisma/client';
import { ArchiveRestore } from 'lucide-react';
import Link from 'next/link';

export default function RestockSuggestions({ items }: { items: Product[] }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-red-700 flex items-center gap-2 mb-2">
        <ArchiveRestore /> Out of Stock
      </h3>
       <p className="text-sm text-gray-600 mb-4">These items need to be restocked immediately.</p>
       {items.length === 0 ? (
        <p className="text-sm text-gray-500">No items are out of stock.</p>
      ) : (
        <>
          <ul className="space-y-2 max-h-48 overflow-y-auto">
            {items.map(item => (
              <li key={item.id} className="p-2 bg-red-50 rounded-md text-sm font-medium text-red-800">
                {item.name}
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