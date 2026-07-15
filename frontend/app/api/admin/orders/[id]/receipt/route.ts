import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const settings = await prisma.storeSettings.findUnique({
    where: { id: "singleton" },
  });

  const storeName = settings?.storeName || "Luxe Nest Household";
  const subtotal = Number(order.subtotal);
  const total = Number(order.total);
  const deliveryFee = total - subtotal;
  const shortId = order.id.toUpperCase();
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const orderTime = new Date(order.createdAt).toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const itemRows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px 8px; border-bottom: 1px solid #f1f0ee;">${item.productName}</td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #f1f0ee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #f1f0ee; text-align: right;">Ksh ${Number(item.unitPrice).toLocaleString("en-KE", { minimumFractionDigits: 2 })}</td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #f1f0ee; text-align: right;">Ksh ${(Number(item.unitPrice) * item.quantity).toLocaleString("en-KE", { minimumFractionDigits: 2 })}</td>
    </tr>`
    )
    .join("");

  // Extract zone name from notes if available
  const zoneNote = order.notes?.startsWith("Delivery Zone:")
    ? order.notes.replace("Delivery Zone: ", "")
    : null;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Receipt — Order #${shortId}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      background: #f9f8f6;
      color: #2a1f14;
      padding: 40px 20px;
    }
    .receipt {
      max-width: 680px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .header {
      background: linear-gradient(135deg, #2a1f14 0%, #4a3728 100%);
      color: #fff;
      padding: 32px 40px 24px;
    }
    .header h1 { font-size: 24px; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; }
    .header p { font-size: 13px; opacity: 0.7; }
    .gold { color: #BF9630; }
    .meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      padding: 28px 40px;
      border-bottom: 1px solid #f0ede8;
      background: #fffdf9;
    }
    .meta-block p:first-child { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #BF9630; margin-bottom: 4px; }
    .meta-block p { font-size: 13px; color: #4a3728; line-height: 1.6; }
    .items-section { padding: 28px 40px; }
    .items-section h2 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #BF9630; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead tr { background: #f7f4ef; }
    thead th { padding: 10px 8px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #7a6255; }
    thead th:last-child, thead th:nth-child(3), thead th:nth-child(2) { text-align: right; }
    thead th:nth-child(2) { text-align: center; }
    .totals { padding: 0 40px 28px; }
    .totals-row { display: flex; justify-content: space-between; font-size: 13px; color: #7a6255; padding: 6px 0; }
    .totals-divider { border: none; border-top: 1px solid #f0ede8; margin: 8px 0; }
    .totals-grand { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #2a1f14; padding: 10px 0 0; }
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 50px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .status-CONFIRMED { background: #dcfce7; color: #15803d; }
    .status-DELIVERED { background: #dbeafe; color: #1d4ed8; }
    .status-PENDING { background: #fef3c7; color: #b45309; }
    .status-CANCELLED { background: #fee2e2; color: #dc2626; }
    .footer {
      background: #f7f4ef;
      padding: 20px 40px;
      text-align: center;
      font-size: 12px;
      color: #9a8578;
      border-top: 1px solid #ede8df;
    }
    @media print {
      body { background: white; padding: 0; }
      .receipt { box-shadow: none; border-radius: 0; }
      .print-btn { display: none !important; }
    }
  </style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 16px;">
    <button class="print-btn" onclick="window.print()" style="background: #2a1f14; color: white; border: none; padding: 10px 24px; border-radius: 50px; font-size: 13px; font-weight: 700; cursor: pointer; letter-spacing: 0.06em;">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <div class="receipt">
    <!-- Header -->
    <div class="header">
      <h1>${storeName.toUpperCase()}</h1>
      <p>Official Order Receipt</p>
      <p style="margin-top: 16px; font-size: 18px; font-weight: 700;" class="gold">ORDER #${shortId}</p>
    </div>

    <!-- Meta -->
    <div class="meta">
      <div class="meta-block">
        <p>Order Date</p>
        <p>${orderDate}</p>
        <p>${orderTime}</p>
      </div>
      <div class="meta-block">
        <p>Status</p>
        <p><span class="status-badge status-${order.status}">${order.status}</span></p>
        <p style="margin-top: 4px;">Payment: <strong>${order.paymentStatus}</strong> (${order.paymentMethod})</p>
      </div>
      <div class="meta-block">
        <p>Customer</p>
        <p><strong>${order.customerName}</strong></p>
        <p>${order.phone}</p>
        ${order.email ? `<p>${order.email}</p>` : ""}
      </div>
      <div class="meta-block">
        <p>Delivery Address</p>
        <p>${order.address || "N/A"}</p>
        ${order.city ? `<p>${order.city}</p>` : ""}
        ${zoneNote ? `<p style="color: #BF9630; font-weight: 600;">Zone: ${zoneNote}</p>` : ""}
      </div>
    </div>

    <!-- Items -->
    <div class="items-section">
      <h2>Order Items</h2>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th style="text-align:center;">Qty</th>
            <th style="text-align:right;">Unit Price</th>
            <th style="text-align:right;">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="totals">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>Ksh ${subtotal.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
      </div>
      ${deliveryFee > 0 || zoneNote ? `
      <div class="totals-row">
        <span>Delivery Fee${zoneNote ? ` (${zoneNote})` : ""}</span>
        <span>${deliveryFee > 0 ? `Ksh ${deliveryFee.toLocaleString("en-KE", { minimumFractionDigits: 2 })}` : "FREE"}</span>
      </div>` : ""}
      <hr class="totals-divider" />
      <div class="totals-grand">
        <span>TOTAL</span>
        <span>Ksh ${total.toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Thank you for shopping with <strong>${storeName}</strong>!</p>
      <p style="margin-top: 4px;">This is an official receipt. Please keep it for your records.</p>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
