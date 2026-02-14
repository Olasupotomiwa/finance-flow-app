import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Linking as RNLinking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import SplashScreen from "./splashscreen";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabse";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/ThemeContext";

const SPLASH_SHOWN_KEY = "@splash_shown";

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [isCheckingSplash, setIsCheckingSplash] = useState(true);
  const router = useRouter();
  const { colors, effectiveTheme } = useTheme();

  useEffect(() => {
    checkSplashStatus();
  }, []);

  const checkSplashStatus = async () => {
    try {
      const hasShownSplash = await AsyncStorage.getItem(SPLASH_SHOWN_KEY);

      if (hasShownSplash === "true") {
        // Splash has been shown before, skip it
        setShowSplash(false);
      } else {
        // First time, show splash
        setShowSplash(true);
      }
    } catch (error) {
      console.error("Error checking splash status:", error);
      // If there's an error, show splash to be safe
      setShowSplash(true);
    } finally {
      setIsCheckingSplash(false);
    }
  };

  const handleSplashFinish = async () => {
    try {
      // Mark splash as shown
      await AsyncStorage.setItem(SPLASH_SHOWN_KEY, "true");
      setShowSplash(false);
    } catch (error) {
      console.error("Error saving splash status:", error);
      setShowSplash(false);
    }
  };

  const handleGoogleSignIn = () => console.log("Google Sign In");

  const handleEmailSignIn = () => {
    router.push("/auth/signin");
  };

  const handleSignUp = () => {
    router.push("/auth/signup");
  };

  // Show nothing while checking if we should show splash
  if (isCheckingSplash) {
    return null; // or a simple loading indicator
  }

  // Show splash screen if needed
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={effectiveTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <View className="flex-1 px-6 py-12 justify-between">
        {/* Header / Logo */}
        <View className="items-center">
          <View
            className="w-24 h-24 rounded-2xl items-center justify-center mb-6 shadow-lg"
            style={{ backgroundColor: colors.primary }}
          >
            <Ionicons name="receipt-outline" size={48} color="white" />
          </View>
          <Text
            className="text-4xl font-appFontBold mb-3 text-center"
            style={{ color: colors.text }}
          >
            Finance Flow
          </Text>
          <Text
            className="text-lg text-center px-4 font-appFont"
            style={{ color: colors.textSecondary }}
          >
            Create professional invoices and receipts in seconds
          </Text>
        </View>

        {/* Feature Highlights */}
        <View className="mb-8">
          {[
            "Generate invoices instantly",
            "Create professional receipts",
            "Share & export as PDF",
          ].map((item: string, index: number) => (
            <View key={index} className="flex-row items-center mb-4">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: colors.primaryLight }}
              >
                <Ionicons name="checkmark" size={20} color="white" />
              </View>
              <Text
                className="text-lg flex-1 font-appFont"
                style={{ color: colors.text }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View>
          {/* Google Sign In */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            className="rounded-2xl py-5 flex-row items-center justify-center shadow-md mb-4"
            style={{ backgroundColor: colors.white }}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={26} color="#EA4335" />
            <Text
              className="text-lg font-appFontBold ml-3"
              style={{ color: colors.black }}
            >
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Email Sign In */}
          <TouchableOpacity
            onPress={handleEmailSignIn}
            className="rounded-2xl py-5 flex-row items-center justify-center shadow-md mb-4"
            style={{ backgroundColor: colors.primary }}
            activeOpacity={0.8}
          >
            <Ionicons name="mail-outline" size={24} color="white" />
            <Text className="text-lg font-appFontBold text-white ml-3">
              Sign in with Email
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-4">
            <View
              className="flex-1 h-px"
              style={{ backgroundColor: colors.border }}
            />
            <Text
              className="mx-3 text-sm font-appFontBold"
              style={{ color: colors.textTertiary }}
            >
              OR
            </Text>
            <View
              className="flex-1 h-px"
              style={{ backgroundColor: colors.border }}
            />
          </View>

          {/* Sign Up */}
          <TouchableOpacity
            onPress={handleSignUp}
            className="rounded-2xl py-5 items-center justify-center"
            style={{ backgroundColor: colors.cardSecondary }}
            activeOpacity={0.8}
          >
            <Text
              className="text-lg font-appFontBold"
              style={{ color: colors.text }}
            >
              Create Free Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <View className="mt-6">
          <Text
            className="text-sm text-center leading-6 font-appFont"
            style={{ color: colors.textSecondary }}
          >
            By continuing, you agree to our{" "}
            <Text
              className="font-appFontBold"
              style={{ color: colors.primary }}
            >
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text
              className="font-appFontBold"
              style={{ color: colors.primary }}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
