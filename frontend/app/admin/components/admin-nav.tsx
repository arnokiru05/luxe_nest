"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "admin_secret=; path=/; max-age=0";
    router.push("/admin/login");
  };

  return (
    <nav className="border-b bg-white">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto w-full">
        <h2 className="text-lg font-bold mr-8">Luxe Nest Admin</h2>
        <div className="flex items-center space-x-4 flex-1">
          <Link
            href="/admin/products"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/admin/products" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Products
          </Link>
          <Link
            href="/admin/orders"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/admin/orders" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Orders
          </Link>
        </div>
        <Button variant="ghost" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </nav>
  );
}
