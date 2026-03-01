/**
 * components/Invoice/InvoiceTemplate.tsx
 * Single source of truth for invoice layout.
 * Used by ViewShot (image) — PDF mirrors this via buildInvoiceHtml.ts
 * A4 Portrait: 210mm × 297mm (595pt × 842pt at 72 DPI)
 */
import React from "react";
import { View, Text, Image, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserProfile } from "@/context/profileContext";

// ── Shared types ──────────────────────────────────────────────────────────────
export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface InvoiceData {
  invoice_number: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  issue_date: string;
  due_date: string;
  created_at: string;
  status: string;
  subtotal: number;
  discount_type: string | null;
  discount_value: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  currency: string;
}

export interface BusinessProfile {
  business_name?: string;
  business_logo_url?: string;
  business_email?: string;
  business_phone?: string;
  street_address?: string;
  lga?: string;
  state?: string;
}

interface Props {
  invoice: InvoiceData;
  items: InvoiceItem[];
  profile: UserProfile | null;
  primaryColor: string;
  currencySymbol: string;
}

// ── A4 dimensions ─────────────────────────────────────────────────────────────
const A4_WIDTH = Dimensions.get("window").width; // Full width on mobile
const A4_ASPECT_RATIO = 297 / 210; // Portrait A4 ratio
const A4_HEIGHT = A4_WIDTH * A4_ASPECT_RATIO;

// ── Design tokens — must stay in sync with buildInvoiceHtml.ts ───────────────
export const INV = {
  black: "#111827", // primary text
  dark: "#1F2937", // secondary text
  grey: "#6B7280", // body text
  label: "#374151", // section labels — dark, never faded
  greyLine: "#E5E7EB", // borders
  greyBg: "#F9FAFB", // alternate row / notes bg
  red: "#EF4444",
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────
export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const fmtAmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2 });

// ── Section label style (dark + bold — not faded) ─────────────────────────────
const SLabel = ({ text }: { text: string }) => (
  <Text
    style={{
      fontSize: 11,
      fontFamily: "appFontBold",
      color: INV.label,
      textTransform: "uppercase",
      letterSpacing: 1.2,
      marginBottom: 8,
    }}
  >
    {text}
  </Text>
);

// ── Horizontal divider ────────────────────────────────────────────────────────
const HDivider = ({ thick }: { thick?: boolean }) => (
  <View style={{ height: thick ? 2 : 1, backgroundColor: INV.greyLine }} />
);

