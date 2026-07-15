// @ts-nocheck
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { isAuthenticated } from "@/lib/auth"

// GET /api/admin/categories - Get all categories
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

    // Query the database
    const categories = await prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })
    
    const totalCategories = await prisma.category.count({ where })

    const response = NextResponse.json({
      categories,
      pagination: {
        total: totalCategories,
        page,
        limit,
        pages: Math.ceil(totalCategories / limit),
      },
    })
    
    return response
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

// POST /api/admin/categories - Create a new category
export async function POST(request) {
  try {
    // Verify admin authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ["name", "description"]
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
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 400 }
      );
    }

    // Create the category in the database
    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: slug,
        description: body.description,
        image: body.image || "/categories/default-category.svg",
      },
    })

    const response = NextResponse.json({ category }, { status: 201 })
    
    return response
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    )
  }
}
