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

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  const handleGoogleSignIn = () => console.log("Google Sign In");
  const handleEmailSignIn = () => {
    router.push("/signin");
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

 


  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#30371fff" />

      <View className="flex-1 px-6 py-12 justify-between">
        {/* Header / Logo */}
        <View className="items-center">
          <View className="w-24 h-24 bg-blue-600 rounded-2xl items-center justify-center mb-6 shadow-lg">
            <Ionicons name="receipt-outline" size={48} color="white" />
          </View>
          <Text className="text-4xl font-appFontBold text-white mb-3 text-center">
            Finance Flow
          </Text>
          <Text className="text-lg text-gray-300 text-center px-4 font-appFont">
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
              <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-4">
                <Ionicons name="checkmark" size={20} color="white" />
              </View>
              <Text className="text-lg text-white flex-1 font-appFont">
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
            className="bg-white rounded-2xl py-5 flex-row items-center justify-center shadow-md mb-4"
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={26} color="#EA4335" />
            <Text className="text-lg font-appFontBold text-gray-900 ml-3">
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Email Sign In */}
          <TouchableOpacity
            onPress={handleEmailSignIn}
            className="bg-blue-600 rounded-2xl py-5 flex-row items-center justify-center shadow-md mb-4"
            activeOpacity={0.8}
          >
            <Ionicons name="mail-outline" size={24} color="white" />
            <Text className="text-lg font-appFontBold text-white ml-3">
              Sign in with Email
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-gray-500" />
            <Text className="mx-3 text-sm text-gray-400 font-appFontBold">
              OR
            </Text>
            <View className="flex-1 h-px bg-gray-500" />
          </View>

          {/* Sign Up */}
          <TouchableOpacity
            onPress={handleSignUp}
            className="bg-gray-700 rounded-2xl py-5 items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-lg font-appFontBold text-white">
              Create Free Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <View className="mt-6">
          <Text className="text-sm text-gray-400 text-center leading-6 font-appFont">
            By continuing, you agree to our{" "}
            <Text className="text-blue-400 font-appFontBold">
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text className="text-blue-400 font-appFontBold">
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
