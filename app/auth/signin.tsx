import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabse";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const router = useRouter();
  const { colors, effectiveTheme } = useTheme();

  // Animation values
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade in on mount
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email");
      return false;
    }
    setEmailError("");
    return true;
  };

  // Password validation
  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    setPasswordError("");
    return true;
  };

  // Shake animation for errors
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  async function handleSignIn() {
    setErrorMsg(null);

    // Validate inputs
    const isEmailValid = validateEmail(email.trim());
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMsg(error.message);
        triggerShake();
      } else {
        // Success - navigation handled by ProtectedRoute
        router.replace("/(tabs)/home");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred");
      triggerShake();
    } finally {
      setLoading(false);
    }
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
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: shakeAnimation }],
            }}
            className="flex-1 justify-center px-6 py-12"
          >
            {/* Header with Logo */}
            <View className="items-center mb-12">
              <View
                className="w-20 h-20 rounded-2xl items-center justify-center mb-6 shadow-2xl"
                style={{ backgroundColor: colors.primary }}
              >
                <Ionicons name="receipt-outline" size={40} color="white" />
              </View>
              <Text
                className="text-4xl font-appFontBold mb-2"
                style={{ color: colors.text }}
              >
                Welcome Back
              </Text>
              <Text
                className="text-md font-appFont"
                style={{ color: colors.textSecondary }}
              >
                Sign in to Finance Flow
              </Text>
            </View>

            {/* Error Message */}
            {errorMsg && (
              <Animated.View
                className="border p-4 rounded-2xl mb-6"
                style={{
                  backgroundColor: `${colors.error}10`,
                  borderColor: `${colors.error}30`,
                }}
              >
                <View className="flex-row items-start">
                  <Ionicons
                    name="alert-circle"
                    size={24}
                    color={colors.error}
                    style={{ marginRight: 12 }}
                  />
                  <View className="flex-1">
                    <Text
                      className="text-md font-appFontBold mb-1"
                      style={{ color: colors.errorLight }}
                    >
                      Sign In Failed
                    </Text>
                    <Text
                      className="text-md font-appFont"
                      style={{ color: colors.error }}
                    >
                      {errorMsg}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Email Input */}
            <View className="mb-5">
              <Text
                className="text-md font-appFontBold mb-2 ml-1"
                style={{ color: colors.text }}
              >
                Email Address
              </Text>
              <View
                className="rounded-2xl flex-row items-center px-4 border-2 transition-all"
                style={{
                  backgroundColor: colors.input,
                  borderColor: emailFocused
                    ? colors.primary
                    : emailError
                      ? colors.error
                      : colors.inputBorder,
                }}
              >
                <Ionicons
                  name="mail-outline"
                  size={22}
                  color={emailFocused ? colors.primary : colors.textTertiary}
                />
                <TextInput
                  placeholder="your.email@example.com"
                  placeholderTextColor={colors.placeholder}
                  className="flex-1 text-md p-4 font-appFont"
                  style={{ color: colors.text }}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) validateEmail(text);
                  }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => {
                    setEmailFocused(false);
                    validateEmail(email);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                />
                {email.length > 0 && !emailError && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.success}
                  />
                )}
              </View>
              {emailError && (
                <Text
                  className="text-md mt-2 ml-1 font-appFont"
                  style={{ color: colors.error }}
                >
                  {emailError}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View className="mb-2">
              <Text
                className="text-md font-appFontBold mb-2 ml-1"
                style={{ color: colors.text }}
              >
                Password
              </Text>
              <View
                className="rounded-2xl flex-row items-center px-4 border-2 transition-all"
                style={{
                  backgroundColor: colors.input,
                  borderColor: passwordFocused
                    ? colors.primary
                    : passwordError
                      ? colors.error
                      : colors.inputBorder,
                }}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color={passwordFocused ? colors.primary : colors.textTertiary}
                />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor={colors.placeholder}
                  secureTextEntry={!showPassword}
                  className="flex-1 text-md p-4 font-appFont"
                  style={{ color: colors.text }}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) validatePassword(text);
                  }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => {
                    setPasswordFocused(false);
                    validatePassword(password);
                  }}
                  textContentType="password"
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-2"
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
              {passwordError && (
                <Text
                  className="text-md mt-2 ml-1 font-appFont"
                  style={{ color: colors.error }}
                >
                  {passwordError}
                </Text>
              )}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => router.push("/auth/forgot-password")}
              className="self-end mb-8"
              activeOpacity={0.7}
            >
              <Text
                className="text-md font-appFontBold"
                style={{ color: colors.primary }}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={loading}
              className={`py-5 rounded-2xl items-center shadow-lg mb-6 ${
                loading ? "opacity-70" : ""
              }`}
              style={{ backgroundColor: colors.primary }}
              activeOpacity={0.8}
            >
              {loading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white font-appFontBold text-lg ml-3">
                    Signing In...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Text className="text-white font-appFontBold text-lg mr-2">
                    Sign In
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </View>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View
                className="flex-1 h-px"
                style={{ backgroundColor: colors.border }}
              />
              <Text
                className="mx-4 text-md font-appFontBold"
                style={{ color: colors.textTertiary }}
              >
                OR
              </Text>
              <View
                className="flex-1 h-px"
                style={{ backgroundColor: colors.border }}
              />
            </View>

            {/* Social Sign In */}
            <TouchableOpacity
              className="border-2 rounded-2xl py-4 flex-row items-center justify-center mb-6"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={24} color="#EA4335" />
              <Text
                className="font-appFontBold text-md ml-3"
                style={{ color: colors.text }}
              >
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center">
              <Text
                className="text-md font-appFont"
                style={{ color: colors.textSecondary }}
              >
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/auth/signup")}
                activeOpacity={0.7}
              >
                <Text
                  className="font-appFontBold text-md"
                  style={{ color: colors.primary }}
                >
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Full Screen Loader Overlay */}
      {loading && (
        <View
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: `${colors.background}F0` }}
        >
          <View className="items-center">
            <View
              className="w-24 h-24 rounded-3xl items-center justify-center mb-6 shadow-2xl"
              style={{ backgroundColor: colors.primary }}
            >
              <Ionicons name="receipt-outline" size={48} color="white" />
            </View>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              className="font-appFontBold text-xl mt-6"
              style={{ color: colors.text }}
            >
              Finance Flow
            </Text>
            <Text
              className="font-appFont text-md mt-2"
              style={{ color: colors.textSecondary }}
            >
              Signing you in...
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
