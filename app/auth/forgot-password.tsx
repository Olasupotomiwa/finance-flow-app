import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { supabase } from "../../lib/supabse";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const { colors, effectiveTheme } = useTheme();

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  async function handleResetPassword() {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    if (!isValidEmail(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (error) throw error;

      setEmailSent(true);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar
          barStyle={
            effectiveTheme === "dark" ? "light-content" : "dark-content"
          }
          backgroundColor={colors.background}
        />
        <View className="flex-1 justify-center items-center px-6">
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-6"
            style={{ backgroundColor: colors.success }}
          >
            <Ionicons name="checkmark" size={60} color="white" />
          </View>

          <Text
            className="text-3xl font-bold mb-4 text-center"
            style={{ color: colors.text }}
          >
            Check Your Email
          </Text>

          <Text
            className="text-base text-center mb-8 leading-6"
            style={{ color: colors.textSecondary }}
          >
            We've sent password reset instructions to{"\n"}
            <Text className="font-semibold" style={{ color: colors.text }}>
              {email}
            </Text>
          </Text>

          <View
            className="p-4 rounded-xl mb-6 border"
            style={{
              backgroundColor: `${colors.primary}20`,
              borderColor: `${colors.primary}30`,
            }}
          >
            <View className="flex-row items-start">
              <Ionicons
                name="information-circle"
                size={24}
                color={colors.primary}
              />
              <View className="flex-1 ml-3">
                <Text
                  className="text-sm leading-5"
                  style={{ color: colors.primary }}
                >
                  Click the link in the email to reset your password. The link
                  will expire in 1 hour.
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/auth/signin")}
            className="py-4 px-8 rounded-2xl w-full"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white font-bold text-lg text-center">
              Back to Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setEmailSent(false);
              setEmail("");
            }}
            className="mt-4 py-3"
          >
            <Text
              style={{ color: colors.textSecondary }}
              className="text-center"
            >
              Didn't receive the email?{" "}
              <Text className="font-bold" style={{ color: colors.primary }}>
                Resend
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={effectiveTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <View className="flex-1 px-6">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 mb-8 flex-row items-center"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
          <Text
            className="text-base ml-2 font-semibold"
            style={{ color: colors.text }}
          >
            Back
          </Text>
        </TouchableOpacity>

        {/* Header */}
        <View className="items-center mb-8">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.primary }}
          >
            <Ionicons name="key-outline" size={40} color="white" />
          </View>
          <Text
            className="text-4xl font-bold mb-2"
            style={{ color: colors.text }}
          >
            Forgot Password?
          </Text>
          <Text
            className="text-base text-center px-4"
            style={{ color: colors.textSecondary }}
          >
            No worries! Enter your email and we'll send you reset instructions
          </Text>
        </View>

        {/* Email Input */}
        <View className="mb-6">
          <Text
            className="text-base font-semibold mb-2 ml-1"
            style={{ color: colors.text }}
          >
            Email Address
          </Text>
          <View
            className="rounded-2xl flex-row items-center px-4 border"
            style={{
              backgroundColor: colors.input,
              borderColor: colors.inputBorder,
            }}
          >
            <Ionicons
              name="mail-outline"
              size={22}
              color={colors.textTertiary}
            />
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor={colors.placeholder}
              className="flex-1 text-base p-4"
              style={{ color: colors.text }}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              editable={!loading}
            />
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          onPress={handleResetPassword}
          disabled={loading || !email.trim()}
          className={`py-5 rounded-2xl items-center shadow-lg ${
            loading || !email.trim() ? "opacity-50" : ""
          }`}
          style={{ backgroundColor: colors.primary }}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <View className="flex-row items-center">
              <Text className="text-white font-bold text-lg mr-2">
                Send Reset Link
              </Text>
              <Ionicons name="mail" size={20} color="white" />
            </View>
          )}
        </TouchableOpacity>

        {/* Back to Sign In */}
        <TouchableOpacity
          onPress={() => router.push("/auth/signin")}
          className="mt-6 py-3"
        >
          <Text
            className="text-center text-base"
            style={{ color: colors.textSecondary }}
          >
            Remember your password?{" "}
            <Text className="font-bold" style={{ color: colors.primary }}>
              Sign In
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
