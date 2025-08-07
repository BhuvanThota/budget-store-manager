// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');

  if (!startDateStr || !endDateStr) {
    return NextResponse.json({ message: 'Start and end dates are required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { shopId: true },
    });

    if (!user || !user.shopId) {
      return NextResponse.json({ message: 'Shop not found for user' }, { status: 404 });
    }

    const startDate = new Date(startDateStr);
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date(endDateStr);
    endDate.setUTCHours(23, 59, 59, 999);

    const orders = await prisma.order.findMany({
      where: {
        shopId: user.shopId,
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        // MODIFIED: Include product and category data in the query
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (orders.length === 0) {
      return NextResponse.json({
        totalRevenue: 0, totalProfit: 0, totalOrders: 0,
        averageOrderValue: 0, topSellingProducts: [], mostSoldItem: null,
        busiestDay: null, mostProfitableDay: null, mostProfitableMonth: null,
        categorySales: [], // NEW: Return empty array for category sales
      });
    }

    let totalRevenue = 0;
    let totalProfit = 0;
    const salesByProduct: { [key: string]: number } = {};
    const ordersByDay: { [key: number]: number } = {};
    const profitByDay: { [key: number]: number } = {};
    const profitByMonth: { [key: number]: number } = {};
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    // NEW: Add aggregator for category sales
    const categoryAggregator: { [key: string]: { name: string, revenue: number, profit: number, units: number } } = {};

    for (const order of orders) {
      const orderDate = new Date(order.createdAt);
      const dayOfWeek = orderDate.getDay();
      const month = orderDate.getMonth();
      let orderProfit = 0;

      totalRevenue += order.totalAmount;
      ordersByDay[dayOfWeek] = (ordersByDay[dayOfWeek] || 0) + 1;

      for (const item of order.items) {
        const itemRevenue = item.soldAt * item.quantity;
        const itemProfit = (item.soldAt - item.costAtSale) * item.quantity;
        orderProfit += itemProfit;
        salesByProduct[item.productName] = (salesByProduct[item.productName] || 0) + item.quantity;

        // NEW: Aggregate category data
        const categoryName = item.product?.category?.name || 'Uncategorized';
        if (!categoryAggregator[categoryName]) {
          categoryAggregator[categoryName] = { name: categoryName, revenue: 0, profit: 0, units: 0 };
        }
        categoryAggregator[categoryName].revenue += itemRevenue;
        categoryAggregator[categoryName].profit += itemProfit;
        categoryAggregator[categoryName].units += item.quantity;
      }
      
      totalProfit += orderProfit;
      profitByDay[dayOfWeek] = (profitByDay[dayOfWeek] || 0) + orderProfit;
      profitByMonth[month] = (profitByMonth[month] || 0) + orderProfit;
    }

    const sortedProducts = Object.entries(salesByProduct).sort(([, a], [, b]) => b - a);
    const topSellingProducts = sortedProducts.slice(0, 5).map(([name, quantity]) => ({ name, quantity }));
    const mostSoldItem = sortedProducts.length > 0 ? { name: sortedProducts[0][0], quantity: sortedProducts[0][1] } : null;
    
    const getTopEntry = (obj: { [key: number]: number }) => {
      const entries = Object.entries(obj);
      if (entries.length === 0) return null;
      return entries.reduce((a, b) => (obj[parseInt(a[0])] > obj[parseInt(b[0])] ? a : b));
    };

    const busiestDayEntry = getTopEntry(ordersByDay);
    const mostProfitableDayEntry = getTopEntry(profitByDay);
    const mostProfitableMonthEntry = getTopEntry(profitByMonth);

    // NEW: Format and sort category sales data
    const categorySales = Object.values(categoryAggregator).sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      totalRevenue, totalProfit, totalOrders: orders.length,
      averageOrderValue: totalRevenue / orders.length,
      topSellingProducts, mostSoldItem,
      busiestDay: busiestDayEntry ? { day: weekdays[parseInt(busiestDayEntry[0])], orders: busiestDayEntry[1] } : null,
      mostProfitableDay: mostProfitableDayEntry ? { day: weekdays[parseInt(mostProfitableDayEntry[0])], profit: mostProfitableDayEntry[1] } : null,
      mostProfitableMonth: mostProfitableMonthEntry ? { month: months[parseInt(mostProfitableMonthEntry[0])], profit: mostProfitableMonthEntry[1] } : null,
      categorySales, // NEW: Include in response
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ message: 'Something went wrong while generating the report' }, { status: 500 });
  }
}