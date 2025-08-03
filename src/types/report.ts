// src/types/report.ts

export interface ReportData {
    totalRevenue: number;
    totalProfit: number;
    totalOrders: number;
    averageOrderValue: number;
    topSellingProducts: { name: string; quantity: number }[];
    mostSoldItem: { name: string; quantity: number } | null;
    
    // New metrics
    busiestDay: { day: string; orders: number } | null;
    mostProfitableDay: { day: string; profit: number } | null;
    mostProfitableMonth: { month: string; profit: number } | null;
  }