// @ts-nocheck
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import bcrypt from "bcryptjs"

// PUT /api/admin/users/:id - Update a user
export async function PUT(request, { params }) {
  try {
    // Verify admin authentication
    const { user, error } = await verifyAuth(request)
    
    if (error || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const userId = resolvedParams.id
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ["name", "email", "role"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }
    
    // Check if email is already taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    })
    
    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }
    
    // Prepare update data
    const updateData = {
      name: body.name,
      email: body.email,
      role: body.role,
    }
    
    // If password is provided, hash it
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10)
    }
    
    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/:id - Delete a user
export async function DELETE(request, { params }) {
  try {
    // Verify admin authentication
    const { user, error } = await verifyAuth(request)
    
    if (error || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const userId = resolvedParams.id
    
    // Prevent deleting yourself
    if (userId === user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      )
    }
    
    // Delete the user from the database
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
