import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function EmailSent() {
  const router = useRouter();
  const { colors, effectiveTheme } = useTheme();

  // Animation values
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const checkmarkRotate = useRef(new Animated.Value(0)).current;
  const emailScale = useRef(new Animated.Value(0)).current;
  const emailBounce = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // 1. Checkmark pop in with rotation
      Animated.parallel([
        Animated.spring(checkmarkScale, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(checkmarkRotate, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),

      // 2. Email icon pop in
      Animated.spring(emailScale, {
        toValue: 1,
        tension: 100,
        friction: 5,
        delay: 200,
        useNativeDriver: true,
      }),

      // 3. Fade in text
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

   const bounce = Animated.loop(
     Animated.sequence([
       Animated.timing(emailBounce, {
         toValue: -10,
         duration: 1000,
         useNativeDriver: true,
       }),
       Animated.timing(emailBounce, {
         toValue: 0,
         duration: 1000,
         useNativeDriver: true,
       }),
     ]),
   );
   return () => {
     bounce.stop();
   };
  }, []);

  const rotate = checkmarkRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={effectiveTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <View className="flex-1 justify-center items-center px-6">
        {/* Animated Checkmark Circle */}
        <Animated.View
          style={{
            transform: [{ scale: checkmarkScale }, { rotate }],
            backgroundColor: colors.success,
          }}
          className="w-32 h-32 rounded-full items-center justify-center mb-8 shadow-lg"
        >
          <Ionicons name="checkmark" size={80} color="white" />
        </Animated.View>

        {/* Animated Email Icon */}
        <Animated.View
          style={{
            transform: [{ scale: emailScale }, { translateY: emailBounce }],
            backgroundColor: `${colors.primary}20`,
          }}
          className="p-6 rounded-full mb-6"
        >
          <Ionicons name="mail" size={60} color={colors.primary} />
        </Animated.View>

        {/* Animated Text Content */}
        <Animated.View style={{ opacity: fadeAnim }} className="items-center">
          <Text
            className="text-3xl font-bold mb-3 text-center"
            style={{ color: colors.text }}
          >
            Check Your Email!
          </Text>

          <Text
            className="text-base text-center mb-6 leading-6"
            style={{ color: colors.textSecondary }}
          >
            We've sent a confirmation link to your email address.
          </Text>

          {/* Instructions */}
          <View
            className="p-4 rounded-2xl mb-6 w-full"
            style={{ backgroundColor: colors.cardSecondary }}
          >
            <View className="flex-row items-start mb-3">
              <View
                className="rounded-full w-6 h-6 items-center justify-center mr-3 mt-0.5"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-bold text-xs">1</Text>
              </View>
              <Text
                className="text-sm flex-1"
                style={{ color: colors.textSecondary }}
              >
                Check your inbox for the confirmation email
              </Text>
            </View>

            <View className="flex-row items-start mb-3">
              <View
                className="rounded-full w-6 h-6 items-center justify-center mr-3 mt-0.5"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-bold text-xs">2</Text>
              </View>
              <Text
                className="text-sm flex-1"
                style={{ color: colors.textSecondary }}
              >
                Click the confirmation link in the email
              </Text>
            </View>

            <View className="flex-row items-start">
              <View
                className="rounded-full w-6 h-6 items-center justify-center mr-3 mt-0.5"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-white font-bold text-xs">3</Text>
              </View>
              <Text
                className="text-sm flex-1"
                style={{ color: colors.textSecondary }}
              >
                The app will open and you'll be automatically logged in
              </Text>
            </View>
          </View>

          <View
            className="p-4 rounded-2xl border mb-8 w-full"
            style={{
              backgroundColor: `${colors.primary}10`,
              borderColor: `${colors.primary}30`,
            }}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="information-circle"
                size={24}
                color={colors.primary}
              />
              <Text
                className="text-sm ml-2 flex-1"
                style={{ color: colors.primary }}
              >
                Don't forget to check your spam folder
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            onPress={() => router.replace("/auth/signin")}
            className="px-8 py-4 rounded-2xl mb-4 w-full"
            style={{ backgroundColor: colors.primary }}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-lg text-center">
              Go to Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/")}
            className="px-8 py-4 rounded-2xl w-full border"
            style={{ borderColor: colors.border }}
            activeOpacity={0.8}
          >
            <Text
              className="font-semibold text-base text-center"
              style={{ color: colors.textSecondary }}
            >
              Back to Home
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Decorative Elements */}
      <View
        className="absolute top-20 left-10 w-20 h-20 rounded-full"
        style={{ backgroundColor: `${colors.primary}10` }}
      />
      <View
        className="absolute bottom-32 right-8 w-16 h-16 rounded-full"
        style={{ backgroundColor: `${colors.success}10` }}
      />
      <View
        className="absolute top-1/3 right-12 w-12 h-12 rounded-full"
        style={{ backgroundColor: `${colors.primary}15` }}
      />
    </SafeAreaView>
  );
}
