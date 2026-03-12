import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
  PanResponder,
  GestureResponderEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabse";
import Toast from "react-native-toast-message";
import Svg, { Path } from "react-native-svg";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ReceiptConfig = {
  enableTax: boolean;
  defaultTaxRate: number;
  enableDiscount: boolean;
  defaultDiscountType: "percentage" | "fixed";
  useSignature: boolean;
  showIssuer: boolean;
  currency: string;
};

interface ReceiptItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amount: number;
}

interface StrokePath {
  d: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Signature Pad Modal
// ─────────────────────────────────────────────────────────────────────────────

function SignaturePad({
  onSave,
  onCancel,
  colors,
}: {
  onSave: (paths: StrokePath[]) => void;
  onCancel: () => void;
  colors: any;
}) {
  const [paths, setPaths] = useState<StrokePath[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [hasDrawn, setHasDrawn] = useState(false);

  // ── ref tracks the live path to avoid stale closure inside PanResponder ──
  const currentPathRef = useRef("");
  const pathsRef = useRef<StrokePath[]>([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (e: GestureResponderEvent) => {
        const { locationX, locationY } = e.nativeEvent;
        const newPath = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        currentPathRef.current = newPath;
        setCurrentPath(newPath);
        setHasDrawn(true);
      },

      onPanResponderMove: (e: GestureResponderEvent) => {
        const { locationX, locationY } = e.nativeEvent;
        currentPathRef.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        setCurrentPath(currentPathRef.current);
      },

      onPanResponderRelease: () => {
        if (currentPathRef.current) {
          const completedPath = { d: currentPathRef.current };
          pathsRef.current = [...pathsRef.current, completedPath];
          setPaths([...pathsRef.current]);
          currentPathRef.current = "";
          setCurrentPath("");
        }
      },
    }),
  ).current;

  const handleClear = () => {
    pathsRef.current = [];
    currentPathRef.current = "";
    setPaths([]);
    setCurrentPath("");
    setHasDrawn(false);
  };

  const handleSave = () => {
    onSave(pathsRef.current);
  };

  return (
    <Modal transparent animationType="slide" statusBarTranslucent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.75)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 20,
            paddingBottom: 36,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontFamily: "appFontBold",
                color: colors.text,
              }}
            >
              Draw Signature
            </Text>
            <TouchableOpacity
              onPress={onCancel}
              style={{
                width: 32,
                height: 32,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              fontSize: 13,
              fontFamily: "appFont",
              color: colors.textSecondary,
              marginBottom: 14,
            }}
          >
            Use your finger to sign in the box below
          </Text>

          {/* Drawing canvas */}
          <View
            style={{
              height: 190,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            {...panResponder.panHandlers}
          >
            <Svg height={190} width="100%">
              {paths.map((p, i) => (
                <Path
                  key={i}
                  d={p.d}
                  stroke={colors.primary}
                  strokeWidth={2.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {currentPath ? (
                <Path
                  d={currentPath}
                  stroke={colors.primary}
                  strokeWidth={2.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
            </Svg>

            {/* Empty hint */}
            {!hasDrawn && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                pointerEvents="none"
              >
                <Ionicons
                  name="pencil-outline"
                  size={34}
                  color={colors.border}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "appFont",
                    color: colors.textTertiary,
                    marginTop: 8,
                  }}
                >
                  Sign here
                </Text>
              </View>
            )}
          </View>

          {/* Signature line */}
          <View style={{ marginTop: 10, marginHorizontal: 24 }}>
            <View style={{ height: 1, backgroundColor: colors.border }} />
            <Text
              style={{
                fontSize: 11,
                fontFamily: "appFont",
                color: colors.textTertiary,
                textAlign: "center",
                marginTop: 4,
              }}
            >
              Authorized Signature
            </Text>
          </View>

          {/* Buttons */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
            <TouchableOpacity
              onPress={handleClear}
              style={{
                flex: 1,
                paddingVertical: 15,
                borderRadius: 14,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontFamily: "appFontBold",
                  fontSize: 14,
                  color: colors.textSecondary,
                }}
              >
                Clear
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={!hasDrawn}
              style={{
                flex: 2,
                paddingVertical: 15,
                borderRadius: 14,
                alignItems: "center",
                backgroundColor: hasDrawn ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{
                  fontFamily: "appFontBold",
                  fontSize: 14,
                  color: hasDrawn ? "#000000" : colors.textTertiary,
                }}
              >
                Confirm Signature
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function CreateReceiptScreen() {
  const { colors, effectiveTheme } = useTheme();

  const [config, setConfig] = useState<ReceiptConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Customer
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Issuer
  const [issuerName, setIssuerName] = useState("");

  // Items
  const [items, setItems] = useState<ReceiptItem[]>([
    { id: "1", description: "", quantity: "1", unitPrice: "0", amount: 0 },
  ]);

  // Pricing
  const [subtotal, setSubtotal] = useState(0);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage",
  );
  const [discountValue, setDiscountValue] = useState("0");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);

  // Signature — store the actual paths so we can upload them
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureCaptured, setSignatureCaptured] = useState(false);
  const [signaturePaths, setSignaturePaths] = useState<StrokePath[]>([]);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [items, discountValue, discountType, config]);

  // ── Load config ────────────────────────────────────────────────────────────

  const loadConfig = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("user_settings")
        .select("receipt_config")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.receipt_config) {
        const cfg = data.receipt_config as ReceiptConfig;
        setConfig(cfg);
        setDiscountType(cfg.defaultDiscountType ?? "percentage");
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error loading settings",
        text2: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Totals ─────────────────────────────────────────────────────────────────

  const calculateTotals = () => {
    const sub = items.reduce((sum, item) => sum + item.amount, 0);
    setSubtotal(sub);

    let discount = 0;
    if (config?.enableDiscount && parseFloat(discountValue) > 0) {
      discount =
        discountType === "percentage"
          ? (sub * parseFloat(discountValue)) / 100
          : parseFloat(discountValue);
    }
    setDiscountAmount(discount);

    const afterDiscount = sub - discount;
    const tax =
      config?.enableTax && config.defaultTaxRate
        ? (afterDiscount * config.defaultTaxRate) / 100
        : 0;
    setTaxAmount(tax);
    setTotal(afterDiscount + tax);
  };

  // ── Item helpers ───────────────────────────────────────────────────────────

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        description: "",
        quantity: "1",
        unitPrice: "0",
        amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: keyof ReceiptItem,
    value: string,
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updated.amount =
            (parseFloat(updated.quantity) || 0) *
            (parseFloat(updated.unitPrice) || 0);
        }
        return updated;
      }),
    );
  };

  // ── Upload signature SVG to Supabase Storage ───────────────────────────────

  const uploadSignature = async (
    paths: StrokePath[],
    userId: string,
    receiptNumber: string,
  ): Promise<string | null> => {
    try {
      // Serialize the drawn paths into a self-contained SVG string
      const pathElements = paths
        .map(
          (p) =>
            `<path d="${p.d}" stroke="#FDCC00" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
        )
        .join("\n  ");

      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="190" viewBox="0 0 400 190">
  <rect width="400" height="190" fill="transparent"/>
  ${pathElements}
</svg>`;

      const filePath = `${userId}/${receiptNumber}.svg`;
      const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });

      const { error: uploadError } = await supabase.storage
        .from("signatures")
        .upload(filePath, svgBlob, {
          contentType: "image/svg+xml",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Return the public URL (bucket is private — use signed URL if needed)
      const { data: urlData } = supabase.storage
        .from("signatures")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err: any) {
      console.error("Signature upload failed:", err.message);
      throw new Error(`Signature upload failed: ${err.message}`);
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const generateReceiptNumber = () => {
    const d = new Date();
    const rand = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, "0");
    return `RCP-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${rand}`;
  };

  const handleSave = async () => {
    if (!customerName.trim()) {
      Toast.show({
        type: "error",
        text1: "Customer name required",
        position: "top",
      });
      return;
    }

    const validItems = items.filter(
      (i) => i.description.trim() && i.amount > 0,
    );
    if (validItems.length === 0) {
      Toast.show({
        type: "error",
        text1: "Add at least one item",
        position: "top",
      });
      return;
    }

    if (config?.useSignature && !signatureCaptured) {
      Toast.show({
        type: "error",
        text1: "Signature required",
        text2: "Please add a signature before saving",
        position: "top",
      });
      return;
    }

    setSaving(true);
    try {
      if (!userId) throw new Error("Not authenticated");

      const receiptNumber = generateReceiptNumber();

      // Upload signature first if required
      let signatureUrl: string | null = null;
      if (config?.useSignature && signaturePaths.length > 0) {
        signatureUrl = await uploadSignature(
          signaturePaths,
          userId,
          receiptNumber,
        );
      }

      // Insert receipt row
      const { data: receipt, error: receiptError } = await supabase
        .from("receipts")
        .insert([
          {
            user_id: userId,
            receipt_number: receiptNumber,
            customer_name: customerName,
            customer_phone: customerPhone || null,
            issuer_name: config?.showIssuer ? issuerName || null : null,
            subtotal,
            discount_type: config?.enableDiscount ? discountType : null,
            discount_value: config?.enableDiscount
              ? parseFloat(discountValue)
              : 0,
            discount_amount: discountAmount,
            tax_rate: config?.enableTax ? config.defaultTaxRate : 0,
            tax_amount: taxAmount,
            total,
            currency: config?.currency || "NGN",
            has_signature: signatureUrl !== null,
            signature_url: signatureUrl,
            status: "completed",
          },
        ])
        .select()
        .single();

      if (receiptError) throw receiptError;

      // Insert receipt items
      const { error: itemsError } = await supabase
        .from("receipt_items")
        .insert(
          validItems.map((item) => ({
            receipt_id: receipt.id,
            description: item.description,
            quantity: parseFloat(item.quantity),
            unit_price: parseFloat(item.unitPrice),
            amount: item.amount,
          })),
        );

      if (itemsError) throw itemsError;

      Toast.show({
        type: "success",
        text1: "Receipt created!",
        text2: receiptNumber,
      });
      setTimeout(() => router.back(), 1500);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to create receipt",
        text2: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Currency symbol ────────────────────────────────────────────────────────

  const currencySymbol =
    config?.currency === "USD"
      ? "$"
      : config?.currency === "GBP"
        ? "£"
        : config?.currency === "EUR"
          ? "€"
          : "₦";

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
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
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ gestureEnabled: true }} />
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
              fontSize: 18,
              fontFamily: "appFontBold",
              color: colors.text,
            }}
          >
            Create Receipt
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "appFont",
              color: colors.textSecondary,
            }}
          >
            Fill in the details below
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20 }}
        >
          {/* ── Customer Information ── */}
          <SectionHeader
            icon="person"
            title="Customer Information"
            colors={colors}
          />
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <InputField
              label="Customer Name *"
              placeholder="John Doe"
              value={customerName}
              onChangeText={setCustomerName}
              colors={colors}
            />
            <InputField
              label="Phone Number"
              placeholder="+234 803 123 4567"
              value={customerPhone}
              onChangeText={setCustomerPhone}
              keyboardType="phone-pad"
              colors={colors}
              isLast
            />
          </View>

          {/* ── Issuer — only when config.showIssuer ── */}
          {config?.showIssuer && (
            <>
              <SectionHeader
                icon="id-card"
                title="Issuer Details"
                colors={colors}
              />
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <InputField
                  label="Issuer / Staff Name"
                  placeholder="e.g. Jane Smith"
                  value={issuerName}
                  onChangeText={setIssuerName}
                  colors={colors}
                  isLast
                />
              </View>
            </>
          )}

          {/* ── Items ── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <SectionHeader icon="list" title="Items" colors={colors} />
            <TouchableOpacity
              onPress={handleAddItem}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: `${colors.primary}20`,
              }}
            >
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text
                style={{
                  fontFamily: "appFontBold",
                  fontSize: 13,
                  color: colors.primary,
                  marginLeft: 4,
                }}
              >
                Add Item
              </Text>
            </TouchableOpacity>
          </View>

          {items.map((item, index) => (
            <View
              key={item.id}
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontFamily: "appFontBold", color: colors.text }}>
                  Item {index + 1}
                </Text>
                {items.length > 1 && (
                  <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colors.error}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <InputField
                label="Description *"
                placeholder="Item description"
                value={item.description}
                onChangeText={(v) =>
                  handleItemChange(item.id, "description", v)
                }
                colors={colors}
              />

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <InputField
                    label="Qty"
                    placeholder="1"
                    value={item.quantity}
                    onChangeText={(v) =>
                      handleItemChange(item.id, "quantity", v)
                    }
                    keyboardType="numeric"
                    colors={colors}
                    isLast
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <InputField
                    label="Unit Price"
                    placeholder="0.00"
                    value={item.unitPrice}
                    onChangeText={(v) =>
                      handleItemChange(item.id, "unitPrice", v)
                    }
                    keyboardType="numeric"
                    colors={colors}
                    isLast
                  />
                </View>
              </View>

              <View
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTopWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontFamily: "appFont",
                    color: colors.textSecondary,
                  }}
                >
                  Amount
                </Text>
                <Text
                  style={{
                    fontFamily: "appFontBold",
                    fontSize: 16,
                    color: colors.text,
                  }}
                >
                  {currencySymbol}
                  {item.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
            </View>
          ))}

          {/* ── Pricing Summary ── */}
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <PricingRow
              label="Subtotal"
              value={subtotal}
              currencySymbol={currencySymbol}
              colors={colors}
            />

            {config?.enableDiscount && (
              <>
                <Divider colors={colors} />
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "appFont",
                    color: colors.textSecondary,
                    marginBottom: 8,
                  }}
                >
                  Discount
                </Text>
                <View
                  style={{ flexDirection: "row", gap: 10, marginBottom: 8 }}
                >
                  <TextInput
                    placeholder="0"
                    placeholderTextColor={colors.placeholder}
                    value={discountValue}
                    onChangeText={setDiscountValue}
                    keyboardType="numeric"
                    style={{
                      flex: 1,
                      backgroundColor: colors.input,
                      color: colors.text,
                      borderColor: colors.inputBorder,
                      borderWidth: 1,
                      borderRadius: 12,
                      padding: 14,
                      fontFamily: "appFont",
                      fontSize: 14,
                    }}
                  />
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {(["percentage", "fixed"] as const).map((type) => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => setDiscountType(type)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 14,
                          borderRadius: 12,
                          backgroundColor:
                            discountType === type
                              ? colors.primary
                              : colors.input,
                          borderWidth: 1,
                          borderColor:
                            discountType === type
                              ? colors.primary
                              : colors.inputBorder,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "appFontBold",
                            color: discountType === type ? "#000" : colors.text,
                          }}
                        >
                          {type === "percentage" ? "%" : currencySymbol}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <PricingRow
                  label="Discount Amount"
                  value={-discountAmount}
                  currencySymbol={currencySymbol}
                  colors={colors}
                  valueColor={colors.error}
                />
              </>
            )}

            {config?.enableTax && (
              <>
                <Divider colors={colors} />
                <PricingRow
                  label={`Tax (${config.defaultTaxRate}%)`}
                  value={taxAmount}
                  currencySymbol={currencySymbol}
                  colors={colors}
                />
              </>
            )}

            <View
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 2,
                borderColor: colors.border,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontFamily: "appFontBold",
                  fontSize: 16,
                  color: colors.text,
                }}
              >
                Total
              </Text>
              <Text
                style={{
                  fontFamily: "appFontBold",
                  fontSize: 24,
                  color: colors.primary,
                }}
              >
                {currencySymbol}
                {total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>

          {/* ── Signature — only when config.useSignature ── */}
          {config?.useSignature && (
            <>
              <SectionHeader icon="create" title="Signature" colors={colors} />
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                {signatureCaptured ? (
                  <View>
                    {/* Preview the captured SVG paths */}
                    <View
                      style={{
                        height: 120,
                        borderRadius: 12,
                        overflow: "hidden",
                        backgroundColor: colors.background,
                        borderWidth: 1,
                        borderColor: colors.primary,
                        marginBottom: 12,
                      }}
                    >
                      <Svg height={120} width="100%">
                        {signaturePaths.map((p, i) => (
                          <Path
                            key={i}
                            d={p.d}
                            stroke={colors.primary}
                            strokeWidth={2.5}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        ))}
                      </Svg>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setSignatureCaptured(false);
                        setSignaturePaths([]);
                        setShowSignaturePad(true);
                      }}
                      style={{
                        paddingVertical: 12,
                        borderRadius: 12,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "appFontBold",
                          fontSize: 14,
                          color: colors.textSecondary,
                        }}
                      >
                        Re-draw Signature
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setShowSignaturePad(true)}
                    style={{
                      height: 108,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: colors.border,
                      borderStyle: "dashed",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: colors.background,
                      gap: 6,
                    }}
                  >
                    <Ionicons
                      name="create-outline"
                      size={30}
                      color={colors.textTertiary}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "appFontBold",
                        color: colors.textSecondary,
                      }}
                    >
                      Tap to Sign
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "appFont",
                        color: colors.textTertiary,
                      }}
                    >
                      Required before saving
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* ── Action Buttons ── */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
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
                  fontFamily: "appFontBold",
                  fontSize: 15,
                  color: colors.text,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{
                flex: 2,
                paddingVertical: 16,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
                backgroundColor: colors.primary,
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <>
                  <Ionicons name="receipt-outline" size={20} color="#000000" />
                  <Text
                    style={{
                      fontFamily: "appFontBold",
                      fontSize: 15,
                      color: "#000000",
                    }}
                  >
                    Create Receipt
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Signature Pad Modal ── */}
      {showSignaturePad && (
        <SignaturePad
          colors={colors}
          onSave={(paths) => {
            setSignaturePaths(paths);
            setSignatureCaptured(true);
            setShowSignaturePad(false);
          }}
          onCancel={() => setShowSignaturePad(false)}
        />
      )}
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Components
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  colors: any;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: `${colors.primary}20`,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 8,
        }}
      >
        <Ionicons name={icon} size={17} color={colors.primary} />
      </View>
      <Text
        style={{
          fontSize: 15,
          fontFamily: "appFontBold",
          color: colors.text,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  colors,
  isLast = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: any;
  colors: any;
  isLast?: boolean;
}) {
  return (
    <View style={{ marginBottom: isLast ? 0 : 16 }}>
      <Text
        style={{
          fontSize: 13,
          fontFamily: "appFont",
          color: colors.textSecondary,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={{
          backgroundColor: colors.input,
          color: colors.text,
          borderColor: colors.inputBorder,
          borderWidth: 1,
          borderRadius: 12,
          padding: 14,
          fontFamily: "appFont",
          fontSize: 14,
        }}
      />
    </View>
  );
}

function PricingRow({
  label,
  value,
  currencySymbol,
  colors,
  valueColor,
}: {
  label: string;
  value: number;
  currencySymbol: string;
  colors: any;
  valueColor?: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 6,
      }}
    >
      <Text style={{ fontFamily: "appFont", color: colors.textSecondary }}>
        {label}
      </Text>
      <Text
        style={{
          fontFamily: "appFontBold",
          fontSize: 14,
          color: valueColor || colors.text,
        }}
      >
        {currencySymbol}
        {Math.abs(value).toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })}
      </Text>
    </View>
  );
}

function Divider({ colors }: { colors: any }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 12,
      }}
    />
  );
}
