// @ts-nocheck
/**
 * Luxe Nest - Premium Client-Side Invoice PDF Generator
 * Dynamically renders an A4 invoice and downloads it directly.
 */
export async function downloadInvoicePDF(order) {
  try {
    // 1. Dynamic imports to ensure libraries are loaded only in client-side environment
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    if (!order) {
      throw new Error("No order data provided for invoice generation");
    }

    // 2. Format details
    const orderId = order.id.substring(0, 8).toUpperCase();
    const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        minimumFractionDigits: 2,
      }).format(amount);
    };

    // Determine Status Text and Color Badge
    const statusText = order.status ? order.status.toUpperCase() : "PENDING";
    let statusBgColor = "#fef3c7"; // Yellow
    let statusTextColor = "#92400e"; // Dark yellow
    if (statusText === "DELIVERED") {
      statusBgColor = "#d1fae5"; // Green
      statusTextColor = "#065f46"; // Dark green
    } else if (statusText === "CANCELLED") {
      statusBgColor = "#fee2e2"; // Red
      statusTextColor = "#991b1b"; // Dark red
    } else if (statusText === "PROCESSING" || statusText === "SHIPPED") {
      statusBgColor = "#dbeafe"; // Blue
      statusTextColor = "#1e40af"; // Dark blue
    }

    // 3. Construct beautiful, print-ready HTML template offline
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "-9999px";
    container.style.width = "794px"; // Standard A4 A-size layout width at 72DPI
    container.style.minHeight = "1123px"; // Standard A4 layout height
    container.style.padding = "50px";
    container.style.boxSizing = "border-box";
    container.style.backgroundColor = "#ffffff";
    container.style.color = "#1e293b";
    container.style.fontFamily = '"Inter", "Helvetica Neue", "Arial", sans-serif';
    container.style.lineHeight = "1.5";

    // Add layout HTML
    container.innerHTML = `
      <!-- Brand Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2563eb; padding-bottom: 25px; margin-bottom: 30px;">
        <div>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <img src="/favicon.png" alt="Logo" style="width: 48px; height: 48px; object-fit: contain;" />
            <div style="display: flex; flex-direction: column;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a; line-height: 1;">LUXE NEST</h1>
              <span style="margin-top: 2px; font-size: 10px; font-weight: 700; letter-spacing: 0.2em; color: #64748b; text-transform: uppercase;">Home Goods</span>
            </div>
          </div>
          <p style="margin: 5px 0 0 0; font-size: 13px; color: #64748b; font-weight: 500;">Premium Household Essentials</p>
          <p style="margin: 3px 0 0 0; font-size: 11px; color: #64748b;">Eldoret, Kenya • +254 769 567 516 • sales@luxenest.com</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: 0.5px;">INVOICE</h2>
          <p style="margin: 5px 0 0 0; font-size: 13px; font-family: monospace; color: #475569; font-weight: bold; background-color: #f1f5f9; padding: 3px 8px; border-radius: 4px; display: inline-block;">#LN-${orderId}</p>
          <div style="margin-top: 8px;">
            <span style="background-color: ${statusBgColor}; color: ${statusTextColor}; border-radius: 9999px; padding: 2px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
              ${statusText}
            </span>
          </div>
        </div>
      </div>

      <!-- Invoice Details Grid -->
      <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 45px; font-size: 13px;">
        <!-- Vendor / Remit To -->
        <div>
          <h3 style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 700;">Client Details</h3>
          <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">${order.user?.name || "Guest Customer"}</p>
          <p style="margin: 3px 0 0 0; color: #475569;">Email: ${order.user?.email || "No Email"}</p>
          <p style="margin: 3px 0 0 0; color: #475569;">Phone: ${order.shippingAddress?.phone || order.phone || "No Phone"}</p>
          <p style="margin: 3px 0 0 0; color: #475569;">Address: ${order.shippingAddress?.address || "Pick up at store"}</p>
        </div>

        <!-- Meta info -->
        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
          <div>
            <table style="border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 3px 15px 3px 0; color: #64748b; font-weight: 500; text-align: right;">Invoice Date:</td>
                <td style="padding: 3px 0; color: #0f172a; font-weight: 600; text-align: right;">${invoiceDate}</td>
              </tr>
              <tr>
                <td style="padding: 3px 15px 3px 0; color: #64748b; font-weight: 500; text-align: right;">Payment Status:</td>
                <td style="padding: 3px 0; color: #0f172a; font-weight: 600; text-align: right; text-transform: capitalize;">${statusText === "DELIVERED" || statusText === "SHIPPED" ? "PAID" : statusText === "CANCELLED" ? "CANCELLED" : "UNPAID"}</td>
              </tr>
              <tr>
                <td style="padding: 3px 15px 3px 0; color: #64748b; font-weight: 500; text-align: right;">Payment Method:</td>
                <td style="padding: 3px 0; color: #0f172a; font-weight: 600; text-align: right;">M-Pesa / Buy Goods Till</td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <!-- Order Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 35px; font-size: 13px;">
        <thead>
          <tr style="background-color: #0f172a; color: #ffffff; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">
            <th style="padding: 12px 15px; text-align: left; font-weight: 700; border-top-left-radius: 6px; border-bottom-left-radius: 6px;">Item Description</th>
            <th style="padding: 12px 15px; text-align: right; font-weight: 700;">Qty</th>
            <th style="padding: 12px 15px; text-align: right; font-weight: 700;">Unit Price</th>
            <th style="padding: 12px 15px; text-align: right; font-weight: 700; border-top-right-radius: 6px; border-bottom-right-radius: 6px;">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          ${order.items && order.items.length > 0
        ? order.items
          .map((item, index) => {
            const price = item.price || 0;
            const quantity = item.quantity || 1;
            const name = item.product?.name || "Deleted Product";
            const bg = index % 2 === 0 ? "#ffffff" : "#f8fafc";
            return \`
                    <tr style="background-color: \${bg}; border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 14px 15px; text-align: left; color: #0f172a; font-weight: 500;">
                        \${name}
                        \${!item.product ? '<span style="color:#ef4444; font-size:10px; margin-left:5px;">(Unavailable)</span>' : ""}
                      </td>
                      <td style="padding: 14px 15px; text-align: right; color: #475569;">\${quantity}</td>
                      <td style="padding: 14px 15px; text-align: right; color: #475569;">\${formatCurrency(price)}</td>
                      <td style="padding: 14px 15px; text-align: right; color: #0f172a; font-weight: 600;">\${formatCurrency(price * quantity)}</td>
                    </tr>
                  \`;
                  })
                  .join("")
              : \`
              <tr>
                <td colSpan="4" style="padding: 20px; text-align: center; color: #64748b;">No items in this order</td>
              </tr>
            \`
          }
        </tbody>
      </table>

      <!-- Grand Totals Summary -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px;">
        <!-- Payment Instructions / Bank Details -->
        <div style="max-width: 320px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; font-size: 11.5px; color: #475569;">
          <h4 style="margin: 0 0 6px 0; color: #0f172a; font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 4px;">
            Payment Instructions
          </h4>
          <p style="margin: 0; font-size: 12px; line-height: 1.6;">
            Payment is expected upon checkout delivery or pick up. Please send payment to M-Pesa Buy Goods Till:
            <br />
            <strong style="color: #0f172a; font-size: 14px;">Till Number: XXXXXX</strong>
            <br />
            Account Name: <strong style="color: #0f172a;">Luxe Nest Ltd</strong>
          </p>
        </div>

        <!-- Summaries -->
        <div style="min-width: 250px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 15px 6px 0; text-align: right; color: #64748b;">Subtotal:</td>
              <td style="padding: 6px 0; text-align: right; color: #0f172a; font-weight: 600;">\${formatCurrency(order.total)}</td>
            </tr>
            <tr style="border-bottom: 2px solid #e2e8f0;">
              <td style="padding: 6px 15px 6px 0; text-align: right; color: #64748b;">Delivery Fee:</td>
              <td style="padding: 6px 0; text-align: right; color: #0f172a; font-weight: 600;">\${formatCurrency(0)}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px 12px 0; text-align: right; font-size: 14px; font-weight: 700; color: #0f172a;">Invoice Total:</td>
              <td style="padding: 12px 0; text-align: right; font-size: 16px; font-weight: 800; color: #2563eb;">\${formatCurrency(order.total)}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Footer Info -->
      <div style="border-top: 1px dashed #cbd5e1; padding-top: 25px; text-align: center; font-size: 11px; color: #64748b;">
        <p style="margin: 0; font-weight: 600; color: #0f172a;">Thank you for shopping with Luxe Nest!</p>
        <p style="margin: 4px 0 0 0;">Your reliable partner for premium household essentials.</p>
        <p style="margin: 12px 0 0 0; font-size: 9px; color: #94a3b8; font-family: monospace;">Issued via Luxe Nest Admin Portal • ID: \${order.id}</p>
      </div>
    \`;

    document.body.appendChild(container);

    // 4. Generate high-quality Canvas from the off-screen invoice DOM
    const canvas = await html2canvas(container, {
      scale: 2, // High resolution retina capture
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    // Clean up temporary DOM node immediately
    document.body.removeChild(container);

    // 5. Draw Image to jsPDF Page
    const imgData = canvas.toDataURL("image/png");
    
    // Create landscape/portrait A4 doc: 210mm x 297mm
    const pdf = new jsPDF("p", "mm", "a4");
    
    // Fit the captured canvas image perfectly onto A4 bounds
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297, undefined, "FAST");

    // 6. Download file
    pdf.save(\`invoice_LN-\${orderId}.pdf\`);

    return true;
  } catch (error) {
    console.error("Failed to generate and download invoice PDF:", error);
    throw error;
  }
}
