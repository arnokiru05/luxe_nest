import { redirect } from "next/navigation";
import { isAuthenticatedServer } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { OrdersClient } from "./orders-client";

export default async function AdminOrdersPage() {
  const isAuth = await isAuthenticatedServer();
  if (!isAuth) redirect("/admin/login");

  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const serializedOrders = orders.map((o) => ({
    ...o,
    subtotal: Number(o.subtotal),
    total: Number(o.total),
    items: o.items.map((i) => ({ ...i, unitPrice: Number(i.unitPrice) })),
  }));

  return <OrdersClient initialOrders={serializedOrders} />;
}
