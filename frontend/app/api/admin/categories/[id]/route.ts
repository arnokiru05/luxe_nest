// @ts-nocheck
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { isAuthenticated } from "@/lib/auth"

// PUT /api/admin/categories/:id - Update a category
export async function PUT(request, { params }) {
  try {
    // Verify admin authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const resolvedParams = await params
    const categoryId = resolvedParams.id
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
    
    // Check if slug already exists and belongs to a different category
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });
    
    if (existingCategory && existingCategory.id !== categoryId) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 400 }
      );
    }
    
    // Update the category in the database
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: body.name,
        slug: slug,
        description: body.description,
        image: body.image || "/categories/default-category.svg",
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    const response = NextResponse.json({ category: updatedCategory })
    
    return response
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update category" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/categories/:id - Delete a category
export async function DELETE(request, { params }) {
  try {
    // Verify admin authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const resolvedParams = await params
    const categoryId = resolvedParams.id
    
    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })
    
    if (category?._count?.products > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with associated products" },
        { status: 400 }
      )
    }
    
    // Delete the category from the database
    await prisma.category.delete({
      where: { id: categoryId },
    })

    const response = NextResponse.json({ success: true })
    
    return response
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    )
  }
}
