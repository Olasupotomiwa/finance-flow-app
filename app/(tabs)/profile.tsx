import { updateBusinessProfile } from "@/api/profile";
import React, { useState, useEffect } from "react";
import {
  TextInput,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { supabase } from "../../lib/supabse";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfile() {
  // Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Business Info
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");

  // Address
  const [streetAddress, setStreetAddress] = useState("");
  const [lga, setLga] = useState("");
  const [state, setState] = useState("");

  // Bank Details
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  // Images
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [businessLogoUrl, setBusinessLogoUrl] = useState<string | null>(null);

  // UI States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
          setEmail(user.email || "");

          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

          if (data) {
            // Personal
            setFirstName(data.first_name || "");
            setLastName(data.last_name || "");
            setPhone(data.phone || "");

            // Business
            setBusinessName(data.business_name || "");
            setBusinessEmail(data.business_email || "");
            setBusinessPhone(data.business_phone || "");

            // Address
            setStreetAddress(data.street_address || "");
            setLga(data.lga || "");
            setState(data.state || "");

            // Bank
            setBankName(data.bank_name || "");
            setAccountName(data.account_name || "");
            setAccountNumber(data.account_number || "");

            // Images
            setAvatarUrl(data.avatar_url);
            setBusinessLogoUrl(data.business_logo_url);
          }
          if (error) console.error("Error fetching profile:", error.message);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const pickImage = async (type: "avatar" | "logo") => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to upload images.",
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
      console.error("Error picking image:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to pick image",
        position: "top",
      });
    }
  };

  const uploadImage = async (uri: string, type: "avatar" | "logo") => {
    if (!userId) return;

    try {
      if (type === "avatar") {
        setUploadingAvatar(true);
      } else {
        setUploadingLogo(true);
      }

      Toast.show({
        type: "info",
        text1: "Uploading",
        text2: `Uploading ${type === "avatar" ? "avatar" : "logo"}...`,
        position: "top",
      });

      const fileExt = uri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${userId}/${type}.${fileExt}`;
      const bucketName = type === "avatar" ? "avatars" : "business-logos";

      const response = await fetch(uri);
      const blob = await response.blob();

      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });

      const { data, error: uploadError } = await supabase.storage
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

      const { error: dbError } = await supabase
        .from("users")
        .update({ [updateField]: publicUrlWithCache })
        .eq("id", userId);

      if (dbError) throw dbError;

      if (type === "avatar") {
        setAvatarUrl(publicUrlWithCache);
      } else {
        setBusinessLogoUrl(publicUrlWithCache);
      }

      Toast.show({
        type: "success",
        text1: "Success",
        text2: `${type === "avatar" ? "Avatar" : "Logo"} uploaded successfully!`,
        position: "top",
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: error.message || "Failed to upload image",
        position: "top",
      });
    } finally {
      if (type === "avatar") {
        setUploadingAvatar(false);
      } else {
        setUploadingLogo(false);
      }
    }
  };

  const deleteImage = async (type: "avatar" | "logo") => {
    if (!userId) return;

    Alert.alert(
      "Delete " + (type === "avatar" ? "Avatar" : "Logo"),
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
                `${userId}/${type}.jpg`,
                `${userId}/${type}.png`,
                `${userId}/${type}.jpeg`,
              ];

              await supabase.storage.from(bucketName).remove(filePatterns);

              const updateField =
                type === "avatar" ? "avatar_url" : "business_logo_url";

              const { error } = await supabase
                .from("users")
                .update({ [updateField]: null })
                .eq("id", userId);

              if (error) throw error;

              if (type === "avatar") {
                setAvatarUrl(null);
              } else {
                setBusinessLogoUrl(null);
              }

              Toast.show({
                type: "success",
                text1: "Deleted",
                text2: `${type === "avatar" ? "Avatar" : "Logo"} deleted successfully`,
                position: "top",
              });
            } catch (error: any) {
              console.error("Error deleting image:", error);
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
    if (!userId) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          business_name: businessName,
          business_email: businessEmail,
          business_phone: businessPhone,
          street_address: streetAddress,
          lga: lga,
          state: state,
          bank_name: bankName,
          account_name: accountName,
          account_number: accountNumber,
        })
        .eq("id", userId);

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Profile updated successfully!",
        position: "top",
      });

      setTimeout(() => router.back(), 1000);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: error.message,
        position: "top",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator color="#3b82f6" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-6">
            {/* Header */}
            <View className="flex-row items-center mb-8">
             
              <Text className="text-lg font-appFontBold text-white mb-3">
                Edit Profile
              </Text>
            </View>

            {/* Profile Pictures Section */}
            <View className="bg-gray-800 rounded-2xl p-6 mb-6">
              <Text className="text-white text-xl font-appFontBold mb-6">
                Profile Images
              </Text>

              {/* Avatar */}
              <View className="mb-8">
                <Text className="text-gray-300 font-appFontBold mb-3 text-base">
                  Profile Picture
                </Text>
                <View className="items-center">
                  <View className="relative">
                    {avatarUrl ? (
                      <Image
                        source={{ uri: avatarUrl }}
                        className="w-32 h-32 rounded-full bg-gray-700"
                      />
                    ) : (
                      <View className="w-32 h-32 rounded-full bg-gray-700 items-center justify-center">
                        <Ionicons name="person" size={56} color="#6b7280" />
                      </View>
                    )}

                    {/* Edit Icon */}
                    <TouchableOpacity
                      onPress={() => pickImage("avatar")}
                      disabled={uploadingAvatar}
                      className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-3 shadow-lg"
                      activeOpacity={0.8}
                    >
                      {uploadingAvatar ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Ionicons name="camera" size={20} color="white" />
                      )}
                    </TouchableOpacity>

                    {/* Delete Icon */}
                    {avatarUrl && !uploadingAvatar && (
                      <TouchableOpacity
                        onPress={() => deleteImage("avatar")}
                        className="absolute top-0 right-0 bg-red-600 rounded-full p-2 shadow-lg"
                        activeOpacity={0.8}
                      >
                        <Ionicons name="trash" size={16} color="white" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              {/* Business Logo */}
              <View>
                <Text className="text-gray-300 font-appFontBold mb-3 text-base">
                  Business Logo
                </Text>
                <View className="items-center">
                  <View className="relative">
                    {businessLogoUrl ? (
                      <Image
                        source={{ uri: businessLogoUrl }}
                        className="w-32 h-32 rounded-2xl bg-gray-700"
                        resizeMode="contain"
                      />
                    ) : (
                      <View className="w-32 h-32 rounded-2xl bg-gray-700 items-center justify-center">
                        <Ionicons name="briefcase" size={56} color="#6b7280" />
                      </View>
                    )}

                    {/* Edit Icon */}
                    <TouchableOpacity
                      onPress={() => pickImage("logo")}
                      disabled={uploadingLogo}
                      className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-3 shadow-lg"
                      activeOpacity={0.8}
                    >
                      {uploadingLogo ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <Ionicons name="camera" size={20} color="white" />
                      )}
                    </TouchableOpacity>

                    {/* Delete Icon */}
                    {businessLogoUrl && !uploadingLogo && (
                      <TouchableOpacity
                        onPress={() => deleteImage("logo")}
                        className="absolute top-0 right-0 bg-red-600 rounded-full p-2 shadow-lg"
                        activeOpacity={0.8}
                      >
                        <Ionicons name="trash" size={16} color="white" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </View>

            {/* Personal Information */}
            <View className="bg-gray-800 rounded-2xl p-6 mb-6">
              <View className="flex-row items-center mb-5">
                <Ionicons name="person" size={24} color="#3b82f6" />
                <Text className="text-white text-xl font-appFontBold ml-2">
                  Personal Information
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-gray-400 text-sm font-appFont mb-2">
                  First Name
                </Text>
                <TextInput
                  placeholder="Chukwu"
                  placeholderTextColor="#6b7280"
                  value={firstName}
                  onChangeText={setFirstName}
                  className="bg-gray-700 text-white p-4 rounded-xl font-appFont text-base"
                />
              </View>

              <View className="mb-5">
                <Text className="text-gray-400 text-sm font-appFont mb-2">
                  Last Name
                </Text>
                <TextInput
                  placeholder="Okafor"
                  placeholderTextColor="#6b7280"
                  value={lastName}
                  onChangeText={setLastName}
                  className="bg-gray-700 text-white p-4 rounded-xl font-appFont text-base"
                />
              </View>

              <View className="mb-5">
                <Text className="text-gray-400 text-sm font-appFont mb-2">
                  Email
                </Text>
                <TextInput
                  placeholder="chukwu@example.com"
                  placeholderTextColor="#6b7280"
                  value={email}
                  editable={false}
                  className="bg-gray-700/50 text-gray-400 p-4 rounded-xl font-appFont text-base"
                />
              </View>

              <View>
                <Text className="text-gray-400 text-sm font-appFont mb-2">
                  Phone Number
                </Text>
                <TextInput
                  placeholder="+234 803 123 4567"
                  placeholderTextColor="#6b7280"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  className="bg-gray-700 text-white p-4 rounded-xl font-appFont text-base"
                />
              </View>
            </View>

            {/* Business Information */}
            <View className="bg-gray-800 rounded-2xl p-6 mb-6">
              <View className="flex-row items-center mb-5">
                <Ionicons name="business" size={24} color="#3b82f6" />
                <Text className="text-white text-xl font-appFontBold ml-2">
                  Business Information
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-gray-400 text-sm font-appFont mb-2">
                  Business Name
                </Text>
                <TextInput
                  placeholder="Chukwu Enterprises Ltd"
                  placeholderTextColor="#6b7280"
                  value={businessName}
                  onChangeText={setBusinessName}
                  className="bg-gray-700 text-white p-4 rounded-xl font-appFont text-base"
                />
              </View>

              <View className="mb-5">
                <Text className="text-gray-400 text-sm font-appFont mb-2">
                  Business Email
                </Text>
                <TextInput
                  placeholder="info@chukwuenterprises.com"
                  placeholderTextColor="#6b7280"
                  value={businessEmail}
                  onChangeText={setBusinessEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="bg-gray-700 text-white p-4 rounded-xl font-appFont text-base"
                />
              </View>

              <View>
                <Text className="text-gray-400 text-sm font-appFont mb-2">
                  Business Phone
                </Text>
                <TextInput
                  placeholder="+234 809 876 5432"
                  placeholderTextColor="#6b7280"
                  value={businessPhone}
                  onChangeText={setBusinessPhone}
                  keyboardType="phone-pad"
                  className="bg-gray-700 text-white p-4 rounded-xl font-appFont text-base"
                />
              </View>
            </View>

            {/* Business Address */}
            <View className="bg-gray-800 rounded-2xl p-6 mb-6">
              <View className="flex-row items-center mb-5">
                <Ionicons name="location" size={24} color="#3b82f6" />
                <Text className="text-white text-xl font-appFontBold ml-2">
                  Business Address
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-gray-400 text-sm font-appFont mb-2">
                  Street Address
                </Text>
                <TextInput
                  placeholder="15 Awolowo Road"
                  placeholderTextColor="#6b7280"
                  value={streetAddress}
                  onChangeText={setStreetAddress}
                  className="bg-gray-700 text-white p-4 rounded-xl font-appFont text-base"
                />
              </View>

              <View className="mb-5">
                <Text className="text-gray-400 text-sm font-appFont mb-2">
                  Local Government Area (LGA)
                </Text>
                <TextInput
                  placeholder="Ikeja"
                  placeholderTextColor="#6b7280"
                  value={lga}
                  onChangeText={setLga}
                  className="bg-gray-700 text-white p-4 rounded-xl font-appFont text-base"
                />
              </View>

              <View className="mb-5">
                <Text className="text-gray-400 text-sm font-appFont mb-2">
                  State
                </Text>
                <TextInput
                  placeholder="Lagos"
                  placeholderTextColor="#6b7280"
                  value={state}
                  onChangeText={setState}
                  className="bg-gray-700 text-white p-4 rounded-xl font-appFont text-base"
                />
              </View>

              <View>
                <Text className="text-gray-400 text-sm font-appFont mb-2">
                  Country
                </Text>
                <TextInput
                  placeholder="Nigeria"
                  placeholderTextColor="#6b7280"
                  value="Nigeria"
                  editable={false}
                  className="bg-gray-700/50 text-gray-400 p-4 rounded-xl font-appFont text-base"
                />
              </View>
            </View>

            {/* Bank Details */}
            <View className="bg-gray-800 rounded-2xl p-6 mb-6">
              <View className="flex-row items-center mb-5">
                <Ionicons name="card" size={24} color="#3b82f6" />
                <Text className="text-white text-xl font-appFontBold ml-2">
                  Bank Details
                </Text>
              </View>

              <View className="mb-5">
                <Text className="text-gray-400 text-sm font-appFont mb-2">
                  Bank Name
                </Text>
                <TextInput
                  placeholder="GTBank, Access Bank, First Bank, etc."
                  placeholderTextColor="#6b7280"
                  value={bankName}
                  onChangeText={setBankName}
                  className="bg-gray-700 text-white p-4 rounded-xl font-appFont text-base"
                />
              </View>

              <View className="mb-5">
                <Text className="text-gray-400 text-sm font-appFont mb-2">
                  Account Name
                </Text>
                <TextInput
                  placeholder="Chukwu Enterprises Ltd"
                  placeholderTextColor="#6b7280"
                  value={accountName}
                  onChangeText={setAccountName}
                  className="bg-gray-700 text-white p-4 rounded-xl font-appFont text-base"
                />
              </View>

              <View>
                <Text className="text-gray-400 text-sm font-appFont mb-2">
                  Account Number
                </Text>
                <TextInput
                  placeholder="0123456789"
                  placeholderTextColor="#6b7280"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="number-pad"
                  maxLength={10}
                  className="bg-gray-700 text-white p-4 rounded-xl font-appFont text-base"
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleUpdate}
              disabled={saving}
              className="bg-blue-600 p-5 rounded-xl mb-8 flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="save" size={24} color="white" />
                  <Text className="text-white text-center font-appFontBold ml-2 text-lg">
                    Save Changes
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
