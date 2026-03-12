import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { useProfile } from "@/context/profileContext";
import { supabase } from "@/lib/supabse";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import * as Print from "expo-print";
import Toast from "react-native-toast-message";

import ReceiptTemplate, {
  ReceiptData,
  ReceiptItem,
} from "@/components/Receipt/ReceiptTemplate";
import { buildReceiptHtml } from "@/components/Receipt/buildReceiptHtml";

// ── Currency helper ───────────────────────────────────────────────────────────
const getSymbol = (c: string) =>
  ({ NGN: "₦", USD: "$", GBP: "£", EUR: "€" })[c] ?? "₦";

// ── Share bottom sheet ────────────────────────────────────────────────────────
function ShareSheet({
  visible,
  onClose,
  onImage,
  onPDF,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  onImage: () => void;
  onPDF: () => void;
  colors: any;
}) {
  if (!visible) return null;
  const opts = [
    {
      label: "Share as Image",
      sub: "Save or send as JPG — easy to view anywhere",
      icon: "image-outline",
      color: colors.primary,
      cb: onImage,
    },
    {
      label: "Share as PDF",
      sub: "Professional format — ideal for email & printing",
      icon: "document-text-outline",
      color: colors.error,
      cb: onPDF,
    },
  ];
  return (
    <View style={{ position: "absolute", inset: 0, zIndex: 50 }}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
        activeOpacity={1}
        onPress={onClose}
      />
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
            marginBottom: 4,
          }}
        >
          Share Receipt As
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontFamily: "appFont",
            color: colors.textSecondary,
            marginBottom: 20,
          }}
        >
          Choose the format you'd like to share
        </Text>
        {opts.map((o, i) => (
          <TouchableOpacity
            key={i}
            onPress={o.cb}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              padding: 16,
              borderRadius: 14,
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: `${o.color}20`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name={o.icon as any} size={22} color={o.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "appFontBold",
                  color: colors.text,
                }}
              >
                {o.label}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "appFont",
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                {o.sub}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={onClose}
          style={{
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
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function ReceiptPreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, effectiveTheme } = useTheme();
  const { profile } = useProfile();

  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const paperRef = useRef<ViewShot>(null);

  useEffect(() => {
    if (id) load();
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);

      const { data: rec, error: e1 } = await supabase
        .from("receipts")
        .select("*")
        .eq("id", id)
        .single();
      if (e1) throw e1;
      setReceipt(rec);

      const { data: its, error: e2 } = await supabase
        .from("receipt_items")
        .select("*")
        .eq("receipt_id", id);
      if (e2) throw e2;
      setItems(its || []);
    } catch {
      Toast.show({
        type: "error",
        text1: "Failed to load receipt",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Share as image ────────────────────────────────────────────────────────
  const handleShareImage = async () => {
    setShowSheet(false);
    if (!paperRef.current) return;
    setSharing(true);
    try {
      const uri = await captureRef(paperRef, { format: "jpg", quality: 1 });
      await Sharing.shareAsync(uri, {
        mimeType: "image/jpeg",
        dialogTitle: `Receipt ${receipt?.receipt_number}`,
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

  // ── Share as PDF ──────────────────────────────────────────────────────────
  const handleSharePDF = async () => {
    setShowSheet(false);
    if (!receipt) return;
    setSharing(true);
    try {
      const sym = getSymbol(receipt.currency);
      const html = buildReceiptHtml(
        receipt,
        items,
        profile,
        colors.primary,
        sym,
      );
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Receipt ${receipt.receipt_number}`,
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

  // ── Download to gallery ───────────────────────────────────────────────────
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
          text2: "Receipt saved to gallery",
          position: "top",
        });
      } else {
        await Sharing.shareAsync(uri, {
          mimeType: "image/jpeg",
          dialogTitle: `Receipt ${receipt?.receipt_number}`,
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Download Failed",
        text2: "Could not save receipt",
        position: "top",
      });
    } finally {
      setSharing(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
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

  if (!receipt)
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
          Receipt not found
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={effectiveTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* ── Header ── */}
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
            Receipt Preview
          </Text>
          <Text
            style={{
              fontSize: 12,
              fontFamily: "appFont",
              color: colors.textSecondary,
            }}
          >
            {receipt.receipt_number}
          </Text>
        </View>
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
        {/* ViewShot wraps ReceiptTemplate — captured for image/PDF */}
        <ViewShot ref={paperRef} options={{ format: "jpg", quality: 1 }}>
          <View style={{ margin: 16 }}>
            <ReceiptTemplate
              receipt={receipt}
              items={items}
              profile={profile}
              primaryColor={colors.primary}
              currencySymbol={getSymbol(receipt.currency)}
            />
          </View>
        </ViewShot>

        {/* ── Action Buttons ── */}
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

      <ShareSheet
        visible={showSheet}
        onClose={() => setShowSheet(false)}
        onImage={handleShareImage}
        onPDF={handleSharePDF}
        colors={colors}
      />
    </SafeAreaView>
  );
}
