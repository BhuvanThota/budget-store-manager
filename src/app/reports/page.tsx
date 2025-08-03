// src/app/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { ReportData } from '@/types/report';
import PerformanceInsights from '@/components/reports/PerformanceInsights';
import TopProducts from '@/components/reports/TopProducts';
import MetricCard from '@/components/reports/MetricCard';

const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];

// Updated MetricCard to accept color class names


export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [startDate, setStartDate] = useState(formatDateForInput(thirtyDaysAgo));
  const [endDate, setEndDate] = useState(formatDateForInput(today));

  const generateReport = async () => {
    setIsLoading(true);
    setError(null);
    setReportData(null);

    try {
      const res = await fetch(`/api/reports?startDate=${new Date(startDate).toISOString()}&endDate=${new Date(endDate).toISOString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to generate report');
      }
      setReportData(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    generateReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDateRangeAndGenerate = (start: Date, end: Date) => {
    setStartDate(formatDateForInput(start));
    setEndDate(formatDateForInput(end));
  };

  return (
    <div className="container mx-auto p-4 md:p-6 grid grid-cols-1 min-[760px]:grid-cols-3 gap-6">
      {/* Controls Column (Master) */}
      <div className="min-[760px]:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">📊 Select Report Period</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">End Date</label>
              <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
            </div>
          </div>
           <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <button onClick={() => setDateRangeAndGenerate(new Date(), new Date())} className="bg-gray-200 p-2 rounded-md hover:bg-gray-300">Today</button>
              <button onClick={() => {
                const today = new Date();
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(today.getDate() - 7);
                setDateRangeAndGenerate(sevenDaysAgo, today);
              }} className="bg-gray-200 p-2 rounded-md hover:bg-gray-300">Last 7 Days</button>
              <button onClick={() => {
                const today = new Date();
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                setDateRangeAndGenerate(firstDay, today);
              }} className="bg-gray-200 p-2 rounded-md hover:bg-gray-300">This Month</button>
              <button onClick={() => {
                  const today = new Date();
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(today.getDate() - 30);
                  setDateRangeAndGenerate(thirtyDaysAgo, today);
              }} className="bg-gray-200 p-2 rounded-md hover:bg-gray-300">Last 30 Days</button>
          </div>
          <button onClick={generateReport} disabled={isLoading} className="mt-6 w-full bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-primary/90 disabled:opacity-50">
            {isLoading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Report Display Column (Detail) */}
      <div className="min-[760px]:col-span-2 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-700 border-b pb-2 mb-4">📋 Report Summary</h2>
        {isLoading && <p>Loading report...</p>}
        {error && <p className="text-red-500 font-semibold">{error}</p>}
        {!isLoading && !error && !reportData && (
          <div className="text-center py-10">
            <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No data available for the selected period. Try expanding your date range.</p>
          </div>
        )}
        {reportData && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <MetricCard title="Total Revenue" value={reportData.totalRevenue.toFixed(2)} prefix="₹" bgColor="bg-yellow-50" textColor="text-yellow-600" />
                <MetricCard title="Total Profit" value={reportData.totalProfit.toFixed(2)} prefix="₹" bgColor="bg-green-50" textColor="text-green-600" />
                <MetricCard title="Total Orders" value={String(reportData.totalOrders)} bgColor="bg-indigo-50" textColor="text-indigo-600" />
                <MetricCard title="Avg. Order Value" value={reportData.averageOrderValue.toFixed(2)} prefix="₹" bgColor="bg-purple-50" textColor="text-purple-600" />
            </div>
            <PerformanceInsights reportData={reportData} />
            <TopProducts reportData={reportData} />
          </div>
        )}
      </div>
    </div>
  );
}