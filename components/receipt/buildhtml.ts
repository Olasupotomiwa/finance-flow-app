import { ReceiptData, ReceiptItem } from "./ReceiptTemplate";

const fmt = (n: number, sym: string) =>
  `${sym}${Number(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

const formatDate = (iso?: string) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch {
    return iso;
  }
};

export function buildReceiptHtml(
  receipt: ReceiptData,
  items: ReceiptItem[],
  profile: any,
  primaryColor: string,
  sym: string,
): string {
  const paid =
    receipt.status?.toLowerCase() === "completed" ||
    receipt.status?.toLowerCase() === "paid";

  const itemRows = items
    .map(
      (it) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;font-size:13px;color:#333;">${it.description}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;font-size:13px;color:#555;text-align:center;">${it.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;font-size:13px;color:#555;text-align:right;">${fmt(it.unit_price, sym)}</td>
        <td style="padding:10px 0;border-bottom:1px solid #f9f9f9;font-size:13px;color:#333;text-align:right;">${fmt(it.amount, sym)}</td>
      </tr>`,
    )
    .join("");

  const discountRow =
    (receipt.discount_amount ?? 0) > 0
      ? `<tr>
          <td colspan="3" style="padding:4px 0;text-align:right;font-size:13px;color:#555;">Discount</td>
          <td style="padding:4px 0;text-align:right;font-size:13px;color:#e53935;">- ${fmt(receipt.discount_amount, sym)}</td>
        </tr>`
      : "";

  const taxRow =
    (receipt.tax_amount ?? 0) > 0
      ? `<tr>
          <td colspan="3" style="padding:4px 0;text-align:right;font-size:13px;color:#555;">Tax</td>
          <td style="padding:4px 0;text-align:right;font-size:13px;color:#555;">${fmt(receipt.tax_amount, sym)}</td>
        </tr>`
      : "";

  const transactionRef = receipt.transaction_ref
    ? `<div style="background:#f8f8f8;border-radius:10px;padding:14px;margin-top:20px;">
        <div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Transaction Reference</div>
        <div style="font-size:13px;font-weight:bold;color:#444;">${receipt.transaction_ref}</div>
      </div>`
    : "";

  const notes = receipt.notes
    ? `<div style="margin-top:20px;">
        <div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Notes</div>
        <div style="font-size:12px;color:#666;">${receipt.notes}</div>
      </div>`
    : "";

  // Payment method pill
  const paymentMethodHtml = receipt.payment_method
    ? `<div style="text-align:right;">
        <div style="font-size:10px;color:#999;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px;">Payment Method</div>
        <span style="display:inline-block;background:${primaryColor}12;border:1px solid ${primaryColor}25;border-radius:20px;padding:5px 12px;font-size:12px;font-weight:bold;color:${primaryColor};">
          ${receipt.payment_method}
        </span>
      </div>`
    : "";

  // Business logo vs initials
  const logoHtml = profile?.business_logo_url
    ? `<img src="${profile.business_logo_url}" style="width:64px;height:64px;border-radius:14px;object-fit:contain;display:block;margin-bottom:12px;" />`
    : `<div style="width:56px;height:56px;border-radius:14px;background:${primaryColor}15;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:bold;color:${primaryColor};margin-bottom:12px;">
        ${(profile?.business_name ?? "B")[0].toUpperCase()}
      </div>`;

  // Issuer block (bottom left)
  const issuerHtml = receipt.issuer_name
    ? `<div style="margin-top:14px;">
        <div style="height:1px;background:#ddd;width:100px;margin-bottom:6px;"></div>
        <div style="font-size:13px;font-weight:bold;color:#444;">${receipt.issuer_name}</div>
        <div style="font-size:10px;color:#aaa;margin-top:2px;text-transform:uppercase;letter-spacing:0.5px;">Served by</div>
      </div>`
    : "";

  // Signature image (bottom right)
  const signatureHtml = receipt.has_signature && receipt.signature_url
    ? `<div style="text-align:right;">
        <img src="${receipt.signature_url}"
          style="width:120px;height:58px;border-radius:6px;background:#fafafa;object-fit:contain;display:block;" />
        <div style="height:1px;background:#ccc;width:120px;margin-top:6px;"></div>
        <div style="font-size:10px;color:#aaa;margin-top:3px;text-transform:uppercase;letter-spacing:0.5px;">Authorized Signature</div>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Receipt ${receipt.receipt_number}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f0f0; padding: 24px; }
    .card {
      background: #fff;
      border-radius: 16px;
      overflow: hidden;
      max-width: 640px;
      margin: 0 auto;
      position: relative;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    /* Faded stamp */
    .stamp {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 96px;
      font-weight: 900;
      color: ${primaryColor};
      opacity: 0.04;
      letter-spacing: 8px;
      pointer-events: none;
      white-space: nowrap;
      z-index: 0;
    }
    .content { position: relative; z-index: 1; }

    /* Plain white header */
    .header {
      background: #fff;
      padding: 28px 28px 20px;
      border-bottom: 1px solid #f0f0f0;
    }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .biz-name { font-size: 16px; font-weight: bold; color: #111; }
    .biz-meta { font-size: 11px; color: #888; margin-top: 2px; line-height: 1.5; }
    .receipt-label { font-size: 22px; font-weight: 900; color: ${primaryColor}; letter-spacing: 2px; text-align: right; }
    .receipt-num { font-size: 12px; color: #999; margin-top: 4px; text-align: right; }
    .receipt-date { font-size: 11px; color: #bbb; margin-top: 2px; text-align: right; }
    .paid-stamp {
      display: inline-block;
      margin-top: 10px;
      border: 1.5px solid #22c55e;
      border-radius: 6px;
      padding: 3px 10px;
      font-size: 11px;
      font-weight: bold;
      color: #22c55e;
      letter-spacing: 2px;
    }

    .body { padding: 20px 28px 28px; }
    .section-label { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .divider { height: 1px; background: #f0f0f0; margin: 16px 0; }
    table { width: 100%; border-collapse: collapse; }
    th { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0; font-weight: 600; }

    /* Bottom footer row */
    .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 28px;
      padding-top: 16px;
      border-top: 1px solid #f0f0f0;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="stamp">RECEIPT</div>
    <div class="content">

      <!-- Plain white header -->
      <div class="header">
        <div class="header-top">
          <!-- Left: logo + business info -->
          <div>
            ${logoHtml}
            <div class="biz-name">${profile?.business_name ?? "Business Name"}</div>
            ${profile?.street_address ? `<div class="biz-meta">${profile.street_address}</div>` : ""}
            ${profile?.email ? `<div class="biz-meta">${profile.email}</div>` : ""}
            ${profile?.phone ? `<div class="biz-meta">${profile.phone}</div>` : ""}
          </div>
          <!-- Right: receipt label -->
          <div>
            <div class="receipt-label">RECEIPT</div>
            <div class="receipt-num">#${receipt.receipt_number}</div>
            <div class="receipt-date">${formatDate(receipt.created_at)}</div>
            ${paid ? `<div style="text-align:right;"><span class="paid-stamp">PAID</span></div>` : ""}
          </div>
        </div>
      </div>

      <div class="body">

        <!-- Date + Payment Method -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
          <div>
            <div class="section-label">Date</div>
            <div style="font-size:13px;font-weight:bold;color:#222;">${formatDate(receipt.created_at)}</div>
          </div>
          ${paymentMethodHtml}
        </div>

        <div class="divider"></div>

        <!-- Received From -->
        <div style="margin-bottom:20px;">
          <div class="section-label">Received From</div>
          <div style="font-size:15px;font-weight:bold;color:#222;">${receipt.customer_name}</div>
          ${receipt.customer_email ? `<div style="font-size:12px;color:#666;margin-top:2px;">${receipt.customer_email}</div>` : ""}
          ${receipt.customer_phone ? `<div style="font-size:12px;color:#666;">${receipt.customer_phone}</div>` : ""}
          ${receipt.customer_address ? `<div style="font-size:12px;color:#666;">${receipt.customer_address}</div>` : ""}
        </div>

        <div class="divider"></div>

        <!-- Items table -->
        <table>
          <thead>
            <tr>
              <th style="text-align:left;">Item</th>
              <th style="text-align:center;width:48px;">Qty</th>
              <th style="text-align:right;width:88px;">Price</th>
              <th style="text-align:right;width:96px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
            <tr><td colspan="4" style="height:12px;"></td></tr>
            <tr>
              <td colspan="3" style="padding:4px 0;text-align:right;font-size:13px;color:#555;">Subtotal</td>
              <td style="padding:4px 0;text-align:right;font-size:13px;color:#555;">${fmt(receipt.subtotal, sym)}</td>
            </tr>
            ${discountRow}
            ${taxRow}
            <tr>
              <td colspan="3" style="padding-top:12px;border-top:1.5px solid #eee;text-align:right;font-size:15px;font-weight:bold;color:#111;">Amount Paid</td>
              <td style="padding-top:12px;border-top:1.5px solid #eee;text-align:right;font-size:15px;font-weight:bold;color:${primaryColor};">${fmt(receipt.total, sym)}</td>
            </tr>
          </tbody>
        </table>

        ${transactionRef}
        ${notes}

        <!-- Footer: issuer left, signature right -->
        <div class="footer-row">
          <div style="flex:1;padding-right:16px;">
            <div style="font-size:11px;color:#bbb;">Thank you for your payment!</div>
            ${issuerHtml}
          </div>
          ${signatureHtml}
        </div>

      </div>
    </div>
  </div>
</body>
</html>`;
}