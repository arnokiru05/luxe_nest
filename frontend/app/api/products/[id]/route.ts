import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } }, category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const price = Number(product.price);
  const discountPercent = product.discountPercent || 0;
  const discountedPrice = discountPercent > 0 ? price - (price * (discountPercent / 100)) : price;
  return NextResponse.json({ ...product, price, discountedPrice });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const data = await request.json();
    const { images, ...otherData } = data;

    const updateData: any = { ...otherData };

    if (images !== undefined) {
      updateData.images = {
        deleteMany: {},
        create: images.map((img: any, idx: number) => ({
          url: img.url,
          alt: img.alt || otherData.name || "",
          position: img.position ?? idx,
        })),
      };
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { images: true, category: true },
    });

    const price = Number(updated.price);
    const discountPercent = updated.discountPercent || 0;
    const discountedPrice = discountPercent > 0 ? price - (price * (discountPercent / 100)) : price;
    return NextResponse.json({ ...updated, price, discountedPrice });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
