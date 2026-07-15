import { redirect } from "next/navigation";
import { isAuthenticatedServer } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DashboardClient } from "./components/dashboard-client";

async function getDashboardData() {
  const [
    totalProducts,
    activeProducts,
    totalOrders,
    pendingOrders,
    revenueResult,
    ordersByStatus,
    productsByCategory,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
    prisma.order.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.product.groupBy({
      by: ["categoryId"],
      _count: { id: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 7,
      select: {
        id: true,
        createdAt: true,
        total: true,
        status: true,
        customerName: true,
      },
    }),
  ]);

  const categoryIds = productsByCategory.map((p) => p.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return {
    totalProducts,
    activeProducts,
    totalOrders,
    pendingOrders,
    totalRevenue: Number(revenueResult._sum.total ?? 0),
    ordersByStatus: ordersByStatus.map((o) => ({ status: o.status, count: o._count.id })),
    productsByCategory: productsByCategory.map((p) => ({
      category: catMap[p.categoryId] ?? "Uncategorised",
      count: p._count.id,
    })),
    recentOrders: recentOrders.map((o) => ({
      ...o,
      total: Number(o.total),
    })),
  };
}

export default async function AdminPage() {
  const isAuth = await isAuthenticatedServer();
  if (!isAuth) redirect("/admin/login");

  const data = await getDashboardData();

  return <DashboardClient data={data} />;
}
