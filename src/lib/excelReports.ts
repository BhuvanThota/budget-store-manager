// src/lib/excelReports.ts
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
 * Format currency consistently
 */
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Generate Sales Report Excel
 */
export const generateSalesReportExcel = async (
  reportData: SalesReportData,
  startDate: string,
  endDate: string
): Promise<void> => {
  try {
    // Dynamic import
    const XLSX = await import('xlsx');
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Sheet 1: Summary Data
    const summaryData = [
      ['Sales Report Summary'],
      [`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`],
      [''],
      ['Metric', 'Value'],
      ['Total Revenue', `₹${formatCurrency(reportData.totalRevenue)}`],
      ['Total Profit', `₹${formatCurrency(reportData.totalProfit)}`],
      ['Total Orders', reportData.totalOrders.toString()],
      ['Average Order Value', `₹${formatCurrency(reportData.averageOrderValue)}`],
      [''],
      ['Performance Insights'],
      ['Insight', 'Value'],
    ];

    // Add performance insights if available
    if (reportData.busiestDay) {
      summaryData.push(['Busiest Day', `${reportData.busiestDay.day} (${reportData.busiestDay.orders} orders)`]);
    }
    if (reportData.mostProfitableDay) {
      summaryData.push(['Most Profitable Day', `${reportData.mostProfitableDay.day} (₹${formatCurrency(reportData.mostProfitableDay.profit)})`]);
    }
    if (reportData.mostProfitableMonth) {
      summaryData.push(['Most Profitable Month', `${reportData.mostProfitableMonth.month} (₹${formatCurrency(reportData.mostProfitableMonth.profit)})`]);
    }

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Style the summary sheet
    summarySheet['!cols'] = [
      { width: 25 },
      { width: 30 }
    ];

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Sheet 2: Top Products Data
    if (reportData.topSellingProducts && reportData.topSellingProducts.length > 0) {
      const productsData = [
        ['Top Selling Products'],
        [''],
        ['Rank', 'Product Name', 'Units Sold'],
      ];

      reportData.topSellingProducts.forEach((product, index) => {
        productsData.push([
          (index + 1).toString(),
          product.name,
          product.quantity.toString()
        ]);
      });

      const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
      
      // Style the products sheet
      productsSheet['!cols'] = [
        { width: 8 },
        { width: 40 },
        { width: 15 }
      ];

      XLSX.utils.book_append_sheet(workbook, productsSheet, 'Top Products');
    }

    // Sheet 3: Raw Data Template (for further analysis)
    const rawDataTemplate = [
      ['Raw Data Analysis Template'],
      [''],
      ['This sheet can be used to paste order-level data for detailed analysis'],
      [''],
      ['Order ID', 'Date', 'Product', 'Quantity', 'Unit Price', 'Total Amount', 'Cost Price', 'Profit'],
      ['Sample Data:', '', '', '', '', '', '', ''],
      ['001', '2025-01-01', 'Sample Product', '2', '100', '200', '80', '40'],
    ];

    const rawDataSheet = XLSX.utils.aoa_to_sheet(rawDataTemplate);
    rawDataSheet['!cols'] = [
      { width: 12 },
      { width: 12 },
      { width: 25 },
      { width: 10 },
      { width: 12 },
      { width: 15 },
      { width: 12 },
      { width: 10 }
    ];

    XLSX.utils.book_append_sheet(workbook, rawDataSheet, 'Raw Data Template');

    // Generate and download
    const filename = `Sales-Report-${startDate}-to-${endDate}.xlsx`;
    XLSX.writeFile(workbook, filename);

  } catch (error) {
    console.error('Excel generation error:', error);
    throw new Error('Failed to generate Excel report. Please try again.');
  }
};

/**
 * Generate Purchase Report Excel
 */
