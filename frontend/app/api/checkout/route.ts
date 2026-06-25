// @ts-nocheck
import { NextResponse } from "next/server"

// ─── Mock checkout for frontend demo — no DB required ────────────────────────
// Generates a realistic-looking order object without touching Prisma/DB.

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, phone, address, items } = body

    // Basic validation
    if (!name || !email || !phone || !address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required checkout details or cart is empty." },
        { status: 400 }
      )
    }

    // Calculate total
    const computedTotal = items.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    )

    // Generate a mock order ID that looks real
    const mockOrderId = "demo-" + Math.random().toString(36).substring(2, 10).toUpperCase() + Date.now().toString(36).toUpperCase()

    // Build a realistic mock order response
    const mockOrder = {
      id: mockOrderId,
      status: "PENDING",
      total: computedTotal,
      shippingAddress: address,
      customerPhone: phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: "guest-" + Date.now(),
        name: name,
        email: email,
        phone: phone,
        address: address,
        role: "GUEST",
      },
      items: items.map((item, i) => ({
        id: `item-${i}-${Date.now()}`,
        orderId: mockOrderId,
        productId: item.id,
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
        product: {
          id: item.id,
          name: item.name,
          price: Number(item.price) || 0,
          category: item.category || "General",
          description: item.description || "",
        },
      })),
    }

    return NextResponse.json({ success: true, order: mockOrder })
  } catch (error) {
    console.error("Mock checkout error:", error)
    return NextResponse.json(
      { error: "An error occurred while creating your order.", details: error.message },
      { status: 500 }
    )
  }
}
