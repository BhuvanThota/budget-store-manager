// src/app/api/inventory/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/inventory - Fetch all products for the user's shop
export async function GET() {
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

    const products = await prisma.product.findMany({
      where: { shopId: user.shopId },
      include: {
        category: true, // Also fetch category details
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}

// POST /api/inventory - Create a new product
export async function POST(req: Request) {
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

    const data = await req.json();
    const costPrice = parseFloat(data.costPrice) || 0;
    
    // --- NEW LOGIC ---
    // Automatically calculate the floor price based on the cost price.
    const minimumProfit = Math.max(1, costPrice * 0.05);
    const calculatedFloorPrice = costPrice + minimumProfit;

    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        costPrice: costPrice,
        sellPrice: parseFloat(data.sellPrice) || 0,
        floorPrice: calculatedFloorPrice, // Set the calculated floor price on creation
        totalStock: parseInt(data.currentStock, 10) || 0, // Ensure initial stock is set
        currentStock: parseInt(data.currentStock, 10) || 0,
        stockThreshold: parseInt(data.stockThreshold, 10) || 10,
        shopId: user.shopId,
        categoryId: data.categoryId || null,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
       const body = await req.json().catch(() => ({ name: 'Unknown' }));
       return NextResponse.json({ message: `A product with the name "${body.name}" already exists.` }, { status: 409 });
    }
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}