// src/lib/pdfReports.ts
// Ultra-simple PDF generation that avoids all TypeScript issues

import { ReportData as SalesReportData } from '@/types/report';

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

/**
 * Format currency consistently with Rs. prefix
 */
const formatCurrency = (amount: number): string => {
  return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Generate Sales Report PDF - Ultra Simple Version
 */
export const generateSalesReportPDF = async (
  reportData: SalesReportData,
  startDate: string,
  endDate: string
): Promise<void> => {
  try {
    // Dynamic import
    const jsPDF = (await import('jspdf')).default;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFillColor(61, 116, 182);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('Sales Report', 20, 25);
    
    doc.setFontSize(10);
    const dateRange = `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
    doc.text(`Period: ${dateRange}`, 20, 35);
    
    // Reset for content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    
    let y = 60;
    
    // Key Metrics with Colors
    doc.setFont('helvetica', 'bold');
    doc.text('Key Metrics:', 20, y);
    y += 15;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    // Revenue (Green)
    doc.setFillColor(34, 197, 94);
    doc.rect(20, y - 5, 170, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(`Revenue: ${formatCurrency(reportData.totalRevenue)}`, 25, y + 3);
    y += 15;
    
    // Profit (Blue)
    doc.setFillColor(59, 130, 246);
    doc.rect(20, y - 5, 170, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(`Profit: ${formatCurrency(reportData.totalProfit)}`, 25, y + 3);
    y += 15;
    
    // Orders (Purple)
    doc.setFillColor(147, 51, 234);
    doc.rect(20, y - 5, 170, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(`Total Orders: ${reportData.totalOrders}`, 25, y + 3);
    y += 15;
    
    // Average Order (Orange)
    doc.setFillColor(249, 115, 22);
    doc.rect(20, y - 5, 170, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(`Average Order Value: ${formatCurrency(reportData.averageOrderValue)}`, 25, y + 3);
    y += 20;
    
    // Section separator
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 15;
    
    // Performance Insights
    if (reportData.busiestDay || reportData.mostProfitableDay) {
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Performance Insights:', 20, y);
      y += 15;
      
      // Draw insights table manually
      const insights = [];
      if (reportData.busiestDay) {
        insights.push(['Busiest Day', `${reportData.busiestDay.day} (${reportData.busiestDay.orders} orders)`]);
      }
      if (reportData.mostProfitableDay) {
        insights.push(['Most Profitable Day', `${reportData.mostProfitableDay.day} (${formatCurrency(reportData.mostProfitableDay.profit)})`]);
      }
      if (reportData.mostProfitableMonth) {
        insights.push(['Most Profitable Month', `${reportData.mostProfitableMonth.month} (${formatCurrency(reportData.mostProfitableMonth.profit)})`]);
      }
      
      // Table header
      doc.setFillColor(240, 240, 240);
      doc.rect(20, y, 80, 8, 'F');
      doc.rect(100, y, 90, 8, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.rect(20, y, 80, 8, 'S');
      doc.rect(100, y, 90, 8, 'S');
      
      doc.setTextColor(45, 55, 72);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Insight', 22, y + 5.5);
      doc.text('Value', 102, y + 5.5);
      y += 8;
      
      // Table rows
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      insights.forEach((insight) => {
        doc.rect(20, y, 80, 8, 'S');
        doc.rect(100, y, 90, 8, 'S');
        doc.text(insight[0], 22, y + 5.5);
        doc.text(insight[1], 102, y + 5.5);
        y += 8;
      });
      
      y += 10;
      
      // Section separator
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(20, y, 190, y);
      y += 15;
    }
    
    // Top Products
    if (reportData.topSellingProducts && reportData.topSellingProducts.length > 0) {
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Top Selling Products:', 20, y);
      y += 15;
      
      // Table header
      doc.setFillColor(240, 240, 240);
      doc.rect(20, y, 20, 8, 'F');
      doc.rect(40, y, 120, 8, 'F');
      doc.rect(160, y, 30, 8, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.rect(20, y, 20, 8, 'S');
      doc.rect(40, y, 120, 8, 'S');
      doc.rect(160, y, 30, 8, 'S');
      
      doc.setTextColor(45, 55, 72);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Rank', 25, y + 5.5);
      doc.text('Product Name', 42, y + 5.5);
      doc.text('Units', 170, y + 5.5);
      y += 8;
      
      // Table rows
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      reportData.topSellingProducts.slice(0, 8).forEach((product, index) => {
        const productName = product.name.length > 40 
          ? product.name.substring(0, 40) + '...' 
          : product.name;
        
        doc.rect(20, y, 20, 8, 'S');
        doc.rect(40, y, 120, 8, 'S');
        doc.rect(160, y, 30, 8, 'S');
        
        // Center align rank
        const rankText = String(index + 1);
        const rankWidth = doc.getTextWidth(rankText);
        doc.text(rankText, 30 - rankWidth/2, y + 5.5);
        
        doc.text(productName, 42, y + 5.5);
        
        // Right align units
        const unitsText = String(product.quantity);
        const unitsWidth = doc.getTextWidth(unitsText);
        doc.text(unitsText, 188 - unitsWidth, y + 5.5);
        
        y += 8;
      });
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 280);
    doc.text('Budget Store Manager', 150, 280);
    
    // Save
    const filename = `Sales-Report-${startDate}-to-${endDate}.pdf`;
    doc.save(filename);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

/**
 * Generate Purchase Report PDF - Ultra Simple Version
 */
export const generatePurchaseReportPDF = async (
  reportData: PurchaseReportData,
  startDate: string,
  endDate: string
): Promise<void> => {
  try {
    // Dynamic import
    const jsPDF = (await import('jspdf')).default;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFillColor(61, 116, 182);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('Purchase Report', 20, 25);
    
    doc.setFontSize(10);
    const dateRange = `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
    doc.text(`Period: ${dateRange}`, 20, 35);
    
    // Reset for content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    
    let y = 60;
    
    // Purchase Summary with Colors
    doc.setFont('helvetica', 'bold');
    doc.text('Purchase Summary:', 20, y);
    y += 15;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    // Total Purchase Value (Teal)
    doc.setFillColor(20, 184, 166);
    doc.rect(20, y - 5, 170, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(`Total Purchase Value: ${formatCurrency(reportData.summary.totalPurchaseValue)}`, 25, y + 3);
    y += 15;
    
    // Total Orders (Indigo)
    doc.setFillColor(99, 102, 241);
    doc.rect(20, y - 5, 170, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(`Total Purchase Orders: ${reportData.summary.totalOrders}`, 25, y + 3);
    y += 15;
    
    // Average Order Value (Emerald) - if applicable
    if (reportData.summary.totalOrders > 0) {
      const avgOrder = reportData.summary.totalPurchaseValue / reportData.summary.totalOrders;
      doc.setFillColor(16, 185, 129);
      doc.rect(20, y - 5, 170, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(`Average Order Value: ${formatCurrency(avgOrder)}`, 25, y + 3);
      y += 15;
    }
    
    y += 10;
    
    // Section separator
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y);
    y += 15;
    
    // Product Breakdown
    if (reportData.productBreakdown && reportData.productBreakdown.length > 0) {
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Top Purchased Products:', 20, y);
      y += 15;
      
      // Table header
      doc.setFillColor(240, 240, 240);
      doc.rect(20, y, 15, 8, 'F');
      doc.rect(35, y, 90, 8, 'F');
      doc.rect(125, y, 25, 8, 'F');
      doc.rect(150, y, 40, 8, 'F');
      
      doc.setDrawColor(220, 220, 220);
      doc.rect(20, y, 15, 8, 'S');
      doc.rect(35, y, 90, 8, 'S');
      doc.rect(125, y, 25, 8, 'S');
      doc.rect(150, y, 40, 8, 'S');
      
      doc.setTextColor(45, 55, 72);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('#', 25, y + 5.5);
      doc.text('Product Name', 37, y + 5.5);
      doc.text('Qty', 133, y + 5.5);
      doc.text('Total Cost', 165, y + 5.5);
      y += 8;
      
      // Table rows
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      
      let totalQty = 0;
      let totalCost = 0;
      
      reportData.productBreakdown.slice(0, 15).forEach((product, index) => {
        const productName = product.productName.length > 35 
          ? product.productName.substring(0, 35) + '...' 
          : product.productName;
        
        // Draw cells
        doc.rect(20, y, 15, 8, 'S');
        doc.rect(35, y, 90, 8, 'S');
        doc.rect(125, y, 25, 8, 'S');
        doc.rect(150, y, 40, 8, 'S');
        
        // Add content with proper alignment
        const rankText = String(index + 1);
        const rankWidth = doc.getTextWidth(rankText);
        doc.text(rankText, 27.5 - rankWidth/2, y + 5.5); // Center align
        
        doc.text(productName, 37, y + 5.5);
        
        const qtyText = String(product.totalQuantity);
        const qtyWidth = doc.getTextWidth(qtyText);
        doc.text(qtyText, 137.5 - qtyWidth/2, y + 5.5); // Center align
        
        const costText = formatCurrency(product.totalCost);
        const costWidth = doc.getTextWidth(costText);
        doc.text(costText, 188 - costWidth, y + 5.5); // Right align
        
        totalQty += product.totalQuantity;
        totalCost += product.totalCost;
        y += 8;
      });
      
      // Totals row with highlight
      doc.setFillColor(234, 200, 166);
      doc.rect(20, y, 15, 8, 'F');
      doc.rect(35, y, 90, 8, 'F');
      doc.rect(125, y, 25, 8, 'F');
      doc.rect(150, y, 40, 8, 'F');
      
      doc.rect(20, y, 15, 8, 'S');
      doc.rect(35, y, 90, 8, 'S');
      doc.rect(125, y, 25, 8, 'S');
      doc.rect(150, y, 40, 8, 'S');
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 55, 72);
      doc.text('TOTAL', 37, y + 5.5);
      
      const totalQtyText = String(totalQty);
      const totalQtyWidth = doc.getTextWidth(totalQtyText);
      doc.text(totalQtyText, 137.5 - totalQtyWidth/2, y + 5.5);
      
      const totalCostText = formatCurrency(totalCost);
      const totalCostWidth = doc.getTextWidth(totalCostText);
      doc.text(totalCostText, 188 - totalCostWidth, y + 5.5);
      
      y += 12;
      
      if (reportData.productBreakdown.length > 15) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Note: Showing top 15 of ${reportData.productBreakdown.length} products`, 25, y);
      }
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 280);
    doc.text('Budget Store Manager', 150, 280);
    
    // Save
    const filename = `Purchase-Report-${startDate}-to-${endDate}.pdf`;
    doc.save(filename);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

/**
 * Generate both reports sequentially
 */
export const generateCombinedReports = async (
  salesData: SalesReportData,
  purchaseData: PurchaseReportData,
  startDate: string,
  endDate: string
): Promise<void> => {
  await generateSalesReportPDF(salesData, startDate, endDate);
  
  // Small delay to avoid browser blocking
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await generatePurchaseReportPDF(purchaseData, startDate, endDate);
};