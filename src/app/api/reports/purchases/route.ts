// app/api/reports/purchases/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma as db } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    if (!startDateStr || !endDateStr) {
        return NextResponse.json({ message: 'Start and end dates are required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
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
    
    // MODIFIED: Query now includes product and category data
    const purchaseOrders = await db.purchaseOrder.findMany({
      where: {
        shopId: user.shopId,
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
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
      orderBy: { createdAt: 'desc' },
    });

    let totalPurchaseValue = 0;
    const productSummary: { [productId: string]: { productId: string; productName: string; totalQuantity: number; totalCost: number; } } = {};
    // NEW: Add aggregator for category purchases
    const categoryAggregator: { [key: string]: { name: string, totalCost: number, totalQuantity: number } } = {};

    for (const po of purchaseOrders) {
      for (const item of po.items) {
        const itemCost = item.quantityOrdered * item.costPricePerItem;
        totalPurchaseValue += itemCost;

        if (!productSummary[item.productId]) {
          productSummary[item.productId] = {
            productId: item.productId,
            productName: item.productName,
            totalQuantity: 0,
            totalCost: 0,
          };
        }
        productSummary[item.productId].totalQuantity += item.quantityOrdered;
        productSummary[item.productId].totalCost += itemCost;

        // NEW: Aggregate category data
        const categoryName = item.product?.category?.name || 'Uncategorized';
        if (!categoryAggregator[categoryName]) {
            categoryAggregator[categoryName] = { name: categoryName, totalCost: 0, totalQuantity: 0 };
        }
        categoryAggregator[categoryName].totalCost += itemCost;
        categoryAggregator[categoryName].totalQuantity += item.quantityOrdered;
      }
    }
    
    // NEW: Format and sort category purchase data
    const categoryBreakdown = Object.values(categoryAggregator).sort((a,b) => b.totalCost - a.totalCost);

    const report = {
      summary: {
        totalPurchaseValue,
        totalOrders: purchaseOrders.length,
      },
      productBreakdown: Object.values(productSummary).sort((a,b) => b.totalCost - a.totalCost),
      categoryBreakdown, // NEW: Include in response
    };

    return NextResponse.json(report);

  } catch (error) {
    console.error('[REPORTS_PURCHASES_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}