// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CartItem } from '@/types/product';

// POST /api/orders - Creates a new order with discount validation
export async function POST(request: NextRequest) {
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

    const { cartItems, totalAmount } = await request.json();

    if (!cartItems || cartItems.length === 0 || totalAmount == null) {
      return NextResponse.json({ message: 'Invalid order data' }, { status: 400 });
    }

    const newOrder = await prisma.$transaction(async (tx) => {
      const productIds = cartItems.map((item: CartItem) => item.id);
      const productsInDb = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      // --- NEW SERVER-SIDE VALIDATION: Check against the entire cart ---
      const cartSubtotal = cartItems.reduce((sum: number, item: CartItem) => sum + item.sellPrice * item.quantity, 0);
      const totalDiscount = cartSubtotal - totalAmount;

      const totalFloorPrice = cartItems.reduce((sum: number, item: CartItem) => {
          const product = productsInDb.find(p => p.id === item.id);
          const floorPrice = product ? product.floorPrice : 0;
          return sum + (floorPrice * item.quantity);
      }, 0);

      const maxCartDiscount = cartSubtotal - totalFloorPrice;

      if (totalDiscount > maxCartDiscount + 0.01) { // Add a small tolerance for floating point rounding
          throw new Error(
              `The total discount of ₹${totalDiscount.toFixed(2)} exceeds the maximum allowed discount of ₹${maxCartDiscount.toFixed(2)} for this cart.`
          );
      }

      const order = await tx.order.create({
        data: {
          totalAmount: totalAmount,
          shopId: user.shopId!,
          items: {
            create: cartItems.map((item: CartItem) => {
              const product = productsInDb.find(p => p.id === item.id);
              return {
                quantity: item.quantity,
                soldAt: item.sellPrice,
                costAtSale: product ? product.costPrice : 0,
                discount: item.discount || 0, // Store the validated discount
                productId: item.id,
                productName: item.name,
              };
            }),
          },
        },
      });

      // Decrement stock for each product sold
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });

    return NextResponse.json(newOrder, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    // If our validation throws an error, it will be caught here
    // and sent as a user-friendly message to the frontend.
    if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Something went wrong while creating the order' }, { status: 500 });
  }
}

// GET /api/orders - Fetches paginated AND filtered orders
export async function GET(request: NextRequest) {
    // This function remains unchanged.
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const skip = (page - 1) * limit;

    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    if (!startDateStr || !endDateStr) {
        return NextResponse.json({ message: 'Start and end dates are required' }, { status: 400 });
    }

    const startDate = new Date(startDateStr);
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date(endDateStr);
    endDate.setUTCHours(23, 59, 59, 999);

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { shopId: true },
        });

        if (!user || !user.shopId) {
            return NextResponse.json({ message: 'Shop not found for user' }, { status: 404 });
        }

        const whereClause = {
            shopId: user.shopId,
            createdAt: {
                gte: startDate,
                lte: endDate,
            },
        };

        const [orders, totalOrders] = await prisma.$transaction([
            prisma.order.findMany({
                where: whereClause,
                include: { 
                    items: {
                        include: {
                            product: true // Include full product details if needed later
                        }
                    } 
                },
                orderBy: { createdAt: 'desc' },
                skip: skip,
                take: limit,
            }),
            prisma.order.count({ where: whereClause }),
        ]);
        
        const totalPages = Math.ceil(totalOrders / limit);

        return NextResponse.json({
            orders,
            pagination: {
                currentPage: page,
                totalPages,
                totalOrders,
            },
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ message: 'Something went wrong while fetching orders' }, { status: 500 });
    }
}