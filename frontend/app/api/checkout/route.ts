import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, address, items, deliveryFee: rawDeliveryFee, shippingZone } = body;
    const deliveryFee = Number(rawDeliveryFee) || 0;

    // Basic validation
    if (!name || !phone || !address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required checkout details or cart is empty." },
        { status: 400 }
      );
    }

    const order = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData: {
        productId: string;
        productName: string;
        unitPrice: number;
        quantity: number;
      }[] = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
        });

        if (!product) {
          // Product may have been deleted — use price from cart
          const unitPrice = Number(item.price) || 0;
          subtotal += unitPrice * (Number(item.quantity) || 1);
          orderItemsData.push({
            productId: item.id,
            productName: item.name,
            unitPrice,
            quantity: Number(item.quantity) || 1,
          });
          continue;
        }

        if (!product.isActive) {
          throw new Error(`"${product.name}" is no longer available.`);
        }

        const qty = Number(item.quantity) || 1;
        if (product.stock < qty) {
          throw new Error(
            `Insufficient stock for "${product.name}". Only ${product.stock} left.`
          );
        }

        // Decrement stock atomically
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - qty },
        });

        // Use live discounted price from DB (not stale cart price)
        const discountMultiplier = 1 - product.discountPercent / 100;
        const unitPrice = Number(product.price) * discountMultiplier;
        subtotal += unitPrice * qty;

        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          unitPrice,
          quantity: qty,
        });
      }

      const newOrder = await tx.order.create({
        data: {
          customerName: name,
          phone,
          email: email || null,
          address,
          paymentMethod: "MPESA",
          subtotal,
          total: subtotal + deliveryFee,
          notes: shippingZone ? `Delivery Zone: ${shippingZone}` : null,
          status: "PENDING",
          paymentStatus: "UNPAID",
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      return newOrder;
    });

    return NextResponse.json(
      {
        success: true,
        order: {
          ...order,
          subtotal: Number(order.subtotal),
          total: Number(order.total),
          items: order.items.map((i) => ({ ...i, unitPrice: Number(i.unitPrice) })),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while creating your order." },
      { status: 400 }
    );
  }
}
