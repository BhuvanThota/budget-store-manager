// src/components/reports/PerformanceInsights.tsx
import { Calendar, Zap } from 'lucide-react';
import { ReportData } from '@/types/report';

interface PerformanceInsightsProps {
  reportData: ReportData;
}

export default function PerformanceInsights({ reportData }: PerformanceInsightsProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Performance Insights</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg flex items-center">
          <Zap className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800">Busiest Day</p>
            <p className="font-bold text-blue-900">{reportData.busiestDay?.day || 'N/A'}</p>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg flex items-center">
          <Calendar className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm text-green-800">Most Profitable Day</p>
            <p className="font-bold text-green-900">{reportData.mostProfitableDay?.day || 'N/A'}</p>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg flex items-center">
          <Calendar className="h-6 w-6 text-purple-500 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm text-purple-800">Most Profitable Month</p>
            <p className="font-bold text-purple-900">{reportData.mostProfitableMonth?.month || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}