// src/components/reports/TopProducts.tsx

import { ReportData as SalesSummaryData } from '@/types/report';

interface TopProductsProps {
  reportData: SalesSummaryData;
}

export default function TopProducts({ reportData }: TopProductsProps) {
  const { topSellingProducts } = reportData;

  if (!topSellingProducts || topSellingProducts.length === 0) {
    return null; // Don't render the card if there's no data
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-700 mb-2">Top Selling Products</h3>
      <div className="p-4 border rounded-lg bg-white">
        <ul className="space-y-3">
          {topSellingProducts.map((product, index) => (
            <li key={index} className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-800">{product.name}</span>
              <span className="font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{product.quantity} units</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}