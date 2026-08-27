
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useProfile } from "@/context/profileContext";
import { supabase } from "@/lib/supabase";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as Print from "expo-print";
import Toast from "react-native-toast-message";

import InvoiceTemplate, {
  InvoiceData,
  InvoiceItem,
} from "@/components/Invoice/invoiceTemplate";
import { buildInvoiceHtml } from "@/components/Invoice/buildHtml";
import ShareSheet from "@/components/shared/ShareSheet";
import { getCurrencySymbol } from "@/components/shared/currency";



// ── Screen ────────────────────────────────────────────────────────────────────
export default function InvoicePreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, effectiveTheme } = useTheme();
  const { profile } = useProfile();

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [showDownloadSheet, setShowDownloadSheet] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const paperRef = useRef<ViewShot>(null);
  const paymentMethods = ["Cash", "Card", "Bank Transfer", "USSD", "Mobile Money", "Cheque", "Other"];

  useEffect(() => {
    if (id) load();
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const { data: inv, error: e1 } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", id)
        .single();
      if (e1) throw e1;
      setInvoice(inv);
      const { data: its, error: e2 } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", id);
      if (e2) throw e2;
      setItems(its || []);
    } catch {
      Toast.show({
        type: "error",
        text1: "Failed to load invoice",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  // Share as image — ViewShot captures InvoiceTemplate
  const handleShareImage = async () => {
    setShowSheet(false);
    if (!paperRef.current) return;
    setSharing(true);
    try {
      const uri = await captureRef(paperRef, { format: "jpg", quality: 1 });
      await Sharing.shareAsync(uri, {
        mimeType: "image/jpeg",
        dialogTitle: `Invoice ${invoice?.invoice_number}`,
      });
    } catch {
      Toast.show({
        type: "error",
        text1: "Share Failed",
        text2: "Could not share image",
        position: "top",
      });
    } finally {
      setSharing(false);
    }
  };

  // Share as PDF — buildInvoiceHtml mirrors InvoiceTemplate exactly
  const handleSharePDF = async () => {
    setShowSheet(false);
    if (!invoice) return;
    setSharing(true);
    try {
      const sym = getCurrencySymbol(invoice.currency);
      const html = buildInvoiceHtml(
        invoice,
        items,
        profile,
        colors.primary,
        sym,
      );
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Invoice ${invoice.invoice_number}`,
        UTI: "com.adobe.pdf",
      });
    } catch (err) {
      console.error(err);
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

  // Download image to gallery
  const handleDownloadImage = async () => {
    setShowDownloadSheet(false);
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
          text2: "Invoice saved to gallery",
          position: "top",
        });
      } else {
        await Sharing.shareAsync(uri, {
          mimeType: "image/jpeg",
          dialogTitle: `Invoice ${invoice?.invoice_number}`,
        });
      }
    } catch {
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

  // Download PDF to device (share sheet — MediaLibrary can't save PDFs)
  const handleDownloadPDF = async () => {
    setShowDownloadSheet(false);
    if (!invoice) return;
    setSharing(true);
    try {
      const sym = getCurrencySymbol(invoice.currency);
      const html = buildInvoiceHtml(
        invoice,
        items,
        profile,
        colors.primary,
        sym,
      );
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Invoice ${invoice.invoice_number}`,
        UTI: "com.adobe.pdf",
      });
    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Download Failed",
        text2: "Could not generate PDF",
        position: "top",
      });
    } finally {
      setSharing(false);
    }
  };

  // Convert invoice to receipt
  const handleConvertToReceipt = async (paymentMethodValue: string) => {
    if (!invoice) return;
    setShowPaymentSheet(false);
    setSharing(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate a receipt number
      const receiptNumber = `RCP-${Date.now().toString(36).toUpperCase()}`;

      // Create the receipt
      const { data: receipt, error: receiptError } = await supabase
        .from("receipts")
        .insert([{
          user_id: user.id,
          receipt_number: receiptNumber,
          customer_name: invoice.client_name,
          customer_phone: invoice.client_phone || null,
          issuer_name: profile?.business_name || null,
          subtotal: invoice.subtotal,
          discount_type: invoice.discount_type,
          discount_value: invoice.discount_value,
          discount_amount: invoice.discount_amount,
          tax_rate: invoice.tax_rate,
          tax_amount: invoice.tax_amount,
          total: invoice.total,
          currency: invoice.currency,
          status: "completed",
          payment_method: paymentMethodValue || null,
          has_signature: false,
          signature_url: null,
        }])
        .select()
        .single();

      if (receiptError) throw receiptError;

      // Copy items to receipt_items
      const { error: itemsError } = await supabase
        .from("receipt_items")
        .insert(
          items.map((item) => ({
            receipt_id: receipt.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            amount: item.amount,
          })),
        );

      if (itemsError) throw itemsError;

      Toast.show({
        type: "success",
        text1: "Converted!",
        text2: `Receipt ${receiptNumber} created from invoice`,
        position: "top",
      });

      // Navigate to the new receipt
      router.replace(`/receipt/${receipt.id}`);
    } catch (err: any) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Conversion Failed",
        text2: err.message || "Could not convert invoice to receipt",
        position: "top",
      });
    } finally {
      setSharing(false);
    }
  };

  // ── States ──
  if (loading)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );

  if (!invoice)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text
          style={{
            fontFamily: "appFontBold",
            fontSize: 16,
            color: colors.text,
            marginTop: 12,
          }}
        >
          Invoice not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 16,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: colors.primary,
          }}
        >
          <Text style={{ fontFamily: "appFontBold", color: "#000" }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ gestureEnabled: true }} />
      <StatusBar
        barStyle={effectiveTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* ── App nav header ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.card,
          }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              fontSize: 17,
              fontFamily: "appFontBold",
              color: colors.text,
            }}
          >
            Invoice Preview
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "appFont",
              color: colors.textSecondary,
            }}
          >
            {invoice.invoice_number}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/invoice/edit", params: { id: id } })}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.card,
            marginRight: 8,
          }}
        >
          <Ionicons name="pencil-outline" size={18} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowSheet(true)}
          disabled={sharing}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.card,
          }}
        >
          {sharing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="share-outline" size={20} color={colors.text} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* ViewShot wraps InvoiceTemplate — this is captured for the image */}
        <ViewShot ref={paperRef} options={{ format: "jpg", quality: 1 }}>
          <View style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 16, alignItems: "center" }}>
            <InvoiceTemplate
              invoice={invoice}
              items={items}
              profile={profile}
              primaryColor={colors.primary}
              currencySymbol={getCurrencySymbol(invoice.currency)}
            />
          </View>
        </ViewShot>

        {/* ── Buttons ── */}
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            marginHorizontal: 16,
            marginBottom: 32,
            marginTop: 4,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
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
              Back
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowDownloadSheet(true)}
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

        {/* ── Convert to Receipt ── */}
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 32,
          }}
        >
          <TouchableOpacity
            onPress={() => setShowPaymentSheet(true)}
            disabled={sharing}
            style={{
              paddingVertical: 16,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: sharing ? 0.7 : 1,
            }}
          >
            <Ionicons
              name="swap-horizontal-outline"
              size={20}
              color={colors.primary}
            />
            <Text
              style={{
                fontSize: 15,
                fontFamily: "appFontBold",
                color: colors.primary,
              }}
            >
              Convert to Receipt
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ShareSheet
        visible={showSheet}
        onClose={() => setShowSheet(false)}
        onImage={handleShareImage}
        onPDF={handleSharePDF}
        colors={colors}
        title="Share Invoice As"
      />

      <ShareSheet
        visible={showDownloadSheet}
        onClose={() => setShowDownloadSheet(false)}
        onImage={handleDownloadImage}
        onPDF={handleDownloadPDF}
        colors={colors}
        title="Download Invoice As"
      />

      {/* ── Payment Method Sheet for Convert ── */}
      <Modal
        visible={showPaymentSheet}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowPaymentSheet(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          activeOpacity={1}
          onPress={() => setShowPaymentSheet(false)}
        >
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: colors.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 36,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontFamily: "appFontBold", color: colors.text }}>
                Select Payment Method
              </Text>
              <TouchableOpacity onPress={() => setShowPaymentSheet(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, fontFamily: "appFont", color: colors.textSecondary, marginBottom: 16 }}>
              Choose how the receipt payment was made
            </Text>

            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method}
                onPress={() => handleConvertToReceipt(method)}
                style={{
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  borderBottomWidth: 1,
                  borderColor: colors.border,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontFamily: "appFontBold", fontSize: 15, color: colors.text }}>
                  {method}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