// ── Totals row ────────────────────────────────────────────────────────────────
const TotalRow = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 6,
    }}
  >
    <Text style={{ fontSize: 14, fontFamily: "appFont", color: INV.grey }}>
      {label}
    </Text>
    <Text
      style={{
        fontSize: 14,
        fontFamily: "appFontBold",
        color: color ?? INV.black,
      }}
    >
      {value}
    </Text>
  </View>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function InvoiceTemplate({
  invoice,
  items,
  profile,
  primaryColor,
  currencySymbol,
}: Props) {
  const address = [profile?.street_address, profile?.lga, profile?.state]
    .filter(Boolean)
    .join(", ");

  return (
    <View
      style={{
        width: A4_WIDTH,
        minHeight: A4_HEIGHT,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      {/* ══ HEADER ════════════════════════════════════════════════════════════ */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingHorizontal: 24,
          paddingTop: 32,
          paddingBottom: 24,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          {/* Logo — top left */}
          {profile?.business_logo_url ? (
            <Image
              source={{ uri: profile.business_logo_url }}
              style={{
                width: 72,
                height: 72,
                borderRadius: 12,
                backgroundColor: INV.greyBg,
                marginRight: 16,
              }}
            />
          ) : (
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 12,
                backgroundColor: INV.greyBg,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <Ionicons name="business" size={32} color={INV.grey} />
            </View>
          )}

          {/* Business name + contact — centred */}
          <View style={{ flex: 1, alignItems: "center", paddingRight: 72 }}>
            <Text
              style={{
                fontSize: 24,
                fontFamily: "appFontBold",
                color: INV.black,
                textAlign: "center",
                letterSpacing: 0.3,
                lineHeight: 32,
                marginBottom: 6,
              }}
            >
              {profile?.business_name || "Your Business"}
            </Text>
            {!!address && (
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "appFont",
                  color: INV.grey,
                  textAlign: "center",
                  marginTop: 4,
                  lineHeight: 18,
                }}
              >
                {address}
              </Text>
            )}
            {!!profile?.business_email && (
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "appFont",
                  color: INV.grey,
                  textAlign: "center",
                  marginTop: 3,
                }}
              >
                {profile.business_email}
              </Text>
            )}
            {!!profile?.business_phone && (
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "appFont",
                  color: INV.grey,
                  textAlign: "center",
                  marginTop: 3,
                }}
              >
                {profile.business_phone}
              </Text>
            )}
          </View>
        </View>

        {/* INVOICE label + status badge */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 24,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontFamily: "appFontBold",
              color: INV.black,
              letterSpacing: 5,
              textTransform: "uppercase",
            }}
          >
            INVOICE
          </Text>
          <View
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: `${primaryColor}22`,
              borderWidth: 1,
              borderColor: `${primaryColor}44`,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontFamily: "appFontBold",
                color: primaryColor,
                textTransform: "uppercase",
                letterSpacing: 1.2,
              }}
            >
              {invoice.status}
            </Text>
          </View>
        </View>
      </View>

      <HDivider thick />

      {/* ══ META: total + 3-cell box ══════════════════════════════════════════ */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
        <SLabel text="Invoice Total" />
        <Text
          style={{
            fontSize: 40,
            fontFamily: "appFontBold",
            color: primaryColor,
            marginBottom: 20,
            letterSpacing: 0.5,
          }}
        >
          {currencySymbol}
          {fmtAmt(invoice.total)}
        </Text>

        {/* 3-cell boxed row */}
        <View
          style={{
            flexDirection: "row",
            borderWidth: 1.5,
            borderColor: INV.greyLine,
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          {/* Invoice # */}
          <View
            style={{
              flex: 1.6,
              padding: 14,
              borderRightWidth: 1.5,
              borderColor: INV.greyLine,
            }}
          >
            <SLabel text="Invoice #" />
            <Text
              style={{
                fontSize: 13,
                fontFamily: "appFontBold",
                color: INV.black,
              }}
              numberOfLines={1}
            >
              {invoice.invoice_number}
            </Text>
          </View>
          {/* Issued */}
          <View
            style={{
              flex: 1.4,
              padding: 14,
              borderRightWidth: 1.5,
              borderColor: INV.greyLine,
            }}
          >
            <SLabel text="Issued" />
            <Text
              style={{
                fontSize: 13,
                fontFamily: "appFontBold",
                color: INV.black,
              }}
            >
              {fmtDate(invoice.issue_date)}
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "appFont",
                color: INV.dark,
                marginTop: 4,
              }}
            >
              {fmtTime(invoice.created_at)}
            </Text>
          </View>
          {/* Due Date */}
          <View style={{ flex: 1, padding: 14 }}>
            <SLabel text="Due Date" />
            <Text
              style={{
                fontSize: 13,
                fontFamily: "appFontBold",
                color: INV.black,
              }}
            >
              {fmtDate(invoice.due_date)}
            </Text>
          </View>
        </View>
      </View>

      <HDivider />

      {/* ══ BILLED TO ════════════════════════════════════════════════════════ */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 20 }}>
        <SLabel text="Billed To" />
        <Text
          style={{
            fontSize: 17,
            fontFamily: "appFontBold",
            color: INV.black,
            marginBottom: 6,
          }}
        >
          {invoice.client_name}
        </Text>
        {!!invoice.client_email && (
          <Text
            style={{
              fontSize: 14,
              fontFamily: "appFont",
              color: INV.grey,
              marginBottom: 3,
            }}
          >
            {invoice.client_email}
          </Text>
        )}
        {!!invoice.client_phone && (
          <Text
            style={{ fontSize: 14, fontFamily: "appFont", color: INV.grey }}
          >
            {invoice.client_phone}
          </Text>
        )}
      </View>

      <HDivider />

      {/* ══ ITEMS TABLE ══════════════════════════════════════════════════════ */}
      <View
        style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12 }}
      >
        {/* Column headers */}
        <View
          style={{
            flexDirection: "row",
            paddingBottom: 12,
            borderBottomWidth: 2,
            borderColor: primaryColor,
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontSize: 12,
              fontFamily: "appFontBold",
              color: primaryColor,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Description
          </Text>
          <Text
            style={{
              width: 50,
              fontSize: 12,
              fontFamily: "appFontBold",
              color: primaryColor,
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Qty
          </Text>
          <Text
            style={{
              width: 90,
              fontSize: 12,
              fontFamily: "appFontBold",
              color: primaryColor,
              textAlign: "right",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Price
          </Text>
          <Text
            style={{
              width: 110,
              fontSize: 12,
              fontFamily: "appFontBold",
              color: primaryColor,
              textAlign: "right",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Amount
          </Text>
        </View>

        {items.map((item, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              paddingVertical: 14,
              alignItems: "center",
              borderBottomWidth: 1,
              borderColor: INV.greyLine,
              backgroundColor: i % 2 === 0 ? "#fff" : INV.greyBg,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 14,
                fontFamily: "appFontBold",
                color: INV.black,
                lineHeight: 20,
              }}
              numberOfLines={2}
            >
              {item.description}
            </Text>
            <Text
              style={{
                width: 50,
                fontSize: 13,
                fontFamily: "appFont",
                color: INV.grey,
                textAlign: "center",
              }}
            >
              {item.quantity}
            </Text>
            <Text
              style={{
                width: 90,
                fontSize: 13,
                fontFamily: "appFont",
                color: INV.grey,
                textAlign: "right",
              }}
            >
              {currencySymbol}
              {item.unit_price.toLocaleString()}
            </Text>
            <Text
              style={{
                width: 110,
                fontSize: 14,
                fontFamily: "appFontBold",
                color: INV.black,
                textAlign: "right",
              }}
            >
              {currencySymbol}
              {fmtAmt(item.amount)}
            </Text>
          </View>
        ))}
      </View>

      {/* ══ TOTALS ════════════════════════════════════════════════════════════ */}
      <View
        style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 }}
      >
        <TotalRow
          label="Subtotal"
          value={`${currencySymbol}${fmtAmt(invoice.subtotal)}`}
        />
        {invoice.discount_amount > 0 && (
          <TotalRow
            label={`Discount${invoice.discount_type === "percentage" ? ` (${invoice.discount_value}%)` : ""}`}
            value={`-${currencySymbol}${fmtAmt(invoice.discount_amount)}`}
            color={INV.red}
          />
        )}
        {invoice.tax_amount > 0 && (
          <TotalRow
            label={`Tax (${invoice.tax_rate}%)`}
            value={`${currencySymbol}${fmtAmt(invoice.tax_amount)}`}
          />
        )}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 14,
            marginTop: 10,
            borderTopWidth: 2,
            borderColor: primaryColor,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontFamily: "appFontBold",
              color: INV.black,
            }}
          >
            Total
          </Text>
          <Text
            style={{
              fontSize: 24,
              fontFamily: "appFontBold",
              color: primaryColor,
              letterSpacing: 0.5,
            }}
          >
            {currencySymbol}
            {fmtAmt(invoice.total)}
          </Text>
        </View>
      </View>

      {/* ══ NOTES ════════════════════════════════════════════════════════════ */}
      {!!invoice.notes && (
        <>
          <HDivider />
          <View
            style={{
              margin: 24,
              padding: 16,
              borderRadius: 12,
              backgroundColor: INV.greyBg,
            }}
          >
            <SLabel text="Notes" />
            <Text
              style={{
                fontSize: 14,
                fontFamily: "appFont",
                color: INV.grey,
                lineHeight: 22,
              }}
            >
              {invoice.notes}
            </Text>
          </View>
        </>
      )}

      {/* ══ FOOTER ════════════════════════════════════════════════════════════ */}
      <View style={{ flex: 1 }} />
      <HDivider />
      <View style={{ paddingVertical: 16, alignItems: "center" }}>
        <Text style={{ fontSize: 11, fontFamily: "appFont", color: INV.grey }}>
          Generated · {fmtDate(invoice.created_at)}{" "}
          {fmtTime(invoice.created_at)}
        </Text>
      </View>
    </View>
  );
}
