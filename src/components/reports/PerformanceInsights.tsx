// src/components/reports/PerformanceInsights.tsx

import { ReportData as SalesSummaryData } from '@/types/report';

interface PerformanceInsightsProps {
  reportData: SalesSummaryData;
}

export default function PerformanceInsights({ reportData }: PerformanceInsightsProps) {
  const { busiestDay, mostProfitableDay, mostProfitableMonth } = reportData;
  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

  const insights = [
    { label: "Busiest Day", value: busiestDay ? `${busiestDay.day} (${busiestDay.orders} orders)` : "N/A" },
    { label: "Most Profitable Day", value: mostProfitableDay ? `${mostProfitableDay.day} (${formatCurrency(mostProfitableDay.profit)} profit)` : "N/A" },
    { label: "Most Profitable Month", value: mostProfitableMonth ? `${mostProfitableMonth.month} (${formatCurrency(mostProfitableMonth.profit)} profit)` : "N/A" },
  ].filter(insight => insight.value !== "N/A"); // Filter out insights with no data

  if (insights.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-700 mb-2">Performance Insights</h3>
      <div className="p-4 border rounded-lg bg-white">
        <ul className="space-y-2">
          {insights.map((insight, index) => (
            <li key={index} className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{insight.label}:</span>
              <span className="font-semibold text-gray-900">{insight.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}