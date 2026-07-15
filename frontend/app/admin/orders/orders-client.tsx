"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const router = useRouter();

  const handleUpdate = async (id: string, field: string, value: string) => {
    try {
      await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      router.refresh();
      // optimistic update
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, [field]: value } : o)));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = statusFilter === "ALL" 
    ? orders 
    : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Filter:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Orders</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No orders found.
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Collapsible key={order.id} className="border bg-card rounded-lg shadow-sm">
              <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{order.customerName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                  <p className="text-sm">Total: KES {order.total}</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Select value={order.status} onValueChange={(val) => handleUpdate(order.id, "status", val)}>
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Payment</p>
                    <Select value={order.paymentStatus} onValueChange={(val) => handleUpdate(order.id, "paymentStatus", val)}>
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNPAID">Unpaid</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="REFUNDED">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-5">
                      View Details
                    </Button>
                  </CollapsibleTrigger>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-5 gap-1.5 text-[#BF9630] border-[#BF9630]/40 hover:bg-[#BF9630]/5"
                    onClick={() => window.open(`/api/admin/orders/${order.id}/receipt`, "_blank")}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Receipt
                  </Button>
                </div>
              </div>
              
              <CollapsibleContent>
                <div className="border-t px-4 py-4 bg-muted/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium mb-2">Customer Details</h4>
                      <div className="text-sm space-y-1">
                        <p><span className="text-muted-foreground">Order ID:</span> <span className="font-mono text-xs font-semibold">{order.id.toUpperCase()}</span></p>
                        <p><span className="text-muted-foreground">Phone:</span> {order.phone}</p>
                        {order.email && <p><span className="text-muted-foreground">Email:</span> {order.email}</p>}
                        <p><span className="text-muted-foreground">Address:</span> {order.address || "N/A"}</p>
                        <p><span className="text-muted-foreground">City:</span> {order.city || "N/A"}</p>
                        <p><span className="text-muted-foreground">Payment Method:</span> {order.paymentMethod}</p>
                        {order.notes && (
                          <div className="mt-2 p-2 bg-yellow-50 rounded text-yellow-800 border border-yellow-200">
                            <strong>Notes:</strong> {order.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Order Items</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.items.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.productName}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell className="text-right">KES {item.unitPrice}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))
        )}
      </div>
    </div>
  );
}
