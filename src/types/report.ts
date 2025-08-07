// src/types/report.ts

export interface ReportData {
  totalRevenue: number;
  totalProfit: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingProducts: { name: string; quantity: number }[];
  mostSoldItem: { name: string; quantity: number } | null;
  
  busiestDay: { day: string; orders: number } | null;
  mostProfitableDay: { day: string; profit: number } | null;
  mostProfitableMonth: { month: string; profit: number } | null;
  
  // NEW: Add category-based metrics
  categorySales: {
    name: string;
    revenue: number;
    profit: number;
    units: number;
  }[];
}