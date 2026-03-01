/**
 * utils/buildInvoiceHtml.ts
 * Generates PDF HTML that is 1:1 with InvoiceTemplate.tsx.
 * Labels use #374151 (dark) — never faded grey — so PDF text is clearly readable.
 */
import { InvoiceData, InvoiceItem, BusinessProfile, INV, fmtDate, fmtTime, fmtAmt } from "@/components/Invoice/invoiceTemplate";
import { UserProfile } from "@/context/profileContext";

// Label style — dark bold, matches SLabel in InvoiceTemplate
const LBL = `font-size:10px;font-weight:800;color:${INV.label};text-transform:uppercase;letter-spacing:1px;margin:0 0 5px;display:block;`;

export function buildInvoiceHtml(
  invoice: InvoiceData,
  items: InvoiceItem[],
  profile: UserProfile | null,
  primaryColor: string,
  currencySymbol: string,
): string {
  const address = [profile?.street_address, profile?.lga, profile?.state].filter(Boolean).join(", ");

  const logoHTML = profile?.business_logo_url
    ? `<img src="${profile.business_logo_url}" style="width:60px;height:60px;border-radius:10px;object-fit:cover;display:block;"/>`
    : `<div style="width:60px;height:60px;border-radius:10px;background:${INV.greyBg};display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;">🏢</div>`;

  const itemRows = items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? "#fff" : INV.greyBg};">
      <td style="padding:11px 12px 11px 0;font-size:13px;font-weight:700;color:${INV.black};border-bottom:1px solid ${INV.greyLine};">${item.description}</td>
      <td style="padding:11px 8px;font-size:12px;color:${INV.grey};text-align:center;border-bottom:1px solid ${INV.greyLine};width:50px;">${item.quantity}</td>
      <td style="padding:11px 8px;font-size:12px;color:${INV.grey};text-align:right;border-bottom:1px solid ${INV.greyLine};width:100px;">${currencySymbol}${item.unit_price.toLocaleString()}</td>
      <td style="padding:11px 0 11px 12px;font-size:12px;font-weight:700;color:${INV.black};text-align:right;border-bottom:1px solid ${INV.greyLine};width:120px;">${currencySymbol}${fmtAmt(item.amount)}</td>
    </tr>`).join("");

  const discountRow = invoice.discount_amount > 0 ? `
    <tr>
      <td colspan="3" style="text-align:right;padding:7px 12px 7px 0;font-size:13px;color:${INV.grey};">
        Discount${invoice.discount_type === "percentage" ? ` (${invoice.discount_value}%)` : ""}
      </td>
      <td style="text-align:right;padding:7px 0;font-size:13px;font-weight:700;color:${INV.red};">-${currencySymbol}${fmtAmt(invoice.discount_amount)}</td>
    </tr>` : "";

  const taxRow = invoice.tax_amount > 0 ? `
    <tr>
      <td colspan="3" style="text-align:right;padding:7px 12px 7px 0;font-size:13px;color:${INV.grey};">Tax (${invoice.tax_rate}%)</td>
      <td style="text-align:right;padding:7px 0;font-size:13px;font-weight:700;color:${INV.black};">${currencySymbol}${fmtAmt(invoice.tax_amount)}</td>
    </tr>` : "";

  const notesHTML = invoice.notes ? `
    <div style="border-top:1px solid ${INV.greyLine};">
      <div style="margin:20px;padding:14px;background:${INV.greyBg};border-radius:10px;">
        <span style="${LBL}margin-bottom:8px;">Notes</span>
        <p style="font-size:13px;color:${INV.grey};margin:0;line-height:1.6;">${invoice.notes}</p>
      </div>
    </div>` : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, Helvetica, Arial, sans-serif; background: #E5E7EB; padding: 24px; }
    .page { max-width: 720px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; }
  </style>
</head>
<body><div class="page">

  <!-- ══ HEADER ══════════════════════════════════════════════════════════ -->
  <div style="background:#fff;padding:24px 24px 20px;border-bottom:2px solid ${INV.greyLine};">
    <div style="display:flex;align-items:flex-start;">
      <!-- Logo -->
      <div style="flex-shrink:0;margin-right:14px;">${logoHTML}</div>
      <!-- Business name centred in remaining space -->
      <div style="flex:1;text-align:center;padding-right:74px;">
        <h1 style="font-size:22px;font-weight:900;color:${INV.black};letter-spacing:0.2px;line-height:1.2;margin-bottom:5px;">
          ${profile?.business_name || "Your Business"}
        </h1>
        ${address ? `<p style="font-size:11px;color:${INV.grey};margin-bottom:2px;">${address}</p>` : ""}
        ${profile?.business_email ? `<p style="font-size:11px;color:${INV.grey};margin-bottom:2px;">${profile.business_email}</p>` : ""}
        ${profile?.business_phone ? `<p style="font-size:11px;color:${INV.grey};">${profile.business_phone}</p>` : ""}
      </div>
    </div>
    <!-- INVOICE label + status -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:18px;">
      <span style="font-size:13px;font-weight:900;color:${INV.black};letter-spacing:4px;text-transform:uppercase;">INVOICE</span>
      <span style="background:${primaryColor}22;color:${primaryColor};font-size:10px;font-weight:800;text-transform:uppercase;padding:4px 14px;border-radius:20px;letter-spacing:1px;border:1px solid ${primaryColor}44;">
        ${invoice.status}
      </span>
    </div>
  </div>

  <!-- ══ META ════════════════════════════════════════════════════════════ -->
  <div style="padding:20px 24px;border-bottom:1px solid ${INV.greyLine};">
    <span style="${LBL}">Invoice Total</span>
    <p style="font-size:34px;font-weight:900;color:${primaryColor};margin:4px 0 18px;">
      ${currencySymbol}${fmtAmt(invoice.total)}
    </p>
    <!-- 3-cell boxed row -->
    <div style="display:flex;border:1px solid ${INV.greyLine};border-radius:12px;overflow:hidden;">
      <div style="flex:1.6;padding:12px 14px;border-right:1px solid ${INV.greyLine};">
        <span style="${LBL}">Invoice #</span>
        <span style="font-size:12px;font-weight:700;color:${INV.black};display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${invoice.invoice_number}</span>
      </div>
      <div style="flex:1.4;padding:12px 14px;border-right:1px solid ${INV.greyLine};">
        <span style="${LBL}">Issued</span>
        <span style="font-size:12px;font-weight:700;color:${INV.black};display:block;">${fmtDate(invoice.issue_date)}</span>
        <span style="font-size:10px;font-weight:600;color:${INV.dark};display:block;margin-top:3px;">${fmtTime(invoice.created_at)}</span>
      </div>
      <div style="flex:1;padding:12px 14px;">
        <span style="${LBL}">Due Date</span>
        <span style="font-size:12px;font-weight:700;color:${INV.black};display:block;">${fmtDate(invoice.due_date)}</span>
      </div>
    </div>
  </div>

  <!-- ══ BILLED TO ════════════════════════════════════════════════════════ -->
  <div style="padding:16px 24px;border-bottom:1px solid ${INV.greyLine};">
    <span style="${LBL}margin-bottom:8px;">Billed To</span>
    <p style="font-size:15px;font-weight:700;color:${INV.black};margin-bottom:3px;">${invoice.client_name}</p>
    ${invoice.client_email ? `<p style="font-size:13px;color:${INV.grey};margin-bottom:2px;">${invoice.client_email}</p>` : ""}
    ${invoice.client_phone ? `<p style="font-size:13px;color:${INV.grey};">${invoice.client_phone}</p>` : ""}
  </div>

  <!-- ══ ITEMS TABLE ══════════════════════════════════════════════════════ -->
  <div style="padding:16px 24px 8px;">
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="border-bottom:2px solid ${primaryColor};">
          <th style="text-align:left;padding:9px 12px 9px 0;font-size:11px;font-weight:800;color:${primaryColor};text-transform:uppercase;letter-spacing:0.5px;">Description</th>
          <th style="text-align:center;padding:9px 8px;font-size:11px;font-weight:800;color:${primaryColor};text-transform:uppercase;width:50px;">Qty</th>
          <th style="text-align:right;padding:9px 8px;font-size:11px;font-weight:800;color:${primaryColor};text-transform:uppercase;width:100px;">Price</th>
          <th style="text-align:right;padding:9px 0 9px 12px;font-size:11px;font-weight:800;color:${primaryColor};text-transform:uppercase;width:120px;">Amount</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="text-align:right;padding:10px 12px 10px 0;font-size:13px;color:${INV.grey};">Subtotal</td>
          <td style="text-align:right;padding:10px 0;font-size:13px;font-weight:700;color:${INV.black};">${currencySymbol}${fmtAmt(invoice.subtotal)}</td>
        </tr>
        ${discountRow}${taxRow}
        <tr style="border-top:2px solid ${primaryColor};">
          <td colspan="3" style="text-align:right;padding:14px 12px 14px 0;font-size:15px;font-weight:800;color:${INV.black};">Total</td>
          <td style="text-align:right;padding:14px 0;font-size:20px;font-weight:900;color:${primaryColor};">${currencySymbol}${fmtAmt(invoice.total)}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  ${notesHTML}

  <!-- ══ FOOTER ══════════════════════════════════════════════════════════ -->
  <div style="padding:12px 24px 14px;border-top:1px solid ${INV.greyLine};text-align:center;">
    <p style="font-size:10px;font-weight:600;color:${INV.grey};">Generated · ${fmtDate(invoice.created_at)}  ${fmtTime(invoice.created_at)}</p>
  </div>

</div></body></html>`;
}