import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Share,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { useProfile } from "@/context/profileContext";
import { supabase } from "@/lib/supabse";

import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as Print from "expo-print";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  issue_date: string;
  due_date: string;
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

interface InvoicePreviewModalProps {
  visible: boolean;
  invoiceId: string | null;
  onClose: () => void;
}

// Share format picker modal
function ShareFormatModal({
  visible,
  onClose,
  onSelectImage,
  onSelectPDF,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  onSelectImage: () => void;
  onSelectPDF: () => void;
  colors: any;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "flex-end",
        }}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 12,
            paddingBottom: 36,
            paddingHorizontal: 20,
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.border,
              alignSelf: "center",
              marginBottom: 20,
            }}
          />

          <Text
            style={{
              fontSize: 16,
              fontFamily: "appFontBold",
              color: colors.text,
              marginBottom: 6,
            }}
          >
            Share Invoice As
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "appFont",
              color: colors.textSecondary,
              marginBottom: 24,
            }}
          >
            Choose the format you'd like to share
          </Text>

          {/* Image option */}
          <TouchableOpacity
            onPress={onSelectImage}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              padding: 16,
              borderRadius: 14,
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: `${colors.primary}20`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="image-outline" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "appFontBold",
                  color: colors.text,
                }}
              >
                Share as Image
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "appFont",
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                Save or share as JPG — easy to view anywhere
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textTertiary}
            />
          </TouchableOpacity>

          {/* PDF option */}
          <TouchableOpacity
            onPress={onSelectPDF}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              padding: 16,
              borderRadius: 14,
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: `${colors.error}20`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="document-text-outline"
                size={22}
                color={colors.error}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "appFontBold",
                  color: colors.text,
                }}
              >
                Share as PDF
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "appFont",
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                Professional format — ideal for email & printing
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textTertiary}
            />
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 16,
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: "center",
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: "appFontBold",
                color: colors.textSecondary,
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function InvoicePreviewModal({
  visible,
  invoiceId,
  onClose,
}: InvoicePreviewModalProps) {
  const { colors } = useTheme();
  const { profile } = useProfile();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [showShareFormat, setShowShareFormat] = useState(false);
  const paperRef = useRef<ViewShot>(null);

  useEffect(() => {
    if (visible && invoiceId) loadInvoice();
  }, [visible, invoiceId]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const { data: invoiceData, error: invoiceError } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .single();
      if (invoiceError) throw invoiceError;
      setInvoice(invoiceData);

      const { data: itemsData, error: itemsError } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoiceId);
      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    } catch (error) {
      console.error("Error loading invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "NGN":
        return "₦";
      case "USD":
        return "$";
      case "GBP":
        return "£";
      case "EUR":
        return "€";
      default:
        return "₦";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return colors.success;
      case "overdue":
        return colors.error;
      case "sent":
        return colors.primary;
      case "draft":
        return colors.textTertiary;
      case "cancelled":
        return colors.error;
      default:
        return colors.textTertiary;
    }
  };

  // ── Share as Image ──
  const handleShareImage = async () => {
    setShowShareFormat(false);
    if (!paperRef.current) return;
    setSharing(true);
    try {
      const uri = await captureRef(paperRef, { format: "jpg", quality: 1 });
      await Sharing.shareAsync(uri, {
        mimeType: "image/jpeg",
        dialogTitle: `Invoice ${invoice?.invoice_number}`,
      });
    } catch (error) {
      console.error("Share image error:", error);
      Toast.show({
        type: "error",
        text1: "Share Failed",
        text2: "Could not share invoice image",
        position: "top",
      });
    } finally {
      setSharing(false);
    }
  };

  // ── Share as PDF ──
  const handleSharePDF = async () => {
    setShowShareFormat(false);
    if (!invoice) return;
    setSharing(true);
    try {
      const sym = getCurrencySymbol(invoice.currency);
      const itemsHTML = items
        .map(
          (item, i) => `
        <tr style="background:${i % 2 === 0 ? "#FFFFFF" : "#F9FAFB"}">
          <td style="padding:10px 12px;font-size:13px;color:#111827;border-bottom:1px solid #F3F4F6;">${item.description}</td>
          <td style="padding:10px 12px;font-size:13px;color:#374151;text-align:center;border-bottom:1px solid #F3F4F6;">${item.quantity}</td>
          <td style="padding:10px 12px;font-size:13px;color:#374151;text-align:right;border-bottom:1px solid #F3F4F6;">${sym}${item.unit_price.toLocaleString()}</td>
          <td style="padding:10px 12px;font-size:13px;font-weight:700;color:#111827;text-align:right;border-bottom:1px solid #F3F4F6;">${sym}${item.amount.toLocaleString()}</td>
        </tr>
      `,
        )
        .join("");

      const discountRow =
        invoice.discount_amount > 0
          ? `
        <tr>
          <td colspan="3" style="text-align:right;padding:6px 12px;font-size:13px;color:#6B7280;">
            Discount${invoice.discount_type === "percentage" ? ` (${invoice.discount_value}%)` : ""}
          </td>
          <td style="text-align:right;padding:6px 12px;font-size:13px;font-weight:700;color:#EF4444;">
            -${sym}${invoice.discount_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </td>
        </tr>`
          : "";

      const taxRow =
        invoice.tax_amount > 0
          ? `
        <tr>
          <td colspan="3" style="text-align:right;padding:6px 12px;font-size:13px;color:#6B7280;">Tax (${invoice.tax_rate}%)</td>
          <td style="text-align:right;padding:6px 12px;font-size:13px;font-weight:700;color:#111827;">
            ${sym}${invoice.tax_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </td>
        </tr>`
          : "";

      const notesSection = invoice.notes
        ? `
        <div style="margin-top:24px;padding:14px;background:#F9FAFB;border-radius:10px;">
          <p style="font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;margin:0 0 6px;">Notes</p>
          <p style="font-size:13px;color:#6B7280;margin:0;line-height:1.5;">${invoice.notes}</p>
        </div>`
        : "";

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: -apple-system, sans-serif; background: #fff; }
          </style>
        </head>
        <body>
          <div style="max-width:700px;margin:0 auto;background:#fff;">

            <!-- Banner -->
            <div style="background:${colors.primary};padding:32px 28px;">
              <div style="width:52px;height:52px;border-radius:10px;background:rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;margin-bottom:12px;">
                ${
                  profile?.business_logo_url
                    ? `<img src="${profile.business_logo_url}" style="width:52px;height:52px;border-radius:10px;object-fit:cover;"/>`
                    : `<span style="font-size:24px;color:#fff;">🏢</span>`
                }
              </div>
              <h1 style="font-size:24px;font-weight:900;color:#fff;letter-spacing:0.5px;margin-bottom:4px;">
                ${profile?.business_name || "Your Business"}
              </h1>
              ${
                profile?.street_address || profile?.lga || profile?.state
                  ? `<p style="font-size:12px;color:rgba(255,255,255,0.9);margin-top:4px;">
                    ${[profile?.street_address, profile?.lga, profile?.state].filter(Boolean).join(", ")}
                   </p>`
                  : ""
              }
              ${profile?.business_email ? `<p style="font-size:12px;color:rgba(255,255,255,0.9);margin-top:2px;">${profile.business_email}</p>` : ""}
              ${profile?.business_phone ? `<p style="font-size:12px;color:rgba(255,255,255,0.9);margin-top:2px;">${profile.business_phone}</p>` : ""}
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:20px;">
                <span style="font-size:13px;font-weight:800;color:rgba(255,255,255,0.8);letter-spacing:3px;text-transform:uppercase;">INVOICE</span>
                <span style="background:rgba(0,0,0,0.15);padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;">${invoice.status}</span>
              </div>
            </div>

            <!-- Meta -->
            <div style="padding:24px 28px;border-bottom:1px solid #F3F4F6;">
              <p style="font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Invoice Total</p>
              <p style="font-size:36px;font-weight:900;color:${colors.primary};margin-bottom:20px;">
                ${sym}${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <div style="display:flex;gap:24px;">
                <div>
                  <p style="font-size:11px;color:#9CA3AF;text-transform:uppercase;margin-bottom:3px;">Invoice #</p>
                  <p style="font-size:13px;font-weight:700;color:#111827;">${invoice.invoice_number}</p>
                </div>
                <div>
                  <p style="font-size:11px;color:#9CA3AF;text-transform:uppercase;margin-bottom:3px;">Issue Date</p>
                  <p style="font-size:13px;font-weight:700;color:#111827;">${new Date(invoice.issue_date).toLocaleDateString("en-GB")}</p>
                </div>
                <div>
                  <p style="font-size:11px;color:#9CA3AF;text-transform:uppercase;margin-bottom:3px;">Due Date</p>
                  <p style="font-size:13px;font-weight:700;color:#111827;">${new Date(invoice.due_date).toLocaleDateString("en-GB")}</p>
                </div>
              </div>
            </div>

            <!-- Billed To -->
            <div style="padding:20px 28px;border-bottom:1px solid #F3F4F6;">
              <p style="font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Billed To</p>
              <p style="font-size:15px;font-weight:700;color:#111827;margin-bottom:3px;">${invoice.client_name}</p>
              ${invoice.client_email ? `<p style="font-size:13px;color:#6B7280;margin-bottom:2px;">${invoice.client_email}</p>` : ""}
              ${invoice.client_phone ? `<p style="font-size:13px;color:#6B7280;">${invoice.client_phone}</p>` : ""}
            </div>

            <!-- Items -->
            <div style="padding:20px 28px;">
              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr style="border-bottom:2px solid ${colors.primary};">
                    <th style="text-align:left;padding:8px 12px 8px 0;font-size:11px;color:${colors.primary};text-transform:uppercase;">Description</th>
                    <th style="text-align:center;padding:8px 12px;font-size:11px;color:${colors.primary};text-transform:uppercase;width:60px;">Qty</th>
                    <th style="text-align:right;padding:8px 12px;font-size:11px;color:${colors.primary};text-transform:uppercase;width:90px;">Price</th>
                    <th style="text-align:right;padding:8px 0 8px 12px;font-size:11px;color:${colors.primary};text-transform:uppercase;width:90px;">Amount</th>
                  </tr>
                </thead>
                <tbody>${itemsHTML}</tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="text-align:right;padding:10px 12px;font-size:13px;color:#6B7280;">Subtotal</td>
                    <td style="text-align:right;padding:10px 0;font-size:13px;font-weight:700;color:#111827;">
                      ${sym}${invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                  ${discountRow}
                  ${taxRow}
                  <tr style="border-top:2px solid ${colors.primary};">
                    <td colspan="3" style="text-align:right;padding:12px 12px;font-size:15px;font-weight:800;color:#111827;">Total</td>
                    <td style="text-align:right;padding:12px 0;font-size:18px;font-weight:900;color:${colors.primary};">
                      ${sym}${invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
              ${notesSection}
            </div>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Invoice ${invoice.invoice_number}`,
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error("Share PDF error:", error);
      Toast.show({
        type: "error",
        text1: "PDF Failed",
        text2: "Could not generate PDF",
        position: "top",
      });
    } finally {
      setSharing(false);
    }
  };

  // ── Download to gallery ──
  const handleDownload = async () => {
    if (!paperRef.current) return;
    setSharing(true);
    try {
      const uri = await captureRef(paperRef, { format: "jpg", quality: 1 });
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
        await MediaLibrary.saveToLibraryAsync(uri);
        Toast.show({
          type: "success",
          text1: "Downloaded!",
          text2: "Invoice saved to your gallery",
          position: "top",
        });
      } else {
        await Sharing.shareAsync(uri, {
          mimeType: "image/jpeg",
          dialogTitle: `Invoice ${invoice?.invoice_number}`,
        });
      }
    } catch (error) {
      console.error("Download error:", error);
      Toast.show({
        type: "error",
        text1: "Download Failed",
        text2: "Could not save invoice",
        position: "top",
      });
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
        >
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </Modal>
    );
  }

  if (!invoice) return null;

  const currencySymbol = getCurrencySymbol(invoice.currency);

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }}>
          <View
            style={{
              flex: 1,
              marginTop: 60,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              backgroundColor: colors.background,
              overflow: "hidden",
            }}
          >
            {/* ── Modal top bar ── */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "appFontBold",
                    color: colors.text,
                  }}
                >
                  Invoice Preview
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "appFont",
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  {invoice.invoice_number}
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {/* Share button → opens format picker */}
                <TouchableOpacity
                  onPress={() => setShowShareFormat(true)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.card,
                  }}
                  disabled={sharing}
                >
                  {sharing ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons
                      name="share-outline"
                      size={20}
                      color={colors.text}
                    />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.card,
                  }}
                >
                  <Ionicons name="close" size={22} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <ViewShot ref={paperRef} options={{ format: "jpg", quality: 1 }}>
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    margin: 16,
                    borderRadius: 16,
                    overflow: "hidden",
                  }}
                >
                  {/* ── Banner ── */}
                  <View
                    style={{
                      backgroundColor: colors.primary,
                      paddingHorizontal: 20,
                      paddingTop: 24,
                      paddingBottom: 20,
                    }}
                  >
                    {profile?.business_logo_url ? (
                      <Image
                        source={{ uri: profile.business_logo_url }}
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 10,
                          marginBottom: 12,
                          backgroundColor: "rgba(0,0,0,0.1)",
                        }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 10,
                          backgroundColor: "rgba(0,0,0,0.15)",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 12,
                        }}
                      >
                        <Ionicons name="business" size={26} color="#FFFFFF" />
                      </View>
                    )}
                    <Text
                      style={{
                        fontSize: 22,
                        fontFamily: "appFontBold",
                        color: "#FFFFFF",
                        letterSpacing: 0.5,
                      }}
                    >
                      {profile?.business_name || "Your Business"}
                    </Text>
                    {(profile?.street_address ||
                      profile?.lga ||
                      profile?.state) && (
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "appFont",
                          color: "#FFFFFF",
                          opacity: 0.9,
                          marginTop: 4,
                        }}
                      >
                        {[profile?.street_address, profile?.lga, profile?.state]
                          .filter(Boolean)
                          .join(", ")}
                      </Text>
                    )}
                    {profile?.business_email && (
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "appFont",
                          color: "#FFFFFF",
                          opacity: 0.9,
                          marginTop: 2,
                        }}
                      >
                        {profile.business_email}
                      </Text>
                    )}
                    {profile?.business_phone && (
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "appFont",
                          color: "#FFFFFF",
                          opacity: 0.9,
                          marginTop: 2,
                        }}
                      >
                        {profile.business_phone}
                      </Text>
                    )}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginTop: 16,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: "appFontBold",
                          color: "#FFFFFF",
                          letterSpacing: 3,
                          opacity: 0.8,
                          textTransform: "uppercase",
                        }}
                      >
                        INVOICE
                      </Text>
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 3,
                          borderRadius: 20,
                          backgroundColor: "rgba(0,0,0,0.15)",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontFamily: "appFontBold",
                            color: "#FFFFFF",
                            textTransform: "uppercase",
                          }}
                        >
                          {invoice.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* ── Invoice meta ── */}
                  <View
                    style={{
                      paddingHorizontal: 20,
                      paddingVertical: 18,
                      borderBottomWidth: 1,
                      borderColor: "#F3F4F6",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "appFont",
                        color: "#9CA3AF",
                        marginBottom: 4,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Invoice Total
                    </Text>
                    <Text
                      style={{
                        fontSize: 32,
                        fontFamily: "appFontBold",
                        color: colors.primary,
                        marginBottom: 16,
                      }}
                    >
                      {currencySymbol}
                      {invoice.total.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 11,
                            fontFamily: "appFont",
                            color: "#9CA3AF",
                            marginBottom: 3,
                            textTransform: "uppercase",
                          }}
                        >
                          Invoice #
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: "appFontBold",
                            color: "#111827",
                          }}
                        >
                          {invoice.invoice_number}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 11,
                            fontFamily: "appFont",
                            color: "#9CA3AF",
                            marginBottom: 3,
                            textTransform: "uppercase",
                          }}
                        >
                          Issue Date
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: "appFontBold",
                            color: "#111827",
                          }}
                        >
                          {new Date(invoice.issue_date).toLocaleDateString(
                            "en-GB",
                          )}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 11,
                            fontFamily: "appFont",
                            color: "#9CA3AF",
                            marginBottom: 3,
                            textTransform: "uppercase",
                          }}
                        >
                          Due Date
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: "appFontBold",
                            color: "#111827",
                          }}
                        >
                          {new Date(invoice.due_date).toLocaleDateString(
                            "en-GB",
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* ── Billed To ── */}
                  <View
                    style={{
                      paddingHorizontal: 20,
                      paddingVertical: 16,
                      borderBottomWidth: 1,
                      borderColor: "#F3F4F6",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "appFont",
                        color: "#9CA3AF",
                        marginBottom: 8,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Billed To
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        fontFamily: "appFontBold",
                        color: "#111827",
                        marginBottom: 3,
                      }}
                    >
                      {invoice.client_name}
                    </Text>
                    {invoice.client_email && (
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: "appFont",
                          color: "#6B7280",
                          marginBottom: 2,
                        }}
                      >
                        {invoice.client_email}
                      </Text>
                    )}
                    {invoice.client_phone && (
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: "appFont",
                          color: "#6B7280",
                        }}
                      >
                        {invoice.client_phone}
                      </Text>
                    )}
                  </View>

                  {/* ── Items ── */}
                  <View
                    style={{
                      paddingHorizontal: 20,
                      paddingTop: 16,
                      paddingBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        paddingBottom: 8,
                        borderBottomWidth: 2,
                        borderColor: colors.primary,
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 11,
                          fontFamily: "appFontBold",
                          color: colors.primary,
                          textTransform: "uppercase",
                        }}
                      >
                        Description
                      </Text>
                      <Text
                        style={{
                          width: 48,
                          fontSize: 11,
                          fontFamily: "appFontBold",
                          color: colors.primary,
                          textAlign: "center",
                          textTransform: "uppercase",
                        }}
                      >
                        Qty
                      </Text>
                      <Text
                        style={{
                          width: 72,
                          fontSize: 11,
                          fontFamily: "appFontBold",
                          color: colors.primary,
                          textAlign: "right",
                          textTransform: "uppercase",
                        }}
                      >
                        Price
                      </Text>
                      <Text
                        style={{
                          width: 72,
                          fontSize: 11,
                          fontFamily: "appFontBold",
                          color: colors.primary,
                          textAlign: "right",
                          textTransform: "uppercase",
                        }}
                      >
                        Amount
                      </Text>
                    </View>
                    {items.map((item, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: "row",
                          paddingVertical: 10,
                          borderBottomWidth: 1,
                          borderColor: "#F3F4F6",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            flex: 1,
                            fontSize: 13,
                            fontFamily: "appFontBold",
                            color: "#111827",
                          }}
                          numberOfLines={2}
                        >
                          {item.description}
                        </Text>
                        <Text
                          style={{
                            width: 48,
                            fontSize: 12,
                            fontFamily: "appFont",
                            color: "#374151",
                            textAlign: "center",
                          }}
                        >
                          {item.quantity}
                        </Text>
                        <Text
                          style={{
                            width: 72,
                            fontSize: 12,
                            fontFamily: "appFont",
                            color: "#374151",
                            textAlign: "right",
                          }}
                        >
                          {currencySymbol}
                          {item.unit_price.toLocaleString()}
                        </Text>
                        <Text
                          style={{
                            width: 72,
                            fontSize: 12,
                            fontFamily: "appFontBold",
                            color: "#111827",
                            textAlign: "right",
                          }}
                        >
                          {currencySymbol}
                          {item.amount.toLocaleString()}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* ── Totals ── */}
                  <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        paddingVertical: 5,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: "appFont",
                          color: "#6B7280",
                        }}
                      >
                        Subtotal
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: "appFontBold",
                          color: "#111827",
                        }}
                      >
                        {currencySymbol}
                        {invoice.subtotal.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                    </View>
                    {invoice.discount_amount > 0 && (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          paddingVertical: 5,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: "appFont",
                            color: "#6B7280",
                          }}
                        >
                          Discount
                          {invoice.discount_type === "percentage"
                            ? ` (${invoice.discount_value}%)`
                            : ""}
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: "appFontBold",
                            color: "#EF4444",
                          }}
                        >
                          -{currencySymbol}
                          {invoice.discount_amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </Text>
                      </View>
                    )}
                    {invoice.tax_amount > 0 && (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          paddingVertical: 5,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: "appFont",
                            color: "#6B7280",
                          }}
                        >
                          Tax ({invoice.tax_rate}%)
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: "appFontBold",
                            color: "#111827",
                          }}
                        >
                          {currencySymbol}
                          {invoice.tax_amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </Text>
                      </View>
                    )}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        paddingVertical: 10,
                        marginTop: 6,
                        borderTopWidth: 2,
                        borderColor: colors.primary,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontFamily: "appFontBold",
                          color: "#111827",
                        }}
                      >
                        Total
                      </Text>
                      <Text
                        style={{
                          fontSize: 18,
                          fontFamily: "appFontBold",
                          color: colors.primary,
                        }}
                      >
                        {currencySymbol}
                        {invoice.total.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                    </View>
                  </View>

                  {/* ── Notes ── */}
                  {invoice.notes && (
                    <View
                      style={{
                        marginHorizontal: 20,
                        marginBottom: 20,
                        padding: 14,
                        borderRadius: 10,
                        backgroundColor: "#F9FAFB",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: "appFontBold",
                          color: "#9CA3AF",
                          textTransform: "uppercase",
                          marginBottom: 6,
                        }}
                      >
                        Notes
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: "appFont",
                          color: "#6B7280",
                          lineHeight: 18,
                        }}
                      >
                        {invoice.notes}
                      </Text>
                    </View>
                  )}
                </View>
              </ViewShot>

              {/* ── Action Buttons ── */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  marginHorizontal: 16,
                  marginBottom: 32,
                  marginTop: 8,
                }}
              >
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    borderRadius: 14,
                    alignItems: "center",
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: "appFontBold",
                      color: colors.text,
                    }}
                  >
                    Close
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDownload}
                  disabled={sharing}
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    borderRadius: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: 8,
                    backgroundColor: colors.primary,
                    opacity: sharing ? 0.7 : 1,
                  }}
                >
                  {sharing ? (
                    <ActivityIndicator size="small" color={colors.background} />
                  ) : (
                    <>
                      <Ionicons
                        name="download-outline"
                        size={20}
                        color={colors.background}
                      />
                      <Text
                        style={{
                          fontSize: 15,
                          fontFamily: "appFontBold",
                          color: colors.background,
                        }}
                      >
                        Download
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
        <Toast />
      </Modal>

      {/* Share Format Picker */}
      <ShareFormatModal
        visible={showShareFormat}
        onClose={() => setShowShareFormat(false)}
        onSelectImage={handleShareImage}
        onSelectPDF={handleSharePDF}
        colors={colors}
      />
    </>
  );
}
