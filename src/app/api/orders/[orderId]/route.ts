// src/app/api/orders/[orderId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT /api/orders/[orderId] - Update an order with discount validation
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> } // CORRECTED
) {
  const { orderId } = await context.params; // CORRECTED
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { updatedItems, totalDiscountInput, discountType } = await request.json();
    
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Fetch the original order and all associated products
      const originalOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: { 
          items: { 
            include: { product: true } 
          } 
        },
      });

      if (!originalOrder) throw new Error('Order not found');

      // 2. Calculate new subtotal based on potentially updated quantities
      const newSubtotal = updatedItems.reduce((sum: number, currentItem: { id: string, quantity: number }) => {
        const originalItem = originalOrder.items.find(item => item.id === currentItem.id);
        const price = originalItem ? originalItem.soldAt : 0;
        return sum + (price * currentItem.quantity);
      }, 0);

      // 3. Calculate and validate the new total discount
      const value = parseFloat(totalDiscountInput);
      let newTotalDiscount = 0;
      if (!isNaN(value) && value > 0) {
        newTotalDiscount = discountType === 'PERCENT' ? (newSubtotal * value) / 100 : value;
      }

      const totalFloorPrice = updatedItems.reduce((sum: number, currentItem: { id: string, quantity: number }) => {
        const originalItem = originalOrder.items.find(item => item.id === currentItem.id);
        const floorPrice = originalItem ? originalItem.product.floorPrice : 0;
        return sum + (floorPrice * currentItem.quantity);
      }, 0);

      const maxAllowedDiscount = newSubtotal - totalFloorPrice;

      if (newTotalDiscount > maxAllowedDiscount + 0.01) {
        throw new Error(`The new discount of ₹${newTotalDiscount.toFixed(2)} exceeds the maximum allowed of ₹${maxAllowedDiscount.toFixed(2)} for this order.`);
      }

      const newTotalAmount = Math.ceil(newSubtotal - newTotalDiscount);

      // 4. Update item quantities and stock levels
      for (const updatedItem of updatedItems) {
        const originalItem = originalOrder.items.find(item => item.id === updatedItem.id);
        if (originalItem) {
          const quantityDifference = originalItem.quantity - updatedItem.quantity;
          
          if (quantityDifference !== 0) {
            await tx.product.update({
              where: { id: originalItem.productId },
              data: { currentStock: { increment: quantityDifference } },
            });
          }

          const itemSubtotal = originalItem.soldAt * updatedItem.quantity;
          const proportion = newSubtotal > 0 ? itemSubtotal / newSubtotal : 0;
          const distributedDiscount = newTotalDiscount * proportion;
          const discountPerUnit = updatedItem.quantity > 0 ? distributedDiscount / updatedItem.quantity : 0;
          
          await tx.orderItem.update({
            where: { id: updatedItem.id },
            data: { 
              quantity: updatedItem.quantity,
              discount: discountPerUnit,
            },
          });
        }
      }

      // 5. Finally, update the order itself
      return tx.order.update({
        where: { id: orderId },
        data: { totalAmount: newTotalAmount },
      });
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error(`Error updating order ${orderId}:`, error);
    const message = error instanceof Error ? error.message : 'Something went wrong';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// DELETE /api/orders/[orderId] - Delete an order and restore stock
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> } // CORRECTED
) {
  const { orderId } = await context.params; // CORRECTED
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