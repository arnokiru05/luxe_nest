// @ts-nocheck
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { verifyAuth } from "@/lib/auth"
import bcrypt from "bcryptjs"

// GET /api/admin/users - Get all users
export async function GET(request) {
  try {
    // Verify admin authentication
    const { user, error, newToken, tokenRefreshed } = await verifyAuth(request)
    
    if (error || user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""
    const sort = searchParams.get("sort") || "createdAt"
    const order = searchParams.get("order") || "desc"

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build filter conditions
    const where = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }
    
    if (role) {
      where.role = role
    }

    // Query the database
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })
    
    const totalUsers = await prisma.user.count({ where })

    const response = NextResponse.json({
      users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        pages: Math.ceil(totalUsers / limit),
      },
    })
    
    // If token was refreshed, set the new token in a cookie
    if (tokenRefreshed && newToken) {
      response.cookies.set({
        name: 'token',
        value: newToken,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      })
    }
    
    return response
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request) {
  try {
    // Verify admin authentication
    const { user, error } = await verifyAuth(request)
    
    if (error || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ["name", "email", "password", "role"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(body.password, 10)

    // Create the user in the database
    const newUser = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: body.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}


