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
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: true,
      },
    });

    if (orders.length === 0) {
      return NextResponse.json(
        { message: `No orders found for this period.` },
        { status: 404 }
      );
    }

    let totalRevenue = 0;
    let totalProfit = 0;
    const salesByProduct: { [key: string]: number } = {};
    const ordersByDay: { [key: number]: number } = {};
    const profitByDay: { [key: number]: number } = {};
    const profitByMonth: { [key: number]: number } = {};
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    for (const order of orders) {
      const orderDate = new Date(order.createdAt);
      const dayOfWeek = orderDate.getDay();
      const month = orderDate.getMonth();
      let orderProfit = 0;

      totalRevenue += order.totalAmount;
      ordersByDay[dayOfWeek] = (ordersByDay[dayOfWeek] || 0) + 1;

      for (const item of order.items) {
        const itemProfit = (item.soldAt - item.costAtSale) * item.quantity;
        orderProfit += itemProfit;
        salesByProduct[item.productName] = (salesByProduct[item.productName] || 0) + item.quantity;
      }
      
      totalProfit += orderProfit;
      profitByDay[dayOfWeek] = (profitByDay[dayOfWeek] || 0) + orderProfit;
      profitByMonth[month] = (profitByMonth[month] || 0) + orderProfit;
    }

    const sortedProducts = Object.entries(salesByProduct).sort(([, a], [, b]) => b - a);
    const topSellingProducts = sortedProducts.slice(0, 5).map(([name, quantity]) => ({ name, quantity }));
    const mostSoldItem = sortedProducts.length > 0 ? { name: sortedProducts[0][0], quantity: sortedProducts[0][1] } : null;
    
    // Correctly type the `reduce` accumulator and parse keys to numbers
    const getTopEntry = (obj: { [key: number]: number }) => {
      const entries = Object.entries(obj);
      if (entries.length === 0) return null;
      // FIX: Parse the keys back to numbers before comparison
      return entries.reduce((a, b) => 
        (obj[parseInt(a[0])] > obj[parseInt(b[0])] ? a : b)
      );
    };

    const busiestDayEntry = getTopEntry(ordersByDay);
    const mostProfitableDayEntry = getTopEntry(profitByDay);
    const mostProfitableMonthEntry = getTopEntry(profitByMonth);

    return NextResponse.json({
      totalRevenue,
      totalProfit,
      totalOrders: orders.length,
      averageOrderValue: totalRevenue / orders.length,
      topSellingProducts,
      mostSoldItem,
      busiestDay: busiestDayEntry ? { day: weekdays[parseInt(busiestDayEntry[0])], orders: busiestDayEntry[1] } : null,
      mostProfitableDay: mostProfitableDayEntry ? { day: weekdays[parseInt(mostProfitableDayEntry[0])], profit: mostProfitableDayEntry[1] } : null,
      mostProfitableMonth: mostProfitableMonthEntry ? { month: months[parseInt(mostProfitableMonthEntry[0])], profit: mostProfitableMonthEntry[1] } : null,
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ message: 'Something went wrong while generating the report' }, { status: 500 });
  }
}