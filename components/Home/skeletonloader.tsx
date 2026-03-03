import React, { useEffect, useRef } from "react";
import { View, Animated, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

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
      style={[{ width, height, borderRadius, backgroundColor }, style]}
    />
  );
}

export function DashboardHomeSkeleton() {
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
      {/* Status bar space is handled by SafeAreaView */}
      <StatusBar
        barStyle={effectiveTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* App Header Skeleton */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingVertical: 16,
          backgroundColor: colors.background,
        }}
      >
        {/* Greeting + name */}
        <View style={{ gap: 6 }}>
          <S width={100} height={13} borderRadius={6} />
          <S width={160} height={20} borderRadius={6} />
        </View>
        {/* Avatar */}
        <S width={44} height={44} borderRadius={22} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 24 }}>
          {/* Profile Completion Banner */}
          <S
            width="100%"
            height={90}
            borderRadius={16}
            style={{ marginBottom: 24 }}
          />

          {/* Quick Stats Row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <S width="48%" height={110} borderRadius={16} />
            <S width="48%" height={110} borderRadius={16} />
          </View>

          {/* Business Overview */}
          <S
            width={160}
            height={18}
            borderRadius={6}
            style={{ marginBottom: 12 }}
          />
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              gap: 18,
            }}
          >
            {[1, 2, 3].map((_, i) => (
              <View
                key={i}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                {/* Icon */}
                <S
                  width={20}
                  height={20}
                  borderRadius={6}
                  style={{ marginRight: 8 }}
                />
                {/* Label */}
                <S
                  width={80}
                  height={13}
                  borderRadius={6}
                  style={{ flex: 1 }}
                />
                {/* Value */}
                <S width={100} height={13} borderRadius={6} />
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <S
            width={120}
            height={18}
            borderRadius={6}
            style={{ marginBottom: 12 }}
          />
          <View style={{ gap: 12, marginBottom: 32 }}>
            {[1, 2, 3].map((_, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {/* Icon circle */}
                <S
                  width={48}
                  height={48}
                  borderRadius={24}
                  style={{ marginRight: 16 }}
                />
                {/* Title + subtitle */}
                <View style={{ flex: 1, gap: 6 }}>
                  <S width={120} height={15} borderRadius={6} />
                  <S width={160} height={12} borderRadius={6} />
                </View>
                {/* Chevron */}
                <S width={20} height={20} borderRadius={6} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
