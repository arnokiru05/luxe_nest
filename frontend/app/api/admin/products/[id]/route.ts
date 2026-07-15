// @ts-nocheck
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { isAuthenticated } from "@/lib/auth"

// GET /api/admin/products/:id - Get a specific product
export async function GET(request, { params }) {
  try {
    // Verify admin authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const resolvedParams = await params
    const productId = resolvedParams.id
    
    // Query the database
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
      },
    })
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    const response = NextResponse.json({ product })
    
    return response
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

// PUT /api/admin/products/:id - Update a product
export async function PUT(request, { params }) {
  try {
    // Verify admin authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const resolvedParams = await params
    const productId = resolvedParams.id
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ["name", "description", "price", "categoryId"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }
    
    // Generate slug from name if not provided
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check if slug already exists and belongs to a different product
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });
    
    if (existingProduct && existingProduct.id !== productId) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 400 }
      );
    }
    
    const stockVal = parseInt(body.stock !== undefined && body.stock !== null ? body.stock : 0)
    const inStockVal = typeof body.inStock === 'boolean' ? body.inStock : (stockVal > 0)

    // Update the product in the database
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name,
        slug: slug,
        description: body.description,
        price: parseFloat(body.price),
        stock: isNaN(stockVal) ? 0 : stockVal,
        inStock: inStockVal,
        features: body.features || [],
        specs: body.specs || {},
        image: body.image || "/products/default-product.svg",
        categoryId: body.categoryId,
      },
      include: {
        category: true,
      },
    })

    const response = NextResponse.json({ product: updatedProduct })
    
    return response
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/products/:id - Delete a product
export async function DELETE(request, { params }) {
  try {
    // Verify admin authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const resolvedParams = await params
    const productId = resolvedParams.id
    
    // Delete the product from the database
    await prisma.product.delete({
      where: { id: productId },
    })

    const response = NextResponse.json({ success: true })
    
    return response
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
