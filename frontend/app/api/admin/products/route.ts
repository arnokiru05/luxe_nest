// @ts-nocheck
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { isAuthenticated } from "@/lib/auth"
// No dummy data import
// GET /api/admin/products - Get all products
export async function GET(request) {
  try {
    // Verify admin authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const sort = searchParams.get("sort") || "createdAt"
    const order = searchParams.get("order") || "desc"

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build filter conditions
    const where = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }
    
    if (category) {
      where.categoryId = category
    }

    // Handle low stock query
    const stock = searchParams.get("stock")
    if (stock === "low") {
      where.stock = {
        lte: 10, // Consider products with 10 or fewer items as low stock
        gt: 0, // Exclude out of stock items
      }
    } else if (stock === "out") {
      where.stock = 0
    }

    // Query the database
    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
      include: {
        category: true,
      },
    })
    
    const totalProducts = await prisma.product.count({ where })

    const response = NextResponse.json({
      products,
      pagination: {
        total: totalProducts,
        page,
        limit,
        pages: Math.ceil(totalProducts / limit),
      },
    })
    
    return response
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

// POST /api/admin/products - Create a new product
export async function POST(request) {
  try {
    // Verify admin authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Parse request body
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
    
    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });
    
    if (existingProduct) {
      return NextResponse.json(
        { error: "A product with this slug already exists" },
        { status: 400 }
      );
    }

    // Validate price and stock
    const price = parseFloat(body.price)
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Price must be a valid positive number" },
        { status: 400 }
      )
    }

    const stock = parseInt(body.stock || "0")
    if (isNaN(stock) || stock < 0) {
      return NextResponse.json(
        { error: "Stock must be a valid non-negative number" },
        { status: 400 }
      )
    }

    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: body.categoryId },
    })
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    // Create the product in the database
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: slug,
        description: body.description,
        price: price,
        stock: stock,
        inStock: body.inStock ?? (stock > 0),
        features: Array.isArray(body.features) ? body.features.filter(f => f.trim() !== "") : [],
        specs: typeof body.specs === "object" ? body.specs : {},
        image: body.image || "/products/default-product.svg",
        categoryId: body.categoryId,
      },
      include: {
        category: true,
      },
    })

    const response = NextResponse.json({ product }, { status: 201 })
    
    return response
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}
