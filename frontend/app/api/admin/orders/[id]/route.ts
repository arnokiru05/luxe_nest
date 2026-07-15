// @ts-nocheck
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { isAuthenticated } from "@/lib/auth"

// GET /api/admin/orders/:id - Get a specific order
export async function GET(request, { params }) {
  try {
    // Verify admin authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const resolvedParams = await params
    const orderId = resolvedParams.id
    
    // Query the database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
      },
    })
    
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    const response = NextResponse.json({ order })
    
    return response
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/orders/:id - Update order status
export async function PATCH(request, { params }) {
  try {
    // Verify admin authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const resolvedParams = await params
    const orderId = resolvedParams.id
    const { status } = await request.json()
    
    // Validate status
    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 }
      )
    }
    
    // Update the order in the database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    const response = NextResponse.json({ order: updatedOrder })
    
    return response
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/orders/:id - Delete an order
export async function DELETE(request, { params }) {
  try {
    // Verify admin authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const resolvedParams = await params
    const orderId = resolvedParams.id
    
    // Delete the order from the database
    await prisma.order.delete({
      where: { id: orderId },
    })

    const response = NextResponse.json({ success: true })
    
    return response
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    )
  }
}
