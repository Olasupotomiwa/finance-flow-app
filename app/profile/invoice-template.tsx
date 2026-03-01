import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import Toast from "react-native-toast-message";
import { supabase } from "@/lib/supabse";

export default function InvoiceTemplate() {
  const { colors, effectiveTheme } = useTheme();
  const router = useRouter();

  // Invoice Display Options
  const [showLogo, setShowLogo] = useState(true);
  const [showSignature, setShowSignature] = useState(true);
  const [showBankDetails, setShowBankDetails] = useState(true);
  const [showTerms, setShowTerms] = useState(false);

  // Pricing Options
  const [enableTax, setEnableTax] = useState(false);
  const [defaultTaxRate, setDefaultTaxRate] = useState("7.5");
  const [enableDiscount, setEnableDiscount] = useState(true);
  const [defaultDiscountType, setDefaultDiscountType] = useState("percentage"); // percentage or fixed

  // Payment Terms
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState("30");
  const [currency, setCurrency] = useState("NGN");

  // Footer Options
  const [showFooterMessage, setShowFooterMessage] = useState(true);
  const [footerMessage, setFooterMessage] = useState(
    "Thank you for your business!",
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const paymentTermsOptions = [
    { value: "0", label: "Due on Receipt" },
    { value: "15", label: "Net 15 Days" },
    { value: "30", label: "Net 30 Days" },
    { value: "45", label: "Net 45 Days" },
    { value: "60", label: "Net 60 Days" },
  ];

  // Load existing configuration
  useEffect(() => {
    loadConfiguration();
  }, []);

 const loadConfiguration = async () => {
   try {
     const {
       data: { user },
     } = await supabase.auth.getUser();

     if (!user) {
       Toast.show({
         type: "error",
         text1: "Not authenticated",
         text2: "Please sign in to continue",
         position: "top",
       });
       return;
     }

     setUserId(user.id);

     // Changed from "users" to "user_settings" and "id" to "user_id"
     const { data, error } = await supabase
       .from("user_settings") // ← CHANGED FROM "users"
       .select("invoice_config")
       .eq("user_id", user.id) // ← CHANGED FROM "id"
       .maybeSingle(); // ← CHANGED FROM "single()"

     // If no settings exist, create them
     if (!data) {
       console.log("No settings found, creating default settings...");

       const { data: newData, error: insertError } = await supabase
         .from("user_settings")
         .insert([
           {
             user_id: user.id,
             invoice_config: {
               showLogo: true,
               showSignature: true,
               showBankDetails: true,
               showTerms: false,
               enableTax: false,
               defaultTaxRate: "7.5",
               enableDiscount: true,
               defaultDiscountType: "percentage",
               defaultPaymentTerms: "30",
               currency: "NGN",
               showFooterMessage: true,
               footerMessage: "Thank you for your business!",
             },
           },
         ])
         .select("invoice_config")
         .single();

       if (insertError) {
         console.error("Insert error:", insertError);
         throw insertError;
       }

       if (newData?.invoice_config) {
         loadSettingsFromConfig(newData.invoice_config);
       }
     } else if (error) {
       console.error("Select error:", error);
       throw error;
     } else {
       // Load existing settings
       if (data.invoice_config) {
         loadSettingsFromConfig(data.invoice_config);
       }
     }
   } catch (error: any) {
     console.error("Error loading configuration:", error);
     Toast.show({
       type: "error",
       text1: "Failed to load settings",
       text2: error.message || "Unknown error",
       position: "top",
     });
   } finally {
     setLoading(false);
   }
 };

 // Add this helper function
 const loadSettingsFromConfig = (config: any) => {
   if (config.showLogo !== undefined) setShowLogo(config.showLogo);
   if (config.showSignature !== undefined)
     setShowSignature(config.showSignature);
   if (config.showBankDetails !== undefined)
     setShowBankDetails(config.showBankDetails);
   if (config.showTerms !== undefined) setShowTerms(config.showTerms);
   if (config.enableTax !== undefined) setEnableTax(config.enableTax);
   if (config.defaultTaxRate !== undefined)
     setDefaultTaxRate(config.defaultTaxRate);
   if (config.enableDiscount !== undefined)
     setEnableDiscount(config.enableDiscount);
   if (config.defaultDiscountType !== undefined)
     setDefaultDiscountType(config.defaultDiscountType);
   if (config.defaultPaymentTerms !== undefined)
     setDefaultPaymentTerms(config.defaultPaymentTerms);
   if (config.currency !== undefined) setCurrency(config.currency);
   if (config.showFooterMessage !== undefined)
     setShowFooterMessage(config.showFooterMessage);
   if (config.footerMessage !== undefined)
     setFooterMessage(config.footerMessage);
 };

 const handleSave = async () => {
   if (!userId) return;

   setSaving(true);

   try {
     const config = {
       showLogo,
       showSignature,
       showBankDetails,
       showTerms,
       enableTax,
       defaultTaxRate,
       enableDiscount,
       defaultDiscountType,
       defaultPaymentTerms,
       currency,
       showFooterMessage,
       footerMessage,
     };

     // Changed from "users" to "user_settings" and "id" to "user_id"
     const { error } = await supabase
       .from("user_settings") // ← CHANGED FROM "users"
       .update({ invoice_config: config })
       .eq("user_id", userId); // ← CHANGED FROM "id"

     if (error) throw error;

     Toast.show({
       type: "success",
       text1: "✅ Settings Saved",
       text2: "Invoice configuration updated successfully",
       position: "top",
     });

     setTimeout(() => router.back(), 1500);
   } catch (error: any) {
     console.error("Error saving configuration:", error);
     Toast.show({
       type: "error",
       text1: "❌ Save Failed",
       text2: error.message || "Failed to save configuration",
       position: "top",
     });
   } finally {
     setSaving(false);
   }
 };

  if (loading) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator color={colors.primary} size="large" />
        <Text
          className="text-sm font-appFont mt-4"
          style={{ color: colors.textSecondary }}
        >
          Loading configuration...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={effectiveTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View
        className="flex-row items-center px-6 py-4 border-b"
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: colors.card }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            className="text-xl font-appFontBold"
            style={{ color: colors.text }}
          >
            Invoice Configuration
          </Text>
          <Text
            className="text-sm font-appFont"
            style={{ color: colors.textSecondary }}
          >
            Customize invoice settings
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {/* Info Banner */}
          <View
            className="rounded-2xl p-4 mb-4 flex-row items-start"
            style={{ backgroundColor: `${colors.primary}15` }}
          >
            <Ionicons
              name="information-circle"
              size={20}
              color={colors.primary}
              style={{ marginTop: 2 }}
            />
            <Text
              className="text-sm font-appFont ml-3 flex-1"
              style={{ color: colors.text }}
            >
              Invoice numbers are automatically generated with format{" "}
              <Text className="font-appFontBold">INV-YYYYMMDD-XXXX</Text> to
              ensure uniqueness.
            </Text>
          </View>

          {/* Currency & Payment Terms */}
          <View
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: "#8B5CF620" }}
              >
                <Ionicons name="cash" size={22} color="#8B5CF6" />
              </View>
              <Text
                className="text-lg font-appFontBold"
                style={{ color: colors.text }}
              >
                Currency & Payment
              </Text>
            </View>

            {/* Currency Selection */}
            <Text
              className="text-sm font-appFont mb-2"
              style={{ color: colors.textSecondary }}
            >
              Default Currency
            </Text>
            <View className="mb-4">
              {["NGN", "USD", "GBP", "EUR"].map((curr) => (
                <TouchableOpacity
                  key={curr}
                  className="flex-row items-center py-3 px-4 rounded-xl mb-2"
                  style={{
                    backgroundColor:
                      currency === curr
                        ? `${colors.primary}20`
                        : colors.background,
                    borderWidth: 1,
                    borderColor:
                      currency === curr ? colors.primary : colors.border,
                  }}
                  onPress={() => setCurrency(curr)}
                >
                  <Text
                    className="flex-1 font-appFontBold"
                    style={{ color: colors.text }}
                  >
                    {curr === "NGN"
                      ? "🇳🇬 Nigerian Naira (₦)"
                      : curr === "USD"
                        ? "🇺🇸 US Dollar ($)"
                        : curr === "GBP"
                          ? "🇬🇧 British Pound (£)"
                          : "🇪🇺 Euro (€)"}
                  </Text>
                  {currency === curr && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Payment Terms */}
            <Text
              className="text-sm font-appFont mb-2"
              style={{ color: colors.textSecondary }}
            >
              Default Payment Terms
            </Text>
            <View>
              {paymentTermsOptions.map((term) => (
                <TouchableOpacity
                  key={term.value}
                  className="flex-row items-center py-3 px-4 rounded-xl mb-2"
                  style={{
                    backgroundColor:
                      defaultPaymentTerms === term.value
                        ? `${colors.primary}20`
                        : colors.background,
                    borderWidth: 1,
                    borderColor:
                      defaultPaymentTerms === term.value
                        ? colors.primary
                        : colors.border,
                  }}
                  onPress={() => setDefaultPaymentTerms(term.value)}
                >
                  <Text
                    className="flex-1 font-appFontBold"
                    style={{ color: colors.text }}
                  >
                    {term.label}
                  </Text>
                  {defaultPaymentTerms === term.value && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pricing Options */}
          <View
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: "#F59E0B20" }}
              >
                <Ionicons name="calculator" size={22} color="#F59E0B" />
              </View>
              <Text
                className="text-lg font-appFontBold"
                style={{ color: colors.text }}
              >
                Pricing Options
              </Text>
            </View>

            {/* Enable Discount */}
            <ToggleItem
              label="Enable Discount"
              description="Allow adding discounts to invoices"
              value={enableDiscount}
              onToggle={() => setEnableDiscount(!enableDiscount)}
              colors={colors}
            />

            {/* Discount Type */}
            {enableDiscount && (
              <View className="mt-3 mb-3">
                <Text
                  className="text-sm font-appFont mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Default Discount Type
                </Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 py-3 px-4 rounded-xl"
                    style={{
                      backgroundColor:
                        defaultDiscountType === "percentage"
                          ? `${colors.primary}20`
                          : colors.background,
                      borderWidth: 1,
                      borderColor:
                        defaultDiscountType === "percentage"
                          ? colors.primary
                          : colors.border,
                    }}
                    onPress={() => setDefaultDiscountType("percentage")}
                  >
                    <Text
                      className="text-center font-appFontBold"
                      style={{ color: colors.text }}
                    >
                      Percentage (%)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 py-3 px-4 rounded-xl"
                    style={{
                      backgroundColor:
                        defaultDiscountType === "fixed"
                          ? `${colors.primary}20`
                          : colors.background,
                      borderWidth: 1,
                      borderColor:
                        defaultDiscountType === "fixed"
                          ? colors.primary
                          : colors.border,
                    }}
                    onPress={() => setDefaultDiscountType("fixed")}
                  >
                    <Text
                      className="text-center font-appFontBold"
                      style={{ color: colors.text }}
                    >
                      Fixed Amount
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Enable Tax */}
            <ToggleItem
              label="Enable Tax"
              description="Add tax calculations to invoices"
              value={enableTax}
              onToggle={() => setEnableTax(!enableTax)}
              colors={colors}
            />

            {/* Tax Rate */}
            {enableTax && (
              <View className="mt-3">
                <Text
                  className="text-sm font-appFont mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Default Tax Rate (%)
                </Text>
                <TextInput
                  value={defaultTaxRate}
                  onChangeText={setDefaultTaxRate}
                  placeholder="7.5"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="decimal-pad"
                  style={{
                    backgroundColor: colors.input,
                    color: colors.text,
                    borderColor: colors.inputBorder,
                    borderWidth: 1,
                  }}
                  className="p-4 rounded-xl font-appFont text-base"
                />
                <Text
                  className="text-xs font-appFont mt-1"
                  style={{ color: colors.textTertiary }}
                >
                  Nigeria VAT is typically 7.5%
                </Text>
              </View>
            )}
          </View>

          {/* Display Options */}
          <View
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: "#10B98120" }}
              >
                <Ionicons name="eye" size={22} color="#10B981" />
              </View>
              <Text
                className="text-lg font-appFontBold"
                style={{ color: colors.text }}
              >
                Display Options
              </Text>
            </View>

            <ToggleItem
              label="Show Business Logo"
              description="Display your logo on invoices"
              value={showLogo}
              onToggle={() => setShowLogo(!showLogo)}
              colors={colors}
            />
            <ToggleItem
              label="Show Signature Line"
              description="Include signature field"
              value={showSignature}
              onToggle={() => setShowSignature(!showSignature)}
              colors={colors}
            />
            <ToggleItem
              label="Show Bank Details"
              description="Display payment information"
              value={showBankDetails}
              onToggle={() => setShowBankDetails(!showBankDetails)}
              colors={colors}
            />
            <ToggleItem
              label="Show Terms & Conditions"
              description="Include terms and conditions"
              value={showTerms}
              onToggle={() => setShowTerms(!showTerms)}
              colors={colors}
              isLast
            />
          </View>

          {/* Footer Message */}
          <View
            className="rounded-2xl p-5 mb-6"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: "#EC489920" }}
              >
                <Ionicons name="chatbubble" size={22} color="#EC4899" />
              </View>
              <Text
                className="text-lg font-appFontBold"
                style={{ color: colors.text }}
              >
                Footer Message
              </Text>
            </View>

            <ToggleItem
              label="Show Footer Message"
              description="Display custom message at bottom of invoice"
              value={showFooterMessage}
              onToggle={() => setShowFooterMessage(!showFooterMessage)}
              colors={colors}
            />

            {showFooterMessage && (
              <View className="mt-3">
                <Text
                  className="text-sm font-appFont mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Footer Text
                </Text>
                <TextInput
                  value={footerMessage}
                  onChangeText={setFooterMessage}
                  placeholder="Thank you for your business!"
                  placeholderTextColor={colors.placeholder}
                  multiline
                  numberOfLines={3}
                  style={{
                    backgroundColor: colors.input,
                    color: colors.text,
                    borderColor: colors.inputBorder,
                    borderWidth: 1,
                    minHeight: 80,
                    textAlignVertical: "top",
                  }}
                  className="p-4 rounded-xl font-appFont text-base"
                  maxLength={200}
                />
                <Text
                  className="text-xs font-appFont mt-1"
                  style={{ color: colors.textTertiary }}
                >
                  {footerMessage.length}/200 characters
                </Text>
              </View>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="rounded-xl p-4 mb-8 flex-row items-center justify-center"
            style={{
              backgroundColor: colors.primary,
              opacity: saving ? 0.7 : 1,
            }}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="save" size={20} color="white" />
                <Text className="text-white font-appFontBold ml-2 text-base">
                  Save Configuration
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Toggle Item Component
function ToggleItem({
  label,
  description,
  value,
  onToggle,
  colors,
  isLast = false,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  colors: any;
  isLast?: boolean;
}) {
  return (
    <>
      <View className="flex-row items-center py-3">
        <View className="flex-1 pr-4">
          <Text
            className="text-base font-appFontBold"
            style={{ color: colors.text }}
          >
            {label}
          </Text>
          <Text
            className="text-sm font-appFont mt-0.5"
            style={{ color: colors.textSecondary }}
          >
            {description}
          </Text>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: `${colors.primary}80` }}
          thumbColor={value ? colors.primary : colors.textTertiary}
        />
      </View>
      {!isLast && (
        <View style={{ height: 1, backgroundColor: colors.border }} />
      )}
    </>
  );
}
