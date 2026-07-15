import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const all = searchParams.get("all") === "true";

  if (all && !isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const whereClause: any = {};
  if (categoryId) whereClause.categoryId = categoryId;
  if (!all) whereClause.isActive = true;

  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      images: { orderBy: { position: "asc" } },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    products.map((p) => {
      const price = Number(p.price);
      const discountPercent = p.discountPercent || 0;
      const discountedPrice = discountPercent > 0 ? price - (price * (discountPercent / 100)) : price;
      return { ...p, price, discountedPrice };
    })
  );
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await request.json();
    const { name, slug, description, price, discountPercent, categoryId, color, stock, images } = data;

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        discountPercent: discountPercent ?? 0,
        categoryId,
        color,
        stock,
        images: {
          create: (images ?? []).map((img: any, idx: number) => ({
            url: img.url,
            alt: img.alt || name,
            position: img.position ?? idx,
          })),
        },
      },
      include: { images: true, category: true },
    });

    return NextResponse.json({ ...newProduct, price: Number(newProduct.price) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
