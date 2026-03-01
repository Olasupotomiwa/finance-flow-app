import React, { useState, useEffect } from "react";
import {
  TextInput,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import { useProfile } from "@/context/profileContext";
import { useAuth } from "@/context/Authcontext";
import { supabase } from "@/lib/supabse";
import * as ImagePicker from "expo-image-picker";

export default function BusinessInfo() {
  const { colors, effectiveTheme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading, refreshProfile, updateProfile } = useProfile();

  // Local editable state
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [lga, setLga] = useState("");
  const [state, setState] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [businessLogoUrl, setBusinessLogoUrl] = useState<string | null>(null);

  // UI states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Populate local state whenever profile changes
  useEffect(() => {
    if (profile) {
      setBusinessName(profile.business_name || "");
      setBusinessEmail(profile.business_email || "");
      setBusinessPhone(profile.business_phone || "");
      setStreetAddress(profile.street_address || "");
      setLga(profile.lga || "");
      setState(profile.state || "");
      setBankName(profile.bank_name || "");
      setAccountName(profile.account_name || "");
      setAccountNumber(profile.account_number || "");
      setBusinessLogoUrl(profile.business_logo_url);
    }
  }, [profile]);

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshing(false);
  };

  const pickLogo = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadLogo(result.assets[0].uri);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to pick image",
        position: "top",
      });
    }
  };

  const uploadLogo = async (uri: string) => {
    if (!user) return;

    try {
      setUploadingLogo(true);

      const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${user.id}/logo.${fileExt}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });

      const { error: uploadError } = await supabase.storage
        .from("business-logos")
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const timestamp = new Date().getTime();
      const {
        data: { publicUrl },
      } = supabase.storage.from("business-logos").getPublicUrl(fileName);

      const urlWithCache = `${publicUrl}?t=${timestamp}`;

      // Sync to context + DB in one call
      const success = await updateProfile({ business_logo_url: urlWithCache });

      if (success) {
        setBusinessLogoUrl(urlWithCache);
        Toast.show({
          type: "success",
          text1: "Logo uploaded!",
          position: "top",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: error.message,
        position: "top",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    const success = await updateProfile({
      business_name: businessName,
      business_email: businessEmail,
      business_phone: businessPhone,
      street_address: streetAddress,
      lga,
      state,
      bank_name: bankName,
      account_name: accountName,
      account_number: accountNumber,
    });

    setSaving(false);

    if (success) {
      setTimeout(() => router.back(), 1000);
    }
  };

  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={effectiveTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
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
              Business Information
            </Text>
            <Text
              className="text-md font-appFont"
              style={{ color: colors.textSecondary }}
            >
              Update your business details
            </Text>
          </View>

          {/* Manual refresh button in header */}
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={refreshing}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.card }}
          >
            {refreshing ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Ionicons name="refresh" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Pull-to-refresh ScrollView */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          <View className="p-6">
            {/* Business Logo */}
            <View
              className="rounded-2xl p-6 mb-6 items-center"
              style={{ backgroundColor: colors.card }}
            >
              <Text
                className="text-base font-appFontBold mb-4"
                style={{ color: colors.text }}
              >
                Business Logo
              </Text>

              <View className="relative">
                {businessLogoUrl ? (
                  <Image
                    source={{ uri: businessLogoUrl }}
                    className="w-28 h-28 rounded-2xl"
                    style={{ backgroundColor: colors.border }}
                    resizeMode="contain"
                  />
                ) : (
                  <View
                    className="w-28 h-28 rounded-2xl items-center justify-center"
                    style={{ backgroundColor: colors.background }}
                  >
                    <Ionicons
                      name="briefcase"
                      size={48}
                      color={colors.textTertiary}
                    />
                  </View>
                )}

                <TouchableOpacity
                  onPress={pickLogo}
                  disabled={uploadingLogo}
                  className="absolute bottom-0 right-0 rounded-full p-2.5"
                  style={{ backgroundColor: colors.primary }}
                >
                  {uploadingLogo ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Ionicons name="camera" size={18} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Business Details */}
            <SectionCard
              title="Business Details"
              icon="business"
              iconColor={colors.primary}
              colors={colors}
            >
              <InputField
                label="Business Name"
                placeholder="Your Business Name"
                value={businessName}
                onChangeText={setBusinessName}
                colors={colors}
              />
              <InputField
                label="Business Email"
                placeholder="info@yourbusiness.com"
                value={businessEmail}
                onChangeText={setBusinessEmail}
                keyboardType="email-address"
                colors={colors}
              />
              <InputField
                label="Business Phone"
                placeholder="+234 809 876 5432"
                value={businessPhone}
                onChangeText={setBusinessPhone}
                keyboardType="phone-pad"
                colors={colors}
                isLast
              />
            </SectionCard>

            {/* Business Address */}
            <SectionCard
              title="Business Address"
              icon="location"
              iconColor="#10B981"
              colors={colors}
            >
              <InputField
                label="Street Address"
                placeholder="15 Awolowo Road"
                value={streetAddress}
                onChangeText={setStreetAddress}
                colors={colors}
              />
              <InputField
                label="LGA"
                placeholder="Ikeja"
                value={lga}
                onChangeText={setLga}
                colors={colors}
              />
              <InputField
                label="State"
                placeholder="Lagos"
                value={state}
                onChangeText={setState}
                colors={colors}
              />
              <InputField
                label="Country"
                placeholder="Nigeria"
                value="Nigeria"
                editable={false}
                colors={colors}
                isLast
              />
            </SectionCard>

            {/* Bank Details */}
            <SectionCard
              title="Bank Details"
              icon="card"
              iconColor="#F59E0B"
              colors={colors}
            >
              <InputField
                label="Bank Name"
                placeholder="GTBank, Access Bank..."
                value={bankName}
                onChangeText={setBankName}
                colors={colors}
              />
              <InputField
                label="Account Name"
                placeholder="Your Business Name"
                value={accountName}
                onChangeText={setAccountName}
                colors={colors}
              />
              <InputField
                label="Account Number"
                placeholder="0123456789"
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="number-pad"
                maxLength={10}
                colors={colors}
                isLast
              />
            </SectionCard>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="rounded-xl p-4 mb-8 flex-row items-center justify-center"
              style={{ backgroundColor: colors.primary }}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="save" size={20} color="white" />
                  <Text className="text-white font-appFontBold ml-2 text-base">
                    Save Business Info
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Reusable Section Card
function SectionCard({
  title,
  icon,
  iconColor,
  colors,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  colors: any;
  children: React.ReactNode;
}) {
  return (
    <View
      className="rounded-2xl p-6 mb-4"
      style={{ backgroundColor: colors.card }}
    >
      <View className="flex-row items-center mb-5">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <Text
          className="text-lg font-appFontBold"
          style={{ color: colors.text }}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

// Reusable Input Field
function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  maxLength,
  editable = true,
  colors,
  isLast = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText?: (text: string) => void;
  keyboardType?: any;
  maxLength?: number;
  editable?: boolean;
  colors: any;
  isLast?: boolean;
}) {
  return (
    <View className={isLast ? "" : "mb-4"}>
      <Text
        className="text-md font-appFont mb-2"
        style={{ color: colors.textSecondary }}
      >
        {label}
      </Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={maxLength}
        editable={editable}
        style={{
          backgroundColor: editable ? colors.input : colors.background,
          color: editable ? colors.text : colors.textTertiary,
          borderColor: colors.inputBorder,
          borderWidth: 1,
          opacity: editable ? 1 : 0.7,
        }}
        className="p-4 rounded-xl font-appFont text-base"
      />
    </View>
  );
}
