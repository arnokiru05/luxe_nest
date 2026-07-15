import { redirect } from "next/navigation";
import { isAuthenticatedServer } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ProductsClient } from "./products-client";

export default async function AdminProductsPage() {
  const isAuth = await isAuthenticatedServer();
  if (!isAuth) redirect("/admin/login");

  const [productsRaw, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        images: { orderBy: { position: "asc" } },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const products = productsRaw.map((p) => ({
    ...p,
    price: Number(p.price),
    discountPercent: Number(p.discountPercent),
  }));

  return <ProductsClient initialProducts={products} categories={categories} />;
}
