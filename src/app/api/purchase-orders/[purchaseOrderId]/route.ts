// src/app/api/purchase-orders/[purchaseOrderId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PurchaseOrderStatus } from '@prisma/client';

/**
 * GET /api/purchase-orders/[purchaseOrderId]
 * Fetches a single purchase order by its ID.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ purchaseOrderId: string }> }
) {
  const { purchaseOrderId } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { shopId: true },
    });

    if (!user || !user.shopId) {
      return NextResponse.json({ message: 'Shop not found for user' }, { status: 404 });
    }

    const purchaseOrder = await prisma.purchaseOrder.findFirst({
      where: {
        id: purchaseOrderId,
        shopId: user.shopId, // This is safe because of the check above
      },
      include: {
        items: true,
      },
    });

    if (!purchaseOrder) {
      return NextResponse.json({ message: 'Purchase order not found' }, { status: 404 });
    }

    return NextResponse.json(purchaseOrder);
  } catch (error) {
    console.error(`Error fetching purchase order ${purchaseOrderId}:`, error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

/**
 * PUT /api/purchase-orders/[purchaseOrderId]
 * Updates a purchase order, including its status and items.
 * Handles receiving stock and updating product inventory.
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ purchaseOrderId: string }> }
) {
  const { purchaseOrderId } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { shopId: true } });
    if (!user || !user.shopId) {
      return NextResponse.json({ message: 'Shop not found for user' }, { status: 404 });
    }

    const { status, ...otherData } = await request.json();

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Fetch the original purchase order to compare status and items
      const originalPO = await tx.purchaseOrder.findFirst({
        // FIX: Added non-null assertion `!` to user.shopId
        where: { id: purchaseOrderId, shopId: user.shopId! },
        include: { items: true },
      });

      if (!originalPO) {
        throw new Error('Purchase order not found');
      }

      // 2. Handle stock updates if status changes to RECEIVED
      if (status === 'RECEIVED' && originalPO.status !== 'RECEIVED') {
        for (const item of originalPO.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            // Calculate new average cost price
            const existingTotalCost = product.costPrice * product.currentStock;
            const newItemsTotalCost = item.costPricePerItem * item.quantityOrdered;
            const newTotalStock = product.currentStock + item.quantityOrdered;
            const newAverageCost = (existingTotalCost + newItemsTotalCost) / newTotalStock;

            await tx.product.update({
              where: { id: item.productId },
              data: {
                currentStock: { increment: item.quantityOrdered },
                totalStock: { increment: item.quantityOrdered },
                costPrice: newAverageCost,
              },
            });
          }
        }
        // Update the receivedDate only when status is set to RECEIVED
        otherData.receivedDate = new Date();
      }
      
      // 3. Update the purchase order itself
      const poUpdate = await tx.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: {
          ...otherData,
          status: status as PurchaseOrderStatus,
        },
        include: { items: true },
      });

      return poUpdate;
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error(`Error updating purchase order ${purchaseOrderId}:`, error);
    if (error instanceof Error && error.message === 'Purchase order not found') {
        return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Something went wrong while updating the purchase order' }, { status: 500 });
  }
}


/**
 * DELETE /api/purchase-orders/[purchaseOrderId]
 * Deletes a purchase order. If the order was already received, it reverts the stock changes.
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ purchaseOrderId: string }> }
) {
  const { purchaseOrderId } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { shopId: true } });
    if (!user || !user.shopId) {
      return NextResponse.json({ message: 'Shop not found for user' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Find the purchase order to be deleted
      const poToDelete = await tx.purchaseOrder.findFirst({
        // FIX: Added non-null assertion `!` to user.shopId
        where: { id: purchaseOrderId, shopId: user.shopId! },
        include: { items: true },
      });

      if (!poToDelete) {
        throw new Error('Purchase order not found');
      }

      // 2. If the order was already received, we must revert the stock and cost price changes
      if (poToDelete.status === 'RECEIVED') {
        for (const item of poToDelete.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            // Revert stock
            const newTotalStock = product.totalStock - item.quantityOrdered;
            const newCurrentStock = product.currentStock - item.quantityOrdered;

            // Recalculate average cost price by removing the contribution of this purchase order
            const totalCostBeforeThisPO = product.costPrice * product.totalStock;
            const costOfThisPO = item.costPricePerItem * item.quantityOrdered;
            const remainingStock = newTotalStock > 0 ? newTotalStock : 1; // Avoid division by zero
            const newAverageCost = (totalCostBeforeThisPO - costOfThisPO) / remainingStock;

            await tx.product.update({
              where: { id: item.productId },
              data: {
                currentStock: newCurrentStock < 0 ? 0 : newCurrentStock,
                totalStock: newTotalStock < 0 ? 0 : newTotalStock,
                costPrice: newTotalStock > 0 ? newAverageCost : 0,
              },
            });
          }
        }
      }

      // 3. Delete the purchase order items first
      await tx.purchaseOrderItem.deleteMany({
        where: { purchaseOrderId: purchaseOrderId },
      });

      // 4. Delete the purchase order itself
      await tx.purchaseOrder.delete({
        where: { id: purchaseOrderId },
      });
    });

    return NextResponse.json({ message: 'Purchase order deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting purchase order ${purchaseOrderId}:`, error);
    if (error instanceof Error && error.message === 'Purchase order not found') {
        return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}