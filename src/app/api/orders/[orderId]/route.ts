// src/app/api/orders/[orderId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT /api/orders/[orderId] - Update an order
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> } // Corrected Type
) {
  const { orderId } = await context.params; // Correctly awaited
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { updatedItems, newTotalAmount } = await request.json();
    
    await prisma.$transaction(async (tx) => {
      const originalOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!originalOrder) throw new Error('Order not found');

      for (const updatedItem of updatedItems) {
        const originalItem = originalOrder.items.find(item => item.id === updatedItem.id);
        if (originalItem) {
          const quantityDifference = originalItem.quantity - updatedItem.quantity;
          
          await tx.product.update({
            where: { id: originalItem.productId },
            data: { currentStock: { increment: quantityDifference } },
          });

          await tx.orderItem.update({
            where: { id: updatedItem.id },
            data: { quantity: updatedItem.quantity },
          });
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: { totalAmount: newTotalAmount },
      });
    });

    return NextResponse.json({ message: 'Order updated successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error updating order ${orderId}:`, error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

// DELETE /api/orders/[orderId] - Delete an order and restore stock
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> } // Corrected Type
) {
  const { orderId } = await context.params; // Correctly awaited
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const orderToDelete = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!orderToDelete) {
        throw new Error('Order not found');
      }

      for (const item of orderToDelete.items) {
        const productExists = await tx.product.findUnique({ where: { id: item.productId } });
        if (productExists) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      await tx.order.delete({
        where: { id: orderId },
      });
    });

    return NextResponse.json({ message: 'Order deleted and stock restored' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting order ${orderId}:`, error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}