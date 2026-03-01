import React, { useState, useEffect } from "react";
import {
  TextInput,
  TouchableOpacity,
  Text,
  View,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../lib/supabse";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "@/components/Home/header";
import { useTheme } from "@/context/ThemeContext";
import { useProfile } from "@/context/profileContext"; 
import { useAuth } from "@/context/Authcontext"; // 🔥 Add this
import { DashboardHomeSkeleton } from "@/components/Home/skeletonloader";

export default function Profile() {
  const { colors, effectiveTheme } = useTheme();
  const router = useRouter();
  const { profile, loading, updateProfile } = useProfile(); 
  const { user } = useAuth(); 

  // Local form state - synced from context
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [businessLogoUrl, setBusinessLogoUrl] = useState<string | null>(null);

  // UI States
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // 🔥 Sync local state from context whenever profile changes
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setPhone(profile.phone || "");
      setAvatarUrl(profile.avatar_url);
      setBusinessLogoUrl(profile.business_logo_url);
    }
    if (user) {
      setEmail(user.email || "");
    }
  }, [profile, user]);

  const pickImage = async (type: "avatar" | "logo") => {
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
        aspect: type === "avatar" ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0].uri, type);
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

  const uploadImage = async (uri: string, type: "avatar" | "logo") => {
    if (!user) return;

    try {
      if (type === "avatar") setUploadingAvatar(true);
      else setUploadingLogo(true);

      Toast.show({
        type: "info",
        text1: "Uploading",
        text2: `Uploading ${type === "avatar" ? "avatar" : "logo"}...`,
        position: "top",
      });

      const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${user.id}/${type}.${fileExt}`;
      const bucketName = type === "avatar" ? "avatars" : "business-logos";

      const response = await fetch(uri);
      const blob = await response.blob();

      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const timestamp = new Date().getTime();
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucketName).getPublicUrl(fileName);

      const publicUrlWithCache = `${publicUrl}?t=${timestamp}`;
      const updateField =
        type === "avatar" ? "avatar_url" : "business_logo_url";

      // 🔥 Use context updateProfile - reflects everywhere
      await updateProfile({ [updateField]: publicUrlWithCache });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: error.message || "Failed to upload image",
        position: "top",
      });
    } finally {
      if (type === "avatar") setUploadingAvatar(false);
      else setUploadingLogo(false);
    }
  };

  const deleteImage = async (type: "avatar" | "logo") => {
    if (!user) return;

    Alert.alert(
      `Delete ${type === "avatar" ? "Avatar" : "Logo"}`,
      "Are you sure you want to delete this image?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const bucketName =
                type === "avatar" ? "avatars" : "business-logos";
              const filePatterns = [
                `${user.id}/${type}.jpg`,
                `${user.id}/${type}.png`,
                `${user.id}/${type}.jpeg`,
              ];

              await supabase.storage.from(bucketName).remove(filePatterns);

              const updateField =
                type === "avatar" ? "avatar_url" : "business_logo_url";

              // 🔥 Use context updateProfile - reflects everywhere
              await updateProfile({ [updateField]: null });
            } catch (error: any) {
              Toast.show({
                type: "error",
                text1: "Delete Failed",
                text2: error.message,
                position: "top",
              });
            }
          },
        },
      ],
    );
  };

  const handleUpdate = async () => {
    setSaving(true);

    // 🔥 Use context updateProfile - reflects everywhere automatically
    await updateProfile({
      first_name: firstName,
      last_name: lastName,
      phone: phone,
    });

    setSaving(false);
  };

  // 🔥 Use skeleton instead of ActivityIndicator
  if (loading) {
    return <DashboardHomeSkeleton />;
  }

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
        <AppHeader showAvatar={false} showGreeting={false} title="Profile" />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-6">
            {/* Avatar Section */}
            <View
              className="rounded-3xl p-6 mb-6 items-center"
              style={{ backgroundColor: colors.card }}
            >
              <View className="relative mb-4">
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    className="w-28 h-28 rounded-full"
                    style={{ backgroundColor: colors.border }}
                  />
                ) : (
                  <View
                    className="w-28 h-28 rounded-full items-center justify-center"
                    style={{ backgroundColor: colors.background }}
                  >
                    <Ionicons
                      name="person"
                      size={52}
                      color={colors.textTertiary}
                    />
                  </View>
                )}

                {/* Camera Button */}
                <TouchableOpacity
                  onPress={() => pickImage("avatar")}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 rounded-full p-2.5 shadow-lg"
                  style={{ backgroundColor: colors.primary }}
                  activeOpacity={0.8}
                >
                  {uploadingAvatar ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Ionicons name="camera" size={18} color="white" />
                  )}
                </TouchableOpacity>

                {/* Delete Button */}
                {avatarUrl && !uploadingAvatar && (
                  <TouchableOpacity
                    onPress={() => deleteImage("avatar")}
                    className="absolute top-0 right-0 rounded-full p-2 shadow-lg"
                    style={{ backgroundColor: colors.error }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="trash" size={14} color="white" />
                  </TouchableOpacity>
                )}
              </View>

              <Text
                className="text-xl font-appFontBold"
                style={{ color: colors.text }}
              >
                {firstName && lastName
                  ? `${firstName} ${lastName}`
                  : "Complete your profile"}
              </Text>
              <Text
                className="text-sm font-appFont mt-1"
                style={{ color: colors.textSecondary }}
              >
                {email}
              </Text>
            </View>

            {/* Personal Information */}
            <View
              className="rounded-2xl p-6 mb-4"
              style={{ backgroundColor: colors.card }}
            >
              <View className="flex-row items-center mb-5">
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: `${colors.primary}20` }}
                >
                  <Ionicons name="person" size={22} color={colors.primary} />
                </View>
                <Text
                  className="text-lg font-appFontBold"
                  style={{ color: colors.text }}
                >
                  Personal Information
                </Text>
              </View>

              {/* First Name */}
              <View className="mb-4">
                <Text
                  className="text-sm font-appFont mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  First Name
                </Text>
                <TextInput
                  placeholder="Enter first name"
                  placeholderTextColor={colors.placeholder}
                  value={firstName}
                  onChangeText={setFirstName}
                  style={{
                    backgroundColor: colors.input,
                    color: colors.text,
                    borderColor: colors.inputBorder,
                    borderWidth: 1,
                  }}
                  className="p-4 rounded-xl font-appFont text-base"
                />
              </View>

              {/* Last Name */}
              <View className="mb-4">
                <Text
                  className="text-sm font-appFont mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Last Name
                </Text>
                <TextInput
                  placeholder="Enter last name"
                  placeholderTextColor={colors.placeholder}
                  value={lastName}
                  onChangeText={setLastName}
                  style={{
                    backgroundColor: colors.input,
                    color: colors.text,
                    borderColor: colors.inputBorder,
                    borderWidth: 1,
                  }}
                  className="p-4 rounded-xl font-appFont text-base"
                />
              </View>

              {/* Email */}
              <View className="mb-4">
                <Text
                  className="text-sm font-appFont mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Email
                </Text>
                <TextInput
                  value={email}
                  editable={false}
                  style={{
                    backgroundColor: colors.background,
                    color: colors.textTertiary,
                    borderColor: colors.border,
                    borderWidth: 1,
                    opacity: 0.7,
                  }}
                  className="p-4 rounded-xl font-appFont text-base"
                />
              </View>

              {/* Phone */}
              <View>
                <Text
                  className="text-sm font-appFont mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Phone Number
                </Text>
                <TextInput
                  placeholder="+234 803 123 4567"
                  placeholderTextColor={colors.placeholder}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  style={{
                    backgroundColor: colors.input,
                    color: colors.text,
                    borderColor: colors.inputBorder,
                    borderWidth: 1,
                  }}
                  className="p-4 rounded-xl font-appFont text-base"
                />
              </View>
            </View>

            {/* Save Personal Info Button */}
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={saving}
              className="rounded-xl p-4 mb-6 flex-row items-center justify-center"
              style={{ backgroundColor: colors.primary }}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="save" size={20} color="white" />
                  <Text className="text-white font-appFontBold ml-2 text-base">
                    Save Personal Info
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

// Nav Item Component - unchanged
function ProfileNavItem({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
  colors,
  showBorder = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  colors: any;
  showBorder?: boolean;
}) {
  return (
    <>
      {showBorder && (
        <View
          className="mx-6"
          style={{ height: 1, backgroundColor: colors.border }}
        />
      )}
      <TouchableOpacity
        className="flex-row items-center px-6 py-4"
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View
          className="w-11 h-11 rounded-xl items-center justify-center mr-4"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>

        <View className="flex-1">
          <Text
            className="text-base font-appFontBold mb-0.5"
            style={{ color: colors.text }}
          >
            {title}
          </Text>
          <Text
            className="text-xs font-appFont"
            style={{ color: colors.textSecondary }}
          >
            {subtitle}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textTertiary}
        />
      </TouchableOpacity>
    </>
  );
}
