"use client";

import Link from "next/link";
import { Package, ShoppingCart, TrendingUp, AlertCircle, ExternalLink } from "lucide-react";

interface DashboardData {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  ordersByStatus: { status: string; count: number }[];
  productsByCategory: { category: string; count: number }[];
  recentOrders: {
    id: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:    "bg-yellow-400",
  CONFIRMED:  "bg-blue-400",
  PROCESSING: "bg-indigo-400",
  SHIPPED:    "bg-purple-400",
  DELIVERED:  "bg-green-500",
  CANCELLED:  "bg-red-400",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING:    "Pending",
  CONFIRMED:  "Confirmed",
  PROCESSING: "Processing",
  SHIPPED:    "Shipped",
  DELIVERED:  "Delivered",
  CANCELLED:  "Cancelled",
};

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  href,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  href: string;
}) {
  return (
    <Link href={href} className="block bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
      </div>
    </Link>
  );
}

function BarChart({ data, max }: { data: { label: string; value: number; color?: string }[]; max: number }) {
  return (
    <div className="space-y-2.5">
      {data.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{item.label}</span>
            <span className="font-medium text-gray-700">{item.value}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${item.color ?? "bg-gray-800"} transition-all`}
              style={{ width: max > 0 ? `${(item.value / max) * 100}%` : "0%" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <p className="text-sm text-gray-400 text-center py-4">No data yet</p>;

  let cumulative = 0;
  const segments = data.map((d) => {
    const pct = (d.value / total) * 100;
    const start = cumulative;
    cumulative += pct;
    return { ...d, pct, start };
  });

  // Build conic-gradient
  const gradient = segments
    .map((s) => `${s.color} ${s.start.toFixed(1)}% ${(s.start + s.pct).toFixed(1)}%`)
    .join(", ");

  return (
    <div className="flex items-center gap-6">
      <div
        className="w-24 h-24 rounded-full shrink-0"
        style={{ background: `conic-gradient(${gradient})` }}
      />
      <div className="space-y-1.5 flex-1">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-gray-500 truncate">{STATUS_LABEL[s.label] ?? s.label}</span>
            <span className="ml-auto font-medium text-gray-700">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardClient({ data }: { data: DashboardData | null }) {
  if (!data) {
    return (
      <div className="flex items-center gap-2 text-gray-500 py-8">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">Could not load dashboard data.</span>
      </div>
    );
  }

  const ksh = (n: number) =>
    `KES ${n.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  // Prepare chart data
  const orderStatusData = data.ordersByStatus.map((o) => ({
    label: STATUS_LABEL[o.status] ?? o.status,
    value: o.count,
    color: STATUS_COLORS[o.status] ?? "#9ca3af",
  }));
  const orderStatusMax = Math.max(...data.ordersByStatus.map((o) => o.count), 1);

  const catMax = Math.max(...data.productsByCategory.map((p) => p.count), 1);
  const catData = data.productsByCategory.map((p) => ({
    label: p.category,
    value: p.count,
    color: "bg-indigo-400",
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of your store</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={data.totalProducts} sub={`${data.activeProducts} active`} icon={Package} href="/admin/products" />
        <StatCard title="Total Orders" value={data.totalOrders} sub={`${data.pendingOrders} pending`} icon={ShoppingCart} href="/admin/orders" />
        <StatCard title="Revenue (Paid)" value={ksh(data.totalRevenue)} icon={TrendingUp} href="/admin/orders" />
        <StatCard title="Inactive Products" value={data.totalProducts - data.activeProducts} sub="review & enable" icon={Package} href="/admin/products" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Orders by status — donut */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Orders by Status</h2>
          {orderStatusData.length === 0
            ? <p className="text-sm text-gray-400 py-4 text-center">No orders yet</p>
            : <DonutChart data={orderStatusData} />
          }
        </div>

        {/* Products by category — bar */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Products by Category</h2>
          {catData.length === 0
            ? <p className="text-sm text-gray-400 py-4 text-center">No categories yet</p>
            : <BarChart data={catData} max={catMax} />
          }
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-sm font-semibold text-gray-700">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1">
            View all <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        {data.recentOrders.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No orders yet</p>
        ) : (
          <div className="divide-y">
            {data.recentOrders.map((order) => (
              <div key={order.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50">
                <div>
                  <p className="text-sm font-medium text-gray-800">{order.customerName}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{order.id.slice(0, 12)}…</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{ksh(order.total)}</p>
                  <span
                    className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mt-0.5 text-white ${STATUS_COLORS[order.status] ?? "bg-gray-400"}`}
                  >
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
