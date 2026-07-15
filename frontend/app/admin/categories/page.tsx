import { redirect } from "next/navigation";
import { isAuthenticatedServer } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CategoriesClient } from "./categories-client";

export default async function AdminCategoriesPage() {
  const isAuth = await isAuthenticatedServer();
  if (!isAuth) redirect("/admin/login");

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return <CategoriesClient initialCategories={categories} />;
}
