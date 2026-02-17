import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import Toast from "react-native-toast-message";

export default function ReceiptConfig() {
  const { colors, effectiveTheme } = useTheme();
  const router = useRouter();

  const [footerMessage, setFooterMessage] = useState(
    "Thank you for your business!",
  );
  const [showQRCode, setShowQRCode] = useState(false);
  const [showLogo, setShowLogo] = useState(true);
  const [showBankDetails, setShowBankDetails] = useState(true);
  const [autoSendEmail, setAutoSendEmail] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("A4");
  const [saving, setSaving] = useState(false);

  const paperFormats = [
    { id: "A4", name: "A4", description: "Standard paper (210 × 297mm)" },
    { id: "A5", name: "A5", description: "Half A4 (148 × 210mm)" },
    {
      id: "receipt",
      name: "Receipt Roll",
      description: "Thermal receipt paper",
    },
  ];

  const handleSave = async () => {
    setSaving(true);
    // TODO: Save to database or AsyncStorage
    setTimeout(() => {
      setSaving(false);
      Toast.show({
        type: "success",
        text1: "Receipt config saved!",
        text2: "Receipt configuration updated",
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
            Receipt Configuration
          </Text>
          <Text
            className="text-xs font-appFont"
            style={{ color: colors.textSecondary }}
          >
            Configure receipt settings
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          {/* Paper Format */}
          <View
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: `${colors.primary}20` }}
              >
                <Ionicons name="document" size={22} color={colors.primary} />
              </View>
              <Text
                className="text-lg font-appFontBold"
                style={{ color: colors.text }}
              >
                Paper Format
              </Text>
            </View>

            {paperFormats.map((format) => (
              <TouchableOpacity
                key={format.id}
                className="flex-row items-center p-4 rounded-xl mb-3"
                style={{
                  backgroundColor:
                    selectedFormat === format.id
                      ? `${colors.primary}20`
                      : colors.background,
                  borderWidth: 2,
                  borderColor:
                    selectedFormat === format.id
                      ? colors.primary
                      : colors.border,
                }}
                onPress={() => setSelectedFormat(format.id)}
                activeOpacity={0.8}
              >
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                  style={{
                    backgroundColor:
                      selectedFormat === format.id
                        ? colors.primary
                        : colors.card,
                  }}
                >
                  <Ionicons
                    name="receipt"
                    size={24}
                    color={
                      selectedFormat === format.id
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
                    {format.name}
                  </Text>
                  <Text
                    className="text-xs font-appFont"
                    style={{ color: colors.textSecondary }}
                  >
                    {format.description}
                  </Text>
                </View>
                {selectedFormat === format.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Receipt Options */}
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
                Receipt Options
              </Text>
            </View>

            <ToggleItem
              label="Show Business Logo"
              description="Display logo on receipt"
              value={showLogo}
              onToggle={() => setShowLogo(!showLogo)}
              colors={colors}
            />
            <ToggleItem
              label="Show Bank Details"
              description="Include bank info on receipt"
              value={showBankDetails}
              onToggle={() => setShowBankDetails(!showBankDetails)}
              colors={colors}
            />
            <ToggleItem
              label="Show QR Code"
              description="Add QR code for verification"
              value={showQRCode}
              onToggle={() => setShowQRCode(!showQRCode)}
              colors={colors}
            />
            <ToggleItem
              label="Auto Send Email"
              description="Email receipt after creation"
              value={autoSendEmail}
              onToggle={() => setAutoSendEmail(!autoSendEmail)}
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
                style={{ backgroundColor: "#F59E0B20" }}
              >
                <Ionicons name="chatbubble" size={22} color="#F59E0B" />
              </View>
              <Text
                className="text-lg font-appFontBold"
                style={{ color: colors.text }}
              >
                Footer Message
              </Text>
            </View>

            <Text
              className="text-sm font-appFont mb-2"
              style={{ color: colors.textSecondary }}
            >
              Custom message shown at the bottom of every receipt
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
            />

            <Text
              className="text-xs font-appFont mt-2"
              style={{ color: colors.textTertiary }}
            >
              {footerMessage.length}/100 characters
            </Text>
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
              Save Receipt Config
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
            className="text-xs font-appFont mt-0.5"
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
