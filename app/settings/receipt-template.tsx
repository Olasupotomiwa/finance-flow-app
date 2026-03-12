import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabse";
import Toast from "react-native-toast-message";

type ReceiptConfig = {
  enableTax: boolean;
  defaultTaxRate: number;
  enableDiscount: boolean;
  defaultDiscountType: "percentage" | "fixed";
  useSignature: boolean;
  showIssuer: boolean;
  currency: string;
};

const DEFAULT_RECEIPT_CONFIG: ReceiptConfig = {
  enableTax: false,
  defaultTaxRate: 7.5,
  enableDiscount: true,
  defaultDiscountType: "percentage",
  useSignature: true,
  showIssuer: true,
  currency: "NGN",
};

const CURRENCIES = ["NGN", "USD", "GBP", "EUR"];
const DISCOUNT_TYPES = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed Amount" },
];

export default function ReceiptConfigPage() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [enableTax, setEnableTax] = useState(DEFAULT_RECEIPT_CONFIG.enableTax);
  const [defaultTaxRate, setDefaultTaxRate] = useState(
    String(DEFAULT_RECEIPT_CONFIG.defaultTaxRate),
  );
  const [enableDiscount, setEnableDiscount] = useState(
    DEFAULT_RECEIPT_CONFIG.enableDiscount,
  );
  const [defaultDiscountType, setDefaultDiscountType] = useState<
    "percentage" | "fixed"
  >(DEFAULT_RECEIPT_CONFIG.defaultDiscountType);
  const [useSignature, setUseSignature] = useState(
    DEFAULT_RECEIPT_CONFIG.useSignature,
  );
  const [showIssuer, setShowIssuer] = useState(
    DEFAULT_RECEIPT_CONFIG.showIssuer,
  );
  const [currency, setCurrency] = useState(DEFAULT_RECEIPT_CONFIG.currency);

  useEffect(() => {
    loadConfig();
  }, []);

  const applyConfig = (config: ReceiptConfig) => {
    setEnableTax(config.enableTax ?? DEFAULT_RECEIPT_CONFIG.enableTax);
    setDefaultTaxRate(
      String(config.defaultTaxRate ?? DEFAULT_RECEIPT_CONFIG.defaultTaxRate),
    );
    setEnableDiscount(
      config.enableDiscount ?? DEFAULT_RECEIPT_CONFIG.enableDiscount,
    );
    setDefaultDiscountType(
      config.defaultDiscountType ?? DEFAULT_RECEIPT_CONFIG.defaultDiscountType,
    );
    setUseSignature(config.useSignature ?? DEFAULT_RECEIPT_CONFIG.useSignature);
    setShowIssuer(config.showIssuer ?? DEFAULT_RECEIPT_CONFIG.showIssuer);
    setCurrency(config.currency ?? DEFAULT_RECEIPT_CONFIG.currency);
  };

  const loadConfig = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_settings")
        .select("receipt_config")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.receipt_config && Object.keys(data.receipt_config).length > 0) {
        // Row exists and has real config — apply it
        applyConfig(data.receipt_config as ReceiptConfig);
      } else if (data && Object.keys(data.receipt_config).length === 0) {
        // Row exists but receipt_config is empty {} — patch it
        await upsertReceiptConfig(user.id, DEFAULT_RECEIPT_CONFIG);
        applyConfig(DEFAULT_RECEIPT_CONFIG);
      } else {
        // No row at all — create it
        await upsertReceiptConfig(user.id, DEFAULT_RECEIPT_CONFIG);
        applyConfig(DEFAULT_RECEIPT_CONFIG);
      }
    } catch (err: any) {
      console.error("Error loading receipt config:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message || "Failed to load configuration",
      });
    } finally {
      setLoading(false);
    }
  };

  const upsertReceiptConfig = async (userId: string, config: ReceiptConfig) => {
    // Only touches receipt_config — leaves invoice_config and general_settings untouched
    const { error } = await supabase
      .from("user_settings")
      .upsert(
        { user_id: userId, receipt_config: config },
        { onConflict: "user_id" },
      );

    if (error) throw error;
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const config: ReceiptConfig = {
        enableTax,
        defaultTaxRate: parseFloat(defaultTaxRate) || 0,
        enableDiscount,
        defaultDiscountType,
        useSignature,
        showIssuer,
        currency,
      };

      await upsertReceiptConfig(user.id, config);

      Toast.show({
        type: "success",
        text1: "Saved!",
        text2: "Receipt configuration updated successfully",
      });

      setTimeout(() => router.back(), 1500);
    } catch (err: any) {
      console.error("Error saving receipt config:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message || "Failed to save configuration",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{ flex: 1, backgroundColor: colors.background }}
        className="items-center justify-center"
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        className="flex-row items-center px-6 pt-16 pb-4"
        style={{ backgroundColor: colors.card }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text
          className="text-xl font-appFontBold flex-1"
          style={{ color: colors.text }}
        >
          Receipt Configuration
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 py-6">
          {/* Currency */}
          <SectionCard title="Currency" colors={colors}>
            <View className="flex-row flex-wrap gap-3">
              {CURRENCIES.map((curr) => (
                <TouchableOpacity
                  key={curr}
                  onPress={() => setCurrency(curr)}
                  className="px-6 py-3 rounded-xl flex-1 min-w-[100px]"
                  style={{
                    backgroundColor:
                      currency === curr ? colors.primary : colors.background,
                    borderWidth: 1,
                    borderColor:
                      currency === curr ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    className="text-center font-appFontBold"
                    style={{
                      color: currency === curr ? "#000000" : colors.text,
                    }}
                  >
                    {curr}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SectionCard>

          {/* Tax */}
          <SectionCard title="Tax" colors={colors}>
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text
                  className="text-base font-appFontBold"
                  style={{ color: colors.text }}
                >
                  Enable Tax
                </Text>
                <Text
                  className="text-sm mt-1 font-appFont"
                  style={{ color: colors.textSecondary }}
                >
                  Add tax to receipt totals
                </Text>
              </View>
              <Switch
                value={enableTax}
                onValueChange={setEnableTax}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {enableTax && (
              <View>
                <Text
                  className="text-sm font-appFontBold mb-2"
                  style={{ color: colors.text }}
                >
                  Default Tax Rate (%)
                </Text>
                <TextInput
                  value={defaultTaxRate}
                  onChangeText={setDefaultTaxRate}
                  placeholder="7.5"
                  keyboardType="decimal-pad"
                  className="px-4 py-3 rounded-xl font-appFont"
                  style={{
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            )}
          </SectionCard>

          {/* Discount */}
          <SectionCard title="Discount" colors={colors}>
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text
                  className="text-base font-appFontBold"
                  style={{ color: colors.text }}
                >
                  Enable Discount
                </Text>
                <Text
                  className="text-sm mt-1 font-appFont"
                  style={{ color: colors.textSecondary }}
                >
                  Allow discounts on receipts
                </Text>
              </View>
              <Switch
                value={enableDiscount}
                onValueChange={setEnableDiscount}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {enableDiscount && (
              <View>
                <Text
                  className="text-sm font-appFontBold mb-3"
                  style={{ color: colors.text }}
                >
                  Default Discount Type
                </Text>
                <View className="flex-row gap-3">
                  {DISCOUNT_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      onPress={() =>
                        setDefaultDiscountType(
                          type.value as "percentage" | "fixed",
                        )
                      }
                      className="px-4 py-3 rounded-xl flex-1"
                      style={{
                        backgroundColor:
                          defaultDiscountType === type.value
                            ? colors.primary
                            : colors.background,
                        borderWidth: 1,
                        borderColor:
                          defaultDiscountType === type.value
                            ? colors.primary
                            : colors.border,
                      }}
                    >
                      <Text
                        className="text-center font-appFontBold text-sm"
                        style={{
                          color:
                            defaultDiscountType === type.value
                              ? "#000000"
                              : colors.text,
                        }}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </SectionCard>

          {/* Signature */}
          <SectionCard title="Signature" colors={colors}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text
                  className="text-base font-appFontBold"
                  style={{ color: colors.text }}
                >
                  Use Signature
                </Text>
                <Text
                  className="text-sm mt-1 font-appFont"
                  style={{ color: colors.textSecondary }}
                >
                  Show signature field on receipts
                </Text>
              </View>
              <Switch
                value={useSignature}
                onValueChange={setUseSignature}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </SectionCard>

          {/* Show Issuer */}
          <SectionCard title="Issuer" colors={colors}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text
                  className="text-base font-appFontBold"
                  style={{ color: colors.text }}
                >
                  Show Issuer
                </Text>
                <Text
                  className="text-sm mt-1 font-appFont"
                  style={{ color: colors.textSecondary }}
                >
                  Display issuer/staff name on receipts
                </Text>
              </View>
              <Switch
                value={showIssuer}
                onValueChange={setShowIssuer}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </SectionCard>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View
        className="px-6 py-4"
        style={{
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className="py-4 rounded-xl items-center"
          style={{
            backgroundColor: colors.primary,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text
              className="font-appFontBold text-base"
              style={{ color: "#000000" }}
            >
              Save Configuration
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Reusable section wrapper
function SectionCard({
  title,
  colors,
  children,
}: {
  title: string;
  colors: any;
  children: React.ReactNode;
}) {
  return (
    <View
      className="rounded-2xl p-5 mb-4"
      style={{ backgroundColor: colors.card }}
    >
      <Text
        className="text-base font-appFontBold mb-4"
        style={{ color: colors.text }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}
