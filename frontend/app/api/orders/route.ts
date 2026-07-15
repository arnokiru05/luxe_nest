import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const whereClause: any = {};
  if (status) {
    whereClause.status = status;
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { customerName, phone, email, address, city, notes, paymentMethod, items } = data;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Order must contain items" }, { status: 400 });
    }

    const order = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        if (!product.isActive) {
          throw new Error(`Product is no longer available: ${product.name}`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
        }

        // Decrement stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity },
        });

        // Calculate unit price after discount
        const discountMultiplier = 1 - (product.discountPercent / 100);
        const unitPrice = Number(product.price) * discountMultiplier;

        subtotal += unitPrice * item.quantity;

        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          unitPrice,
          quantity: item.quantity,
        });
      }

      const newOrder = await tx.order.create({
        data: {
          customerName,
          phone,
          email,
          address,
          city,
          notes,
          paymentMethod: paymentMethod || "MPESA",
          subtotal,
          total: subtotal,
          status: "PENDING",
          paymentStatus: "UNPAID",
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
