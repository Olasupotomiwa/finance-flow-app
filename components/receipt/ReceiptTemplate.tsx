import React, { useEffect, useState } from "react";
import { View, Text, Image, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";

export interface ReceiptData {
  id: string;
  receipt_number: string;
  created_at?: string;
  status: string;
  currency: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  discount_type?: "percentage" | "fixed" | null;
  discount_value?: number;
  total: number;
  notes?: string;
  customer_name: string;
  customer_phone?: string;
  issuer_name?: string;
  has_signature?: boolean;
  signature_url?: string;
  customer_email?: string;
  customer_address?: string;
  payment_method?: string;
  transaction_ref?: string;
}

export interface ReceiptItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

// ── A4 dimensions (210mm × 297mm — same as InvoiceTemplate) ──────────────────
const A4_WIDTH = Dimensions.get("window").width;
const A4_ASPECT_RATIO = 297 / 210; // Portrait A4 ratio
const A4_HEIGHT = A4_WIDTH * A4_ASPECT_RATIO;

interface Props {
  receipt: ReceiptData;
  items: ReceiptItem[];
  profile: any;
  primaryColor: string;
  currencySymbol: string;
}

const fmt = (n: number, sym: string) =>
  `${sym}${Number(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

const Row = ({
  label,
  value,
  bold,
  color,
  size,
}: {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
  size?: number;
}) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    }}
  >
    <Text
      style={{
        fontFamily: bold ? "appFontBold" : "appFont",
        fontSize: size ?? 13,
        color: color ?? "#555",
        flex: 1,
      }}
    >
      {label}
    </Text>
    <Text
      style={{
        fontFamily: bold ? "appFontBold" : "appFont",
        fontSize: size ?? 13,
        color: color ?? "#555",
      }}
    >
      {value}
    </Text>
  </View>
);

function SvgSignature({
  url,
  width = 140,
  height = 64,
  strokeColor,
}: {
  url: string;
  width?: number;
  height?: number;
  strokeColor: string;
}) {
  const [paths, setPaths] = useState<string[]>([]);

  useEffect(() => {
    if (!url) return;
    fetch(url)
      .then((r) => r.text())
      .then((svg) => {
        // Extract all d="..." attributes from <path> elements
        const matches = [...svg.matchAll(/\sd="([^"]+)"/g)];
        setPaths(matches.map((m) => m[1]));
      })
      .catch(() => {
        /* silently fail — signature just won't show */
      });
  }, [url]);

  if (paths.length === 0) return null;

  return (
    <Svg width={width} height={height} viewBox={`0 0 400 190`}>
      {paths.map((d, i) => (
        <Path
          key={i}
          d={d}
          stroke={strokeColor}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}

const formatDate = (iso?: string) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
};

export default function ReceiptTemplate({
  receipt,
  items,
  profile,
  primaryColor,
  currencySymbol: sym,
}: Props) {
  const paid =
    receipt.status?.toLowerCase() === "completed" ||
    receipt.status?.toLowerCase() === "paid";

  return (
    <View
      style={{
        width: A4_WIDTH,
        minHeight: A4_HEIGHT,
        backgroundColor: "#fff",
        boxShadow: [{
          offsetX: 0,
          offsetY: 4,
          blurRadius: 12,
          spreadDistance: 0,
          color: "rgba(0,0,0,0.08)",
        }],
        elevation: 4,
      }}
    >
      {/* ── Faded RECEIPT stamp ── */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <Text
          style={{
            fontSize: 96,
            fontFamily: "appFontBold",
            color: primaryColor,
            opacity: 0.04,
            transform: [{ rotate: "-30deg" }],
            letterSpacing: 8,
          }}
        >
          PAID
        </Text>
      </View>

      {/* ── PLAIN white header ── */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingHorizontal: 24,
          paddingTop: 28,
          paddingBottom: 20,
          borderBottomWidth: 1,
          borderColor: "#f0f0f0",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          {/* Left: logo + business details */}
          <View style={{ flex: 1, marginRight: 16 }}>
            {profile?.business_logo_url ? (
              <Image
                source={{ uri: profile.business_logo_url }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  marginBottom: 12,
                }}
                resizeMode="contain"
              />
            ) : (
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  backgroundColor: `${primaryColor}15`,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    fontFamily: "appFontBold",
                    color: primaryColor,
                  }}
                >
                  {(profile?.business_name ?? "B")[0].toUpperCase()}
                </Text>
              </View>
            )}

            <Text
              style={{ fontSize: 16, fontFamily: "appFontBold", color: "#111" }}
            >
              {profile?.business_name ?? "Business Name"}
            </Text>

            {/* Address first */}
            {profile?.street_address && (
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "appFont",
                  color: "#888",
                  marginTop: 3,
                  lineHeight: 16,
                }}
              >
                {profile?.street_address}
              </Text>
            )}
            {/* Email */}
            {profile?.email && (
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "appFont",
                  color: "#888",
                  marginTop: 2,
                }}
              >
                {profile.email}
              </Text>
            )}
            {/* Phone */}
            {profile?.phone && (
              <Text
                style={{ fontSize: 11, fontFamily: "appFont", color: "#888" }}
              >
                {profile.phone}
              </Text>
            )}
          </View>

          {/* Right: RECEIPT label, number, date, paid stamp */}
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{
                fontSize: 22,
                fontFamily: "appFontBold",
                color: primaryColor,
                letterSpacing: 2,
              }}
            >
              RECEIPT
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontFamily: "appFont",
                color: "#999",
                marginTop: 4,
              }}
            >
              #{receipt.receipt_number}
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "appFont",
                color: "#bbb",
                marginTop: 2,
              }}
            >
              {formatDate(receipt.created_at)}
            </Text>
            {paid && (
              <View
                style={{
                  marginTop: 10,
                  borderWidth: 1.5,
                  borderColor: "#22c55e",
                  borderRadius: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "appFontBold",
                    color: "#22c55e",
                    letterSpacing: 2,
                  }}
                >
                  PAID
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ── Body ── */}
      <View
        style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 }}
      >
        {/* Date + Payment Method */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 10,
                fontFamily: "appFont",
                color: "#999",
                marginBottom: 2,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Date
            </Text>
            <Text
              style={{ fontSize: 13, fontFamily: "appFontBold", color: "#222" }}
            >
              {formatDate(receipt.created_at)}
            </Text>
          </View>
          {receipt.payment_method && (
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "appFont",
                  color: "#999",
                  marginBottom: 5,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Payment Method
              </Text>
              <View
                style={{
                  backgroundColor: `${primaryColor}12`,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: `${primaryColor}25`,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "appFontBold",
                    color: primaryColor,
                  }}
                >
                  {receipt.payment_method}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View
          style={{ height: 1, backgroundColor: "#f0f0f0", marginBottom: 20 }}
        />

        {/* Received From */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 10,
              fontFamily: "appFont",
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 6,
            }}
          >
            Received From
          </Text>
          <Text
            style={{ fontSize: 15, fontFamily: "appFontBold", color: "#222" }}
          >
            {receipt.customer_name}
          </Text>
          {receipt.customer_email && (
            <Text
              style={{
                fontSize: 12,
                fontFamily: "appFont",
                color: "#666",
                marginTop: 2,
              }}
            >
              {receipt.customer_email}
            </Text>
          )}
          {receipt.customer_phone && (
            <Text
              style={{ fontSize: 12, fontFamily: "appFont", color: "#666" }}
            >
              {receipt.customer_phone}
            </Text>
          )}
          {receipt.customer_address && (
            <Text
              style={{ fontSize: 12, fontFamily: "appFont", color: "#666" }}
            >
              {receipt.customer_address}
            </Text>
          )}
        </View>

        <View
          style={{ height: 1, backgroundColor: "#f0f0f0", marginBottom: 16 }}
        />

        {/* Items table header */}
        <View
          style={{
            flexDirection: "row",
            paddingBottom: 8,
            borderBottomWidth: 1,
            borderColor: "#f0f0f0",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              flex: 1,
              fontSize: 11,
              fontFamily: "appFontBold",
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Item
          </Text>
          <Text
            style={{
              width: 40,
              fontSize: 11,
              fontFamily: "appFontBold",
              color: "#999",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            Qty
          </Text>
          <Text
            style={{
              width: 72,
              fontSize: 11,
              fontFamily: "appFontBold",
              color: "#999",
              textTransform: "uppercase",
              textAlign: "right",
            }}
          >
            Price
          </Text>
          <Text
            style={{
              width: 80,
              fontSize: 11,
              fontFamily: "appFontBold",
              color: "#999",
              textTransform: "uppercase",
              textAlign: "right",
            }}
          >
            Total
          </Text>
        </View>

        {/* Items */}
        {items.map((item, i) => (
          <View
            key={item.id ?? i}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderColor: "#f9f9f9",
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 13,
                fontFamily: "appFont",
                color: "#333",
              }}
            >
              {item.description}
            </Text>
            <Text
              style={{
                width: 40,
                fontSize: 13,
                fontFamily: "appFont",
                color: "#555",
                textAlign: "center",
              }}
            >
              {item.quantity}
            </Text>
            <Text
              style={{
                width: 72,
                fontSize: 13,
                fontFamily: "appFont",
                color: "#555",
                textAlign: "right",
              }}
            >
              {fmt(item.unit_price, sym)}
            </Text>
            <Text
              style={{
                width: 80,
                fontSize: 13,
                fontFamily: "appFont",
                color: "#333",
                textAlign: "right",
              }}
            >
              {fmt(item.amount, sym)}
            </Text>
          </View>
        ))}

        {/* Totals */}
        <View style={{ marginTop: 16 }}>
          <Row label="Subtotal" value={fmt(receipt.subtotal, sym)} />
          {(receipt.discount_amount ?? 0) > 0 && (
            <Row
              label="Discount"
              value={`- ${fmt(receipt.discount_amount, sym)}`}
              color="#e53935"
            />
          )}
          {(receipt.tax_amount ?? 0) > 0 && (
            <Row label="Tax" value={fmt(receipt.tax_amount, sym)} />
          )}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 10,
              paddingTop: 12,
              borderTopWidth: 1.5,
              borderColor: "#eee",
            }}
          >
            <Text
              style={{ fontSize: 15, fontFamily: "appFontBold", color: "#111" }}
            >
              Amount Paid
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontFamily: "appFontBold",
                color: primaryColor,
              }}
            >
              {fmt(receipt.total, sym)}
            </Text>
          </View>
        </View>

        {/* Transaction ref */}
        {receipt.transaction_ref && (
          <>
            <View
              style={{
                height: 1,
                backgroundColor: "#f0f0f0",
                marginVertical: 16,
              }}
            />
            <View
              style={{
                backgroundColor: "#f8f8f8",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "appFont",
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 4,
                }}
              >
                Transaction Reference
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "appFontBold",
                  color: "#444",
                }}
              >
                {receipt.transaction_ref}
              </Text>
            </View>
          </>
        )}

        {/* Notes */}
        {receipt.notes && (
          <>
            <View
              style={{
                height: 1,
                backgroundColor: "#f0f0f0",
                marginVertical: 16,
              }}
            />
            <Text
              style={{
                fontSize: 10,
                fontFamily: "appFont",
                color: "#999",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 4,
              }}
            >
              Notes
            </Text>
            <Text
              style={{ fontSize: 12, fontFamily: "appFont", color: "#666" }}
            >
              {receipt.notes}
            </Text>
          </>
        )}

        {/* ── Bottom row: issuer left · signature right ── */}
        <View
          style={{
            marginTop: 28,
            paddingTop: 16,
            borderTopWidth: 1,
            borderColor: "#f0f0f0",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          {/* Left: thank you note + issuer */}
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text
              style={{ fontSize: 11, fontFamily: "appFont", color: "#bbb" }}
            >
              Thank you for your payment!
            </Text>
            {receipt.issuer_name && (
              <View style={{ marginTop: 14 }}>
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#ddd",
                    width: 100,
                    marginBottom: 6,
                  }}
                />

                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: "appFont",
                    color: "#aaa",
                    marginTop: 2,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Issued By
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "appFontBold",
                    color: "#444",
                  }}
                >
                  {receipt.issuer_name}
                </Text>
              </View>
            )}
          </View>

          {/* Right: signature image — customer drawn or business uploaded */}
          {receipt.has_signature && receipt.signature_url ? (
            <View style={{ alignItems: "flex-end" }}>
              <SvgSignature
                url={receipt.signature_url}
                width={140}
                height={64}
                strokeColor={primaryColor}
              />
              <View
                style={{
                  height: 1,
                  backgroundColor: "#ccc",
                  width: 120,
                  marginTop: 6,
                }}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "appFont",
                  color: "#aaa",
                  marginTop: 3,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Customer Signature
              </Text>
            </View>
          ) : profile?.business_signature_url ? (
            <View style={{ alignItems: "flex-end" }}>
              <Image
                source={{ uri: profile.business_signature_url }}
                style={{ width: 140, height: 50, resizeMode: "contain" }}
              />
              <View
                style={{
                  height: 1,
                  backgroundColor: "#ccc",
                  width: 120,
                  marginTop: 6,
                }}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "appFont",
                  color: "#aaa",
                  marginTop: 3,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Authorized Signature
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
