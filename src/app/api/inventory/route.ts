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

    // REFINED: Only the name is required. Other fields are optional or have defaults.
    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        costPrice: parseFloat(data.costPrice) || 0,
        sellPrice: parseFloat(data.sellPrice) || 0,
        totalStock: 0, // New products start with 0 stock
        currentStock: 0, // New products start with 0 stock
        // stockThreshold will use the default value from the schema (10)
        shopId: user.shopId,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    // Check for unique constraint violation
    if (error instanceof Error && 'code' in error && (error).code === 'P2002') {
       return NextResponse.json({ message: `A product with the name "${(await req.json()).name}" already exists.` }, { status: 409 });
    }
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}