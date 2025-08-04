// app/api/reports/purchases/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma as db } from '@/lib/prisma'; // Using 'db' alias for consistency with your variable names

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

    // --- Applying the CORRECT date handling from your sales report ---
    const startDate = new Date(startDateStr);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(endDateStr);
    endDate.setUTCHours(23, 59, 59, 999);
    
    // --- The rest of the logic can now work correctly ---
    const purchaseOrders = await db.purchaseOrder.findMany({
      where: {
        shopId: user.shopId, // Added shopId check for security
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // --- Aggregation Logic (remains the same) ---
    let totalPurchaseValue = 0;
    const productSummary: {
      [productId: string]: {
        productId: string;
        productName: string;
        totalQuantity: number;
        totalCost: number;
      };
    } = {};

    const productIds = new Set<string>();
    purchaseOrders.forEach(po => {
        po.items.forEach(item => {
            productIds.add(item.productId);
        });
    });

    const products = await db.product.findMany({
        where: { id: { in: Array.from(productIds) } },
        select: { id: true, name: true }
    });

    const productNameMap = new Map(products.map(p => [p.id, p.name]));

    for (const po of purchaseOrders) {
      for (const item of po.items) {
        const itemCost = item.quantityOrdered * item.costPricePerItem;
        totalPurchaseValue += itemCost;

        if (!productSummary[item.productId]) {
          productSummary[item.productId] = {
            productId: item.productId,
            productName: productNameMap.get(item.productId) || 'Unknown Product',
            totalQuantity: 0,
            totalCost: 0,
          };
        }

        productSummary[item.productId].totalQuantity += item.quantityOrdered;
        productSummary[item.productId].totalCost += itemCost;
      }
    }
    
    const report = {
      summary: {
        totalPurchaseValue,
        totalOrders: purchaseOrders.length,
      },
      productBreakdown: Object.values(productSummary).sort((a,b) => b.totalCost - a.totalCost),
    };

    return NextResponse.json(report);

  } catch (error) {
    console.error('[REPORTS_PURCHASES_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}