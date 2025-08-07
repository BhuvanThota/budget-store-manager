// src/app/api/inventory/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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
    // MODIFIED: Add categoryId to the data update object
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        costPrice: parseFloat(data.costPrice),
        sellPrice: parseFloat(data.sellPrice),
        currentStock: parseInt(data.currentStock, 10),
        stockThreshold: parseInt(data.stockThreshold, 10),
        // Update categoryId. If data.categoryId is null or undefined, it will be set to null.
        categoryId: data.categoryId,
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
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Handle cases where deletion is not possible (e.g., product is in an order)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json({ message: 'Cannot delete product because it is part of an existing order or purchase order.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}