export const generatePurchaseReportExcel = async (
  reportData: PurchaseReportData,
  startDate: string,
  endDate: string
): Promise<void> => {
  try {
    // Dynamic import
    const XLSX = await import('xlsx');
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Sheet 1: Summary Data
    const avgOrderValue = reportData.summary.totalOrders > 0 
      ? reportData.summary.totalPurchaseValue / reportData.summary.totalOrders 
      : 0;

    const summaryData = [
      ['Purchase Report Summary'],
      [`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`],
      [''],
      ['Metric', 'Value'],
      ['Total Purchase Value', `₹${formatCurrency(reportData.summary.totalPurchaseValue)}`],
      ['Total Purchase Orders', reportData.summary.totalOrders.toString()],
      ['Average Order Value', `₹${formatCurrency(avgOrderValue)}`],
      [''],
      ['Product Analysis'],
      ['Total Products Purchased', reportData.productBreakdown.length.toString()],
      ['Total Items Purchased', reportData.productBreakdown.reduce((sum, p) => sum + p.totalQuantity, 0).toString()],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Style the summary sheet
    summarySheet['!cols'] = [
      { width: 25 },
      { width: 30 }
    ];

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Sheet 2: Product Breakdown
    if (reportData.productBreakdown && reportData.productBreakdown.length > 0) {
      const productsData = [
        ['Product Purchase Breakdown'],
        [''],
        ['Rank', 'Product Name', 'Quantity Purchased', 'Total Cost', 'Average Cost per Unit'],
      ];

      // Sort by total cost (descending) and add rankings
      const sortedProducts = [...reportData.productBreakdown]
        .sort((a, b) => b.totalCost - a.totalCost);

      let totalQuantity = 0;
      let totalCost = 0;

      sortedProducts.forEach((product, index) => {
        const avgCostPerUnit = product.totalQuantity > 0 
          ? product.totalCost / product.totalQuantity 
          : 0;

        productsData.push([
          (index + 1).toString(),
          product.productName,
          product.totalQuantity.toString(),
          `₹${formatCurrency(product.totalCost)}`,
          `₹${formatCurrency(avgCostPerUnit)}`
        ]);

        totalQuantity += product.totalQuantity;
        totalCost += product.totalCost;
      });

      // Add totals row
      productsData.push(['']);
      productsData.push([
        'TOTAL',
        `${sortedProducts.length} Products`,
        totalQuantity.toString(),
        `₹${formatCurrency(totalCost)}`,
        totalQuantity > 0 ? `₹${formatCurrency(totalCost / totalQuantity)}` : '₹0.00'
      ]);

      const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
      
      // Style the products sheet
      productsSheet['!cols'] = [
        { width: 8 },
        { width: 35 },
        { width: 18 },
        { width: 15 },
        { width: 20 }
      ];

      XLSX.utils.book_append_sheet(workbook, productsSheet, 'Product Breakdown');
    }

    // Sheet 3: Cost Analysis
    if (reportData.productBreakdown && reportData.productBreakdown.length > 0) {
      const costAnalysisData = [
        ['Cost Analysis by Category'],
        [''],
        ['Analysis Type', 'Count', 'Percentage'],
        [''],
        ['Cost Range Analysis'],
      ];

      // Categorize products by cost ranges
      const costRanges = [
        { label: 'Low Cost (< ₹1,000)', min: 0, max: 1000 },
        { label: 'Medium Cost (₹1,000 - ₹5,000)', min: 1000, max: 5000 },
        { label: 'High Cost (₹5,000 - ₹20,000)', min: 5000, max: 20000 },
        { label: 'Very High Cost (> ₹20,000)', min: 20000, max: Infinity }
      ];

      const totalProducts = reportData.productBreakdown.length;

      costRanges.forEach(range => {
        const productsInRange = reportData.productBreakdown.filter(
          p => p.totalCost >= range.min && p.totalCost < range.max
        );
        const percentage = totalProducts > 0 ? (productsInRange.length / totalProducts * 100).toFixed(1) : '0';
        
        costAnalysisData.push([
          range.label,
          productsInRange.length.toString(),
          `${percentage}%`
        ]);
      });

      const costAnalysisSheet = XLSX.utils.aoa_to_sheet(costAnalysisData);
      costAnalysisSheet['!cols'] = [
        { width: 35 },
        { width: 12 },
        { width: 15 }
      ];

      XLSX.utils.book_append_sheet(workbook, costAnalysisSheet, 'Cost Analysis');
    }

    // Sheet 4: Raw Data Template
    const rawDataTemplate = [
      ['Purchase Orders Raw Data Template'],
      [''],
      ['This sheet can be used to paste purchase order data for detailed analysis'],
      [''],
      ['PO ID', 'Date', 'Supplier', 'Product', 'Quantity', 'Unit Cost', 'Total Cost', 'Status'],
      ['Sample Data:', '', '', '', '', '', '', ''],
      ['PO001', '2025-01-01', 'Supplier ABC', 'Sample Product', '10', '50', '500', 'RECEIVED'],
    ];

    const rawDataSheet = XLSX.utils.aoa_to_sheet(rawDataTemplate);
    rawDataSheet['!cols'] = [
      { width: 10 },
      { width: 12 },
      { width: 20 },
      { width: 25 },
      { width: 10 },
      { width: 12 },
      { width: 12 },
      { width: 12 }
    ];

    XLSX.utils.book_append_sheet(workbook, rawDataSheet, 'Raw Data Template');

    // Generate and download
    const filename = `Purchase-Report-${startDate}-to-${endDate}.xlsx`;
    XLSX.writeFile(workbook, filename);

  } catch (error) {
    console.error('Excel generation error:', error);
    throw new Error('Failed to generate Excel report. Please try again.');
  }
};

/**
 * Generate Combined Excel Report (Both Sales and Purchase data)
 */
export const generateCombinedExcelReport = async (
  salesData: SalesReportData,
  purchaseData: PurchaseReportData,
  startDate: string,
  endDate: string
): Promise<void> => {
  try {
    // Dynamic import
    const XLSX = await import('xlsx');
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Sheet 1: Executive Summary
    const purchaseOrderAvg = purchaseData.summary.totalOrders > 0 
      ? purchaseData.summary.totalPurchaseValue / purchaseData.summary.totalOrders 
      : 0;

    const grossProfitMargin = salesData.totalRevenue > 0 
      ? ((salesData.totalProfit / salesData.totalRevenue) * 100).toFixed(1) 
      : '0';

    const purchaseToSalesRatio = salesData.totalRevenue > 0 
      ? ((purchaseData.summary.totalPurchaseValue / salesData.totalRevenue) * 100).toFixed(1) 
      : '0';

    const execSummaryData = [
      ['Executive Summary - Business Performance Report'],
      [`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`],
      [''],
      ['SALES PERFORMANCE'],
      ['Metric', 'Value'],
      ['Total Revenue', `₹${formatCurrency(salesData.totalRevenue)}`],
      ['Total Profit', `₹${formatCurrency(salesData.totalProfit)}`],
      ['Total Orders', salesData.totalOrders.toString()],
      ['Average Order Value', `₹${formatCurrency(salesData.averageOrderValue)}`],
      [''],
      ['PURCHASE PERFORMANCE'],
      ['Metric', 'Value'],
      ['Total Purchase Value', `₹${formatCurrency(purchaseData.summary.totalPurchaseValue)}`],
      ['Total Purchase Orders', purchaseData.summary.totalOrders.toString()],
      ['Average Purchase Order Value', `₹${formatCurrency(purchaseOrderAvg)}`],
      [''],
      ['KEY RATIOS & INSIGHTS'],
      ['Metric', 'Value'],
      ['Gross Profit Margin', `${grossProfitMargin}%`],
      ['Purchase to Sales Ratio', `${purchaseToSalesRatio}%`],
    ];

    const execSummarySheet = XLSX.utils.aoa_to_sheet(execSummaryData);
    execSummarySheet['!cols'] = [
      { width: 30 },
      { width: 25 }
    ];

    XLSX.utils.book_append_sheet(workbook, execSummarySheet, 'Executive Summary');

    // Sheet 2: Sales Details
    const salesDetailsData = [
      ['Sales Performance Details'],
      [''],
      ['Top Selling Products'],
      ['Rank', 'Product Name', 'Units Sold'],
    ];

    if (salesData.topSellingProducts) {
      salesData.topSellingProducts.forEach((product, index) => {
        salesDetailsData.push([
          (index + 1).toString(),
          product.name,
          product.quantity.toString()
        ]);
      });
    }

    // Add performance insights
    salesDetailsData.push(['']);
    salesDetailsData.push(['Performance Insights']);
    salesDetailsData.push(['Insight', 'Value']);
    
    if (salesData.busiestDay) {
      salesDetailsData.push(['Busiest Day', `${salesData.busiestDay.day} (${salesData.busiestDay.orders} orders)`]);
    }
    if (salesData.mostProfitableDay) {
      salesDetailsData.push(['Most Profitable Day', `${salesData.mostProfitableDay.day} (₹${formatCurrency(salesData.mostProfitableDay.profit)})`]);
    }

    const salesDetailsSheet = XLSX.utils.aoa_to_sheet(salesDetailsData);
    salesDetailsSheet['!cols'] = [
      { width: 8 },
      { width: 35 },
      { width: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, salesDetailsSheet, 'Sales Details');

    // Sheet 3: Purchase Details
    const purchaseDetailsData = [
      ['Purchase Performance Details'],
      [''],
      ['Top Purchased Products'],
      ['Rank', 'Product Name', 'Quantity', 'Total Cost', 'Avg Cost/Unit'],
    ];

    if (purchaseData.productBreakdown) {
      const sortedPurchases = [...purchaseData.productBreakdown]
        .sort((a, b) => b.totalCost - a.totalCost);

      sortedPurchases.forEach((product, index) => {
        const avgCost = product.totalQuantity > 0 ? product.totalCost / product.totalQuantity : 0;
        purchaseDetailsData.push([
          (index + 1).toString(),
          product.productName,
          product.totalQuantity.toString(),
          `₹${formatCurrency(product.totalCost)}`,
          `₹${formatCurrency(avgCost)}`
        ]);
      });
    }

    const purchaseDetailsSheet = XLSX.utils.aoa_to_sheet(purchaseDetailsData);
    purchaseDetailsSheet['!cols'] = [
      { width: 8 },
      { width: 35 },
      { width: 12 },
      { width: 15 },
      { width: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, purchaseDetailsSheet, 'Purchase Details');

    // Sheet 4: Comparison Analysis
    const comparisonData = [
      ['Sales vs Purchase Comparison'],
      [''],
      ['Product Performance Analysis'],
      ['Product Name', 'Units Sold', 'Units Purchased', 'Sales Revenue', 'Purchase Cost', 'Potential Profit'],
    ];

    // Create a map of purchased products for comparison
    const purchaseMap = new Map();
    purchaseData.productBreakdown?.forEach(p => {
      purchaseMap.set(p.productName.toLowerCase(), p);
    });

    const salesMap = new Map();
    salesData.topSellingProducts?.forEach(p => {
      salesMap.set(p.name.toLowerCase(), p);
    });

    // Get all unique product names
    const allProducts = new Set([
      ...(salesData.topSellingProducts?.map(p => p.name.toLowerCase()) || []),
      ...(purchaseData.productBreakdown?.map(p => p.productName.toLowerCase()) || [])
    ]);

    allProducts.forEach(productKey => {
      const salesProduct = salesMap.get(productKey);
      const purchaseProduct = purchaseMap.get(productKey);
      
      const productName = salesProduct?.name || purchaseProduct?.productName || productKey;
      const unitsSold = salesProduct?.quantity || 0;
      const unitsPurchased = purchaseProduct?.totalQuantity || 0;
      const purchaseCost = purchaseProduct?.totalCost || 0;
      
      // Estimate sales revenue (this would need actual sales data to be accurate)
      const estimatedSalesRevenue = 'N/A'; // We don't have individual product revenue in our current data
      const estimatedProfit = 'N/A'; // Would need sales revenue to calculate
      
      comparisonData.push([
        productName,
        unitsSold.toString(),
        unitsPurchased.toString(),
        estimatedSalesRevenue,
        `₹${formatCurrency(purchaseCost)}`,
        estimatedProfit
      ]);
    });

    const comparisonSheet = XLSX.utils.aoa_to_sheet(comparisonData);
    comparisonSheet['!cols'] = [
      { width: 30 },
      { width: 12 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 15 }
    ];

    XLSX.utils.book_append_sheet(workbook, comparisonSheet, 'Comparison Analysis');

    // Generate and download
    const filename = `Business-Report-${startDate}-to-${endDate}.xlsx`;
    XLSX.writeFile(workbook, filename);

  } catch (error) {
    console.error('Excel generation error:', error);
    throw new Error('Failed to generate Excel report. Please try again.');
  }
};