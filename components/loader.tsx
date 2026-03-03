import React, { useEffect, useRef } from "react";
import {
  View,
  Image,
  Animated,
  Text,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");

export default function LoadingScreen() {
  const { colors, effectiveTheme } = useTheme();
  const isDark = effectiveTheme === "dark";

  // Logo animations
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoGlow = useRef(new Animated.Value(0)).current;

  // Text animations
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(16)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  // Progress bar
  const progressWidth = useRef(new Animated.Value(0)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;

  // Dots
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  // Floating particles
  const particle1Y = useRef(new Animated.Value(0)).current;
  const particle2Y = useRef(new Animated.Value(0)).current;
  const particle3Y = useRef(new Animated.Value(0)).current;
  const particleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // 2. Glow pulse loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoGlow, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(logoGlow, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // 3. Title slides up
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // 4. Subtitle fades in
      setTimeout(() => {
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }, 300);

      // 5. Progress bar
      setTimeout(() => {
        Animated.timing(progressOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
        Animated.timing(progressWidth, {
          toValue: width * 0.55,
          duration: 2200,
          useNativeDriver: false,
        }).start();
      }, 500);

      // 6. Bouncing dots
      setTimeout(() => {
        const dotAnim = (dot: Animated.Value, delay: number) =>
          Animated.loop(
            Animated.sequence([
              Animated.delay(delay),
              Animated.timing(dot, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(dot, {
                toValue: 0.3,
                duration: 400,
                useNativeDriver: true,
              }),
            ]),
          );
        dotAnim(dot1, 0).start();
        dotAnim(dot2, 180).start();
        dotAnim(dot3, 360).start();
      }, 800);

      // 7. Floating particles
      setTimeout(() => {
        Animated.timing(particleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();

        const floatAnim = (
          val: Animated.Value,
          range: number,
          duration: number,
        ) =>
          Animated.loop(
            Animated.sequence([
              Animated.timing(val, {
                toValue: -range,
                duration,
                useNativeDriver: true,
              }),
              Animated.timing(val, {
                toValue: range,
                duration,
                useNativeDriver: true,
              }),
            ]),
          );

        floatAnim(particle1Y, 12, 2200).start();
        floatAnim(particle2Y, 8, 1800).start();
        floatAnim(particle3Y, 16, 2600).start();
      }, 1000);
    });
  }, []);

  const glowScale = logoGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const glowOpacity = logoGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [isDark ? 0.15 : 0.08, isDark ? 0.35 : 0.18],
  });

  const particles = [
    {
      y: particle1Y,
      size: 8,
      opacity: 0.4,
      top: "20%",
      left: "15%",
      right: undefined,
      bottom: undefined,
    },
    {
      y: particle2Y,
      size: 5,
      opacity: 0.3,
      top: "30%",
      right: "12%",
      left: undefined,
      bottom: undefined,
    },
    {
      y: particle3Y,
      size: 6,
      opacity: 0.25,
      bottom: "28%",
      left: "20%",
      top: undefined,
      right: undefined,
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        {/* Floating particles */}
        {particles.map((p, i) => (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              top: p.top as any,
              left: p.left as any,
              right: p.right as any,
              bottom: p.bottom as any,
              opacity: particleOpacity,
              transform: [{ translateY: p.y }],
            }}
          >
            <View
              style={{
                width: p.size,
                height: p.size,
                borderRadius: p.size / 2,
                backgroundColor: colors.primary,
                opacity: p.opacity,
              }}
            />
          </Animated.View>
        ))}

        {/* Glow ring behind logo */}
        <Animated.View
          style={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: colors.primary,
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          }}
        />

        {/* Logo */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
            marginBottom: 32,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: isDark ? 0.5 : 0.2,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          <Image
            source={require("@/assets/finance-logo.png")}
            style={{
              width: 120,
              height: 120,
              borderRadius: 28,
            }}
            resizeMode="contain"
          />
        </Animated.View>

        {/* App name */}
        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleY }],
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: "800",
              color: colors.text,
              letterSpacing: 0.5,
              fontFamily: "appFontBold",
            }}
          >
            Finance
          </Text>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "800",
              color: colors.primary,
              letterSpacing: 0.5,
              fontFamily: "appFontBold",
            }}
          >
            {" "}
            Flow
          </Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text
          style={{
            opacity: subtitleOpacity,
            fontSize: 12,
            color: colors.textSecondary,
            letterSpacing: 1.8,
            textTransform: "uppercase",
            marginBottom: 52,
            fontFamily: "appFont",
          }}
        >
          Invoices · Receipts · Growth
        </Animated.Text>

        {/* Progress bar track */}
        <Animated.View
          style={{
            opacity: progressOpacity,
            width: width * 0.55,
            height: 4,
            backgroundColor: colors.border,
            borderRadius: 99,
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          <Animated.View
            style={{
              height: "100%",
              width: progressWidth,
              backgroundColor: colors.primary,
              borderRadius: 99,
            }}
          />
        </Animated.View>

        {/* Loading dots */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: colors.primary,
                opacity: dot,
              }}
            />
          ))}
        </View>
      </View>

      {/* Bottom credit */}
      <Animated.View
        style={{
          opacity: subtitleOpacity,
          alignItems: "center",
          paddingBottom: 32,
        }}
      >
        <Text
          style={{
            color: colors.textTertiary,
            fontSize: 12,
            letterSpacing: 0.5,
            fontFamily: "appFont",
          }}
        >
          Built for Nigerian businesses
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}
