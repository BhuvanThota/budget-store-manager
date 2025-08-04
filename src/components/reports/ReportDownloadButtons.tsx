// src/components/reports/ReportDownloadButtons.tsx
'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { ReportData as SalesReportData } from '@/types/report';
import { 
  generateSalesReportPDF, 
  generatePurchaseReportPDF,
  generateCombinedReports
} from '@/lib/pdfReports';
import {
  generateSalesReportExcel,
  generatePurchaseReportExcel,
  generateCombinedExcelReport
} from '@/lib/excelReports';

// Purchase Report Data type (matching your existing structure)
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
};

interface ReportDownloadButtonsProps {
  reportType: 'sales' | 'purchases';
  salesData?: SalesReportData;
  purchaseData?: PurchaseReportData;
  startDate: string;
  endDate: string;
  isDataAvailable: boolean;
}

export default function ReportDownloadButtons({ 
  reportType, 
  salesData, 
  purchaseData, 
  startDate, 
  endDate, 
  isDataAvailable 
}: ReportDownloadButtonsProps) {
  const [isGenerating, setIsGenerating] = useState<{
    pdf: boolean;
    excel: boolean;
    combined: boolean;
  }>({
    pdf: false,
    excel: false,
    combined: false,
  });

  const handlePDFDownload = async () => {
    if (!isDataAvailable) return;
    
    setIsGenerating(prev => ({ ...prev, pdf: true }));
    
    try {
      if (reportType === 'sales' && salesData) {
        await generateSalesReportPDF(salesData, startDate, endDate);
      } else if (reportType === 'purchases' && purchaseData) {
        await generatePurchaseReportPDF(purchaseData, startDate, endDate);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGenerating(prev => ({ ...prev, pdf: false }));
    }
  };

  const handleExcelDownload = async () => {
    if (!isDataAvailable) return;
    
    setIsGenerating(prev => ({ ...prev, excel: true }));
    
    try {
      if (reportType === 'sales' && salesData) {
        await generateSalesReportExcel(salesData, startDate, endDate);
      } else if (reportType === 'purchases' && purchaseData) {
        await generatePurchaseReportExcel(purchaseData, startDate, endDate);
      }
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Failed to generate Excel report. Please try again.');
    } finally {
      setIsGenerating(prev => ({ ...prev, excel: false }));
    }
  };

  const handleCombinedDownload = async () => {
    if (!salesData || !purchaseData) {
      alert('Please generate both sales and purchase reports first.');
      return;
    }
    
    setIsGenerating(prev => ({ ...prev, combined: true }));
    
    try {
      // Generate both PDF and Excel for combined report
      await generateCombinedReports(salesData, purchaseData, startDate, endDate);
      
      // Small delay to avoid browser blocking
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await generateCombinedExcelReport(salesData, purchaseData, startDate, endDate);
      
      // Show success message
      alert('Successfully generated combined reports (PDF + Excel)!');
    } catch (error) {
      console.error('Error generating combined reports:', error);
      alert('Failed to generate reports. Please try again.');
    } finally {
      setIsGenerating(prev => ({ ...prev, combined: false }));
    }
  };

  if (!isDataAvailable) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-500">
          <Download size={20} />
          <span className="text-sm">Generate a report first to enable downloads</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Download size={20} className="text-brand-primary" />
        <h4 className="font-semibold text-gray-800">Download Options</h4>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* PDF Download */}
        <button
          onClick={handlePDFDownload}
          disabled={isGenerating.pdf}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isGenerating.pdf ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FileText size={16} />
          )}
          {isGenerating.pdf ? 'Generating...' : 'PDF Report'}
        </button>

        {/* Excel Download */}
        <button
          onClick={handleExcelDownload}
          disabled={isGenerating.excel}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isGenerating.excel ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FileSpreadsheet size={16} />
          )}
          {isGenerating.excel ? 'Generating...' : 'Excel Data'}
        </button>

        {/* Combined Report (only show if we have both data types) */}
        {salesData && purchaseData && (
          <button
            onClick={handleCombinedDownload}
            disabled={isGenerating.combined}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isGenerating.combined ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileText size={16} />
            )}
            {isGenerating.combined ? 'Generating...' : 'Combined Reports'}
          </button>
        )}
      </div>
      
      <div className="text-xs text-gray-500 mt-2">
        <p>• PDF: Visual report with charts and formatted tables</p>
        <p>• Excel: Structured data across multiple sheets for analysis</p>
        {salesData && purchaseData && (
          <p>• Combined: Complete business overview (PDF + Excel)</p>
        )}
      </div>
    </div>
  );
}