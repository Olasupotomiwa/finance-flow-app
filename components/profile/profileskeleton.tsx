import React, { useEffect, useRef } from "react";
import { View, Animated, ScrollView, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

// Single animated shimmer block
function SkeletonBlock({
  width,
  height,
  borderRadius = 8,
  style,
  shimmerValue,
  colors,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
  shimmerValue: Animated.Value;
  colors: any;
}) {
  const backgroundColor = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.card],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}

export function ProfileSkeleton() {
  const { colors, effectiveTheme } = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, []);

  const S = (
    props: Omit<Parameters<typeof SkeletonBlock>[0], "shimmerValue" | "colors">,
  ) => <SkeletonBlock {...props} shimmerValue={shimmer} colors={colors} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={effectiveTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.background,
        }}
      >
        <S
          width={40}
          height={40}
          borderRadius={20}
          style={{ marginRight: 12 }}
        />
        <View style={{ flex: 1, gap: 6 }}>
          <S width={120} height={18} borderRadius={6} />
          <S width={80} height={13} borderRadius={6} />
        </View>
        <S width={40} height={40} borderRadius={20} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 24 }}>
          {/* Avatar Section */}
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 24,
              marginBottom: 20,
              alignItems: "center",
            }}
          >
            {/* Avatar circle */}
            <View style={{ position: "relative", marginBottom: 14 }}>
              <S width={100} height={100} borderRadius={50} />
              {/* Camera button */}
              <S
                width={36}
                height={36}
                borderRadius={18}
                style={{ position: "absolute", bottom: 0, right: 0 }}
              />
            </View>

            {/* Name */}
            <S
              width={160}
              height={20}
              borderRadius={6}
              style={{ marginBottom: 8 }}
            />
            {/* Email */}
            <S width={200} height={14} borderRadius={6} />
          </View>

          {/* Personal Information Card */}
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 24,
              marginBottom: 20,
            }}
          >
            {/* Section header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <S
                width={40}
                height={40}
                borderRadius={12}
                style={{ marginRight: 12 }}
              />
              <S width={160} height={18} borderRadius={6} />
            </View>

            {/* First Name field */}
            <S
              width={80}
              height={13}
              borderRadius={6}
              style={{ marginBottom: 8 }}
            />
            <S
              width="100%"
              height={52}
              borderRadius={12}
              style={{ marginBottom: 16 }}
            />

            {/* Last Name field */}
            <S
              width={80}
              height={13}
              borderRadius={6}
              style={{ marginBottom: 8 }}
            />
            <S
              width="100%"
              height={52}
              borderRadius={12}
              style={{ marginBottom: 16 }}
            />

            {/* Email field */}
            <S
              width={50}
              height={13}
              borderRadius={6}
              style={{ marginBottom: 8 }}
            />
            <S
              width="100%"
              height={52}
              borderRadius={12}
              style={{ marginBottom: 16 }}
            />

            {/* Phone field */}
            <S
              width={110}
              height={13}
              borderRadius={6}
              style={{ marginBottom: 8 }}
            />
            <S width="100%" height={52} borderRadius={12} />
          </View>

          {/* Save Button */}
          <S
            width="100%"
            height={54}
            borderRadius={14}
            style={{ marginBottom: 24 }}
          />

          {/* Nav Items Card */}
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              paddingHorizontal: 20,
              paddingVertical: 8,
              marginBottom: 20,
            }}
          >
            {[1, 2, 3].map((_, i) => (
              <View key={i}>
                {i > 0 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: colors.border,
                      marginVertical: 4,
                    }}
                  />
                )}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 14,
                  }}
                >
                  <S
                    width={40}
                    height={40}
                    borderRadius={12}
                    style={{ marginRight: 12 }}
                  />
                  <View style={{ flex: 1, gap: 6 }}>
                    <S width={120} height={15} borderRadius={6} />
                    <S width={180} height={12} borderRadius={6} />
                  </View>
                  <S width={20} height={20} borderRadius={6} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
