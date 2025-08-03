// src/app/api/inventory/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT /api/inventory/[productId] - Update a product
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  const { productId } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }
  
  try {
    const data = await request.json();
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        totalCost: parseFloat(data.totalCost),
        initialStock: parseInt(data.initialStock),
        currentStock: data.currentStock,
        sellPrice: parseFloat(data.sellPrice),
        stockThreshold: parseInt(data.stockThreshold, 10),
      },
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(`Error updating product ${productId}:`, error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

// DELETE /api/inventory/[productId] - Delete a product
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  const { productId } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    await prisma.product.delete({
      where: { id: productId },
    });
    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting product ${productId}:`, error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}