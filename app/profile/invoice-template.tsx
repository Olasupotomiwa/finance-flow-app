import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import Toast from "react-native-toast-message";

export default function InvoiceTemplate() {
  const { colors, effectiveTheme } = useTheme();
  const router = useRouter();

  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [showLogo, setShowLogo] = useState(true);
  const [showSignature, setShowSignature] = useState(true);
  const [showBankDetails, setShowBankDetails] = useState(true);
  const [showTax, setShowTax] = useState(false);
  const [currency, setCurrency] = useState("NGN");
  const [saving, setSaving] = useState(false);

  const templates = [
    { id: "modern", name: "Modern", description: "Clean and minimal" },
    { id: "classic", name: "Classic", description: "Traditional business" },
    { id: "bold", name: "Bold", description: "Strong & impactful" },
  ];

  const colorOptions = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316",
  ];

  const handleSave = async () => {
    setSaving(true);
    // TODO: Save to database or AsyncStorage
    setTimeout(() => {
      setSaving(false);
      Toast.show({
        type: "success",
        text1: "Template saved!",
        text2: "Invoice template configuration updated",
        position: "top",
      });
    }, 1000);
  };

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
            Invoice Template
          </Text>
          <Text
            className="text-md font-appFont"
            style={{ color: colors.textSecondary }}
          >
            Customize your invoice layout
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {/* Template Selection */}
          <View
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <Ionicons name="layers" size={22} color={colors.primary} />
              </View>
              <Text
                className="text-lg font-appFontBold"
                style={{ color: colors.text }}
              >
                Choose Template
              </Text>
            </View>

            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                className="flex-row items-center p-4 rounded-xl mb-3"
                style={{
                  backgroundColor:
                    selectedTemplate === template.id
                      ? `${colors.primary}20`
                      : colors.background,
                  borderWidth: 2,
                  borderColor:
                    selectedTemplate === template.id
                      ? colors.primary
                      : colors.border,
                }}
                onPress={() => setSelectedTemplate(template.id)}
                activeOpacity={0.8}
              >
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                  style={{
                    backgroundColor:
                      selectedTemplate === template.id
                        ? colors.primary
                        : colors.card,
                  }}
                >
                  <Ionicons
                    name="document-text"
                    size={24}
                    color={
                      selectedTemplate === template.id
                        ? "white"
                        : colors.textTertiary
                    }
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="font-appFontBold text-base"
                    style={{ color: colors.text }}
                  >
                    {template.name}
                  </Text>
                  <Text
                    className="text-md font-appFont"
                    style={{ color: colors.textSecondary }}
                  >
                    {template.description}
                  </Text>
                </View>
                {selectedTemplate === template.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Color Selection */}
          <View
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: "#F59E0B20" }}
              >
                <Ionicons name="color-palette" size={22} color="#F59E0B" />
              </View>
              <Text
                className="text-lg font-appFontBold"
                style={{ color: colors.text }}
              >
                Brand Color
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-3">
              {colorOptions.map((color) => (
                <TouchableOpacity
                  key={color}
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: color,
                    borderWidth: primaryColor === color ? 3 : 0,
                    borderColor: colors.text,
                  }}
                  onPress={() => setPrimaryColor(color)}
                >
                  {primaryColor === color && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Toggle Settings */}
          <View
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: "#10B98120" }}
              >
                <Ionicons name="settings" size={22} color="#10B981" />
              </View>
              <Text
                className="text-lg font-appFontBold"
                style={{ color: colors.text }}
              >
                Invoice Options
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
              label="Show Signature"
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
              label="Include Tax"
              description="Add tax calculation to total"
              value={showTax}
              onToggle={() => setShowTax(!showTax)}
              colors={colors}
              isLast
            />
          </View>

          {/* Currency Selection */}
          <View
            className="rounded-2xl p-5 mb-6"
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
                Currency
              </Text>
            </View>

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

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="rounded-xl p-4 mb-8 flex-row items-center justify-center"
            style={{ backgroundColor: colors.primary }}
            activeOpacity={0.8}
          >
            <Ionicons name="save" size={20} color="white" />
            <Text className="text-white font-appFontBold ml-2 text-base">
              Save Template Settings
            </Text>
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
            className="text-md font-appFont mt-0.5"
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
