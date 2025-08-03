// src/components/reports/TopProducts.tsx
import { Star } from 'lucide-react';
import { ReportData } from '@/types/report';

interface TopProductsProps {
  reportData: ReportData;
}

export default function TopProducts({ reportData }: TopProductsProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Top 5 Selling Products</h3>
      {reportData.mostSoldItem && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0"><Star className="h-6 w-6 text-yellow-500" /></div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-yellow-800">#1 Top Seller</p>
              <p className="text-md text-yellow-700">{reportData.mostSoldItem.name} - <span className="font-bold">{reportData.mostSoldItem.quantity}</span> units</p>
            </div>
          </div>
        </div>
      )}
      <ul className="space-y-2">
        {reportData.topSellingProducts.length > 0 ? reportData.topSellingProducts.map(product => (
          <li key={product.name} className="flex justify-between p-3 bg-gray-50 rounded-md text-sm">
            <span className="font-medium text-gray-800">{product.name}</span>
            <span className="text-gray-600">{product.quantity} units sold</span>
          </li>
        )) : (
          <li className="p-3 bg-gray-50 rounded-md text-sm text-gray-500">No products sold in this period.</li>
        )}
      </ul>
    </div>
  );
}