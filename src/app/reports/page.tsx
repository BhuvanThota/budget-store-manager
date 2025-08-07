// src/app/reports/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, ShoppingCart } from 'lucide-react';

import { ReportData as SalesReportData } from '@/types/report'; 

// Components used for displaying the report data
import PerformanceInsights from '@/components/reports/PerformanceInsights';
import TopProducts from '@/components/reports/TopProducts';
import MetricCard from '@/components/reports/MetricCard';
import ProductPurchaseBreakdown from '@/components/reports/ProductPurchaseBreakdown';
import ReportDownloadButtons from '@/components/reports/ReportDownloadButtons';
// NEW: Import the category components
import CategorySalesChart from '@/components/reports/CategorySalesChart';
import CategoryPurchaseBreakdown from '@/components/reports/CategoryPurchaseBreakdown';


// MODIFIED: Updated the PurchaseReportData type
type PurchaseReportData = {
  summary: {
    totalPurchaseValue: number;
    totalOrders: number;
  };
  productBreakdown: {
    productId: string;
    productName: string;
    totalQuantity: number;
    totalCost: number;
  }[];
  categoryBreakdown: {
    name: string;
    totalQuantity: number;
    totalCost: number;
  }[];
};

const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];

const fetchReport = async (reportType: 'sales' | 'purchases', startDate: string, endDate: string) => {
    const endpoint = reportType === 'sales'
      ? `/api/reports?startDate=${startDate}&endDate=${endDate}`
      : `/api/reports/purchases?startDate=${startDate}&endDate=${endDate}`;
    
    const res = await fetch(endpoint);

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to fetch ${reportType} report`);
    }

    return res.json();
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'sales' | 'purchases'>('sales');
  
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [startDate, setStartDate] = useState(formatDateForInput(thirtyDaysAgo));
  const [endDate, setEndDate] = useState(formatDateForInput(today));
  const [activePreset, setActivePreset] = useState<'Today' | 'Last 7 Days' | 'This Month' | 'Last 30 Days' | null>('Last 30 Days');

  const [allReportsData, setAllReportsData] = useState<{
    sales?: SalesReportData;
    purchases?: PurchaseReportData;
  }>({});

  const { data: reportData, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['reports', reportType, startDate, endDate],
    queryFn: () => fetchReport(reportType, new Date(startDate).toISOString(), new Date(endDate).toISOString()),
    enabled: false,
    refetchOnWindowFocus: false,
  });

  const handleGenerateClick = () => {
    refetch().then((result) => {
      if (result.data) {
        setAllReportsData(prev => ({
          ...prev,
          [reportType]: result.data
        }));
      }
    });
    setActivePreset(null);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const isGenerating = isLoading || isFetching;

  return (
    <div className="container mx-auto p-4 md:p-6 grid grid-cols-1 min-[760px]:grid-cols-3 gap-6">
      {/* Controls Column */}
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
                <button onClick={() => { setActivePreset('Today'); setStartDate(formatDateForInput(new Date())); setEndDate(formatDateForInput(new Date()))}} className={`p-2 rounded-md hover:bg-gray-300 ${activePreset === 'Today' ? 'bg-orange-200 font-bold' : 'bg-gray-200'}`}>Today</button>
                <button onClick={() => { setActivePreset('Last 7 Days'); const to = new Date(); const from = new Date(); from.setDate(to.getDate() - 7); setStartDate(formatDateForInput(from)); setEndDate(formatDateForInput(to));}} className={`p-2 rounded-md hover:bg-gray-300 ${activePreset === 'Last 7 Days' ? 'bg-orange-200 font-bold' : 'bg-gray-200'}`}>Last 7 Days</button>
                <button onClick={() => { setActivePreset('This Month'); const to = new Date(); const from = new Date(to.getFullYear(), to.getMonth(), 1); setStartDate(formatDateForInput(from)); setEndDate(formatDateForInput(to));}} className={`p-2 rounded-md hover:bg-gray-300 ${activePreset === 'This Month' ? 'bg-orange-200 font-bold' : 'bg-gray-200'}`}>This Month</button>
                <button onClick={() => { setActivePreset('Last 30 Days'); const to = new Date(); const from = new Date(); from.setDate(to.getDate() - 30); setStartDate(formatDateForInput(from)); setEndDate(formatDateForInput(to));}} className={`p-2 rounded-md hover:bg-gray-300 ${activePreset === 'Last 30 Days' ? 'bg-orange-200 font-bold' : 'bg-gray-200'}`}>Last 30 Days</button>
          </div>
          <button onClick={handleGenerateClick} disabled={isGenerating} className="mt-6 w-full bg-brand-primary text-white py-2 px-4 rounded-md hover:bg-brand-primary/90 disabled:opacity-50">
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        <div className="mt-6">
          <ReportDownloadButtons
            reportType={reportType}
            salesData={allReportsData.sales}
            purchaseData={allReportsData.purchases}
            startDate={startDate}
            endDate={endDate}
            isDataAvailable={!!reportData}
          />
        </div>
      </div>

      {/* Report Display Column */}
      <div className="min-[760px]:col-span-2 bg-white p-6 rounded-lg shadow-md">
        <div className="flex border-b mb-4">
          <button onClick={() => setReportType('sales')} className={`px-4 py-2 font-semibold ${reportType === 'sales' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-500'}`}>Sales Summary</button>
          <button onClick={() => setReportType('purchases')} className={`px-4 py-2 font-semibold ${reportType === 'purchases' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-500'}`}>Purchase Summary</button>
        </div>
        
        {isGenerating && <p>Loading report...</p>}
        {error && <p className="text-red-500 font-semibold">{(error as Error).message}</p>}
        
        {/* Sales Report Display */}
        {reportType === 'sales' && !isGenerating && !error && (
            !reportData ? (
                <div className="text-center py-10">
                    <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Generate a report to see sales data.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <MetricCard title="Total Revenue" value={(reportData as SalesReportData).totalRevenue.toFixed(2)} prefix="₹" bgColor="bg-yellow-50" textColor="text-yellow-600" />
                        <MetricCard title="Total Profit" value={(reportData as SalesReportData).totalProfit.toFixed(2)} prefix="₹" bgColor="bg-green-50" textColor="text-green-600" />
                        <MetricCard title="Total Orders" value={String((reportData as SalesReportData).totalOrders)} bgColor="bg-indigo-50" textColor="text-indigo-600" />
                        <MetricCard title="Avg. Order Value" value={(reportData as SalesReportData).averageOrderValue.toFixed(2)} prefix="₹" bgColor="bg-purple-50" textColor="text-purple-600" />
                    </div>
                    {/* NEW: Render Category Sales Chart */}
                    <CategorySalesChart data={(reportData as SalesReportData).categorySales} />
                    <PerformanceInsights reportData={reportData as SalesReportData} />
                    <TopProducts reportData={reportData as SalesReportData} />
                </div>
            )
        )}

        {/* Purchase Report Display */}
        {reportType === 'purchases' && !isGenerating && !error && (
            !reportData ? (
                <div className="text-center py-10">
                    <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Generate a report to see purchase data.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <MetricCard title="Total Purchase Value" value={formatCurrency((reportData as PurchaseReportData).summary.totalPurchaseValue)} prefix="" bgColor="bg-blue-50" textColor="text-blue-600" />
                        <MetricCard title="Total Purchase Orders" value={String((reportData as PurchaseReportData).summary.totalOrders)} bgColor="bg-cyan-50" textColor="text-cyan-600" />
                    </div>
                    {/* NEW: Render Category Purchase Breakdown */}
                    <CategoryPurchaseBreakdown breakdown={(reportData as PurchaseReportData).categoryBreakdown} />
                    <ProductPurchaseBreakdown breakdown={(reportData as PurchaseReportData).productBreakdown} />
                </div>
            )
        )}
      </div>
    </div>
  );
}