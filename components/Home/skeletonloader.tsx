import { View, Animated, ScrollView } from "react-native";
import { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

export function SkeletonLoader({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps) {
  const { colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border || "#E5E7EB",
          opacity,
        },
        style,
      ]}
    />
  );
}

// Card Skeleton for common use cases
export function SkeletonCard() {
  const { colors } = useTheme();

  return (
    <View
      className="p-4 rounded-2xl mb-4"
      style={{ backgroundColor: colors.card }}
    >
      <View className="flex-row items-center mb-3">
        <SkeletonLoader width={48} height={48} borderRadius={24} />
        <View className="ml-3 flex-1">
          <SkeletonLoader width="60%" height={16} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="40%" height={12} />
        </View>
      </View>
      <SkeletonLoader width="100%" height={12} style={{ marginBottom: 6 }} />
      <SkeletonLoader width="80%" height={12} />
    </View>
  );
}

// List Skeleton
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View>
      {[...Array(count)].map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
}

// Full Screen Skeleton
export function SkeletonFullScreen() {
  const { colors } = useTheme();

  return (
    <View className="flex-1 p-6" style={{ backgroundColor: colors.background }}>
      {/* Header Skeleton */}
      <View className="mb-6">
        <SkeletonLoader width="70%" height={32} style={{ marginBottom: 12 }} />
        <SkeletonLoader width="50%" height={16} />
      </View>

      {/* Content Skeleton */}
      <SkeletonList count={5} />
    </View>
  );
}

// Dashboard Skeleton
export function DashboardSkeleton() {
  const { colors } = useTheme();
  return (
    <View className="flex-1 p-6" style={{ backgroundColor: colors.background }}>
      {/* Stats Cards */}
      <View className="flex-row justify-between mb-6">
        <View className="flex-1 mr-2">
          <SkeletonLoader width="100%" height={100} borderRadius={16} />
        </View>
        <View className="flex-1 ml-2">
          <SkeletonLoader width="100%" height={100} borderRadius={16} />
        </View>
      </View>
      {/* Chart */}
      <SkeletonLoader
        width="100%"
        height={200}
        borderRadius={16}
        style={{ marginBottom: 24 }}
      />
      {/* Recent Items */}
      <SkeletonLoader width={150} height={24} style={{ marginBottom: 16 }} />
      <SkeletonList count={3} />
    </View>
  );
}

// Invoice List Skeleton
export function InvoiceListSkeleton() {
  const { colors } = useTheme();
  return (
    <View className="flex-1 p-6" style={{ backgroundColor: colors.background }}>
      <View className="flex-row justify-between items-center mb-6">
        <SkeletonLoader width={120} height={32} />
        <SkeletonLoader width={100} height={40} borderRadius={20} />
      </View>
      {[...Array(6)].map((_, index) => (
        <View
          key={index}
          className="p-4 rounded-2xl mb-3"
          style={{ backgroundColor: colors.card }}
        >
          <View className="flex-row justify-between items-start mb-2">
            <SkeletonLoader width="40%" height={20} />
            <SkeletonLoader width={80} height={24} borderRadius={12} />
          </View>
          <SkeletonLoader width="60%" height={14} style={{ marginBottom: 8 }} />
          <View className="flex-row justify-between">
            <SkeletonLoader width={100} height={14} />
            <SkeletonLoader width={80} height={14} />
          </View>
        </View>
      ))}
    </View>
  );
}

// Login Page Skeleton
export function AuthSkeleton() {
  const { colors } = useTheme();
  return (
    <View
      className="flex-1 justify-center items-center px-6"
      style={{ backgroundColor: colors.background }}
    >
      <SkeletonLoader
        width={80}
        height={80}
        borderRadius={40}
        style={{ marginBottom: 24 }}
      />
      <SkeletonLoader width="70%" height={32} style={{ marginBottom: 12 }} />
      <SkeletonLoader width="50%" height={16} style={{ marginBottom: 40 }} />

      <SkeletonLoader
        width="100%"
        height={56}
        borderRadius={28}
        style={{ marginBottom: 16 }}
      />
      <SkeletonLoader
        width="100%"
        height={56}
        borderRadius={28}
        style={{ marginBottom: 16 }}
      />
      <SkeletonLoader width="100%" height={56} borderRadius={28} />
    </View>
  );
}

// Dashboard Home Skeleton - Matches your home screen exactly
export function DashboardHomeSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header Skeleton */}
      <View className="px-6 pt-4 pb-3 flex-row justify-between items-center">
        <View>
          <SkeletonLoader width={150} height={24} style={{ marginBottom: 8 }} />
          <SkeletonLoader width={100} height={16} />
        </View>
        <SkeletonLoader width={48} height={48} borderRadius={24} />
      </View>

      <ScrollView className="flex-1">
        {/* Profile Completion Panel Skeleton */}
        <View className="px-6 mb-4">
          <View
            className="rounded-2xl p-4"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-1">
                <SkeletonLoader
                  width={160}
                  height={16}
                  style={{ marginBottom: 8 }}
                />
                <SkeletonLoader width={100} height={14} />
              </View>
              <SkeletonLoader width={20} height={20} borderRadius={10} />
            </View>
            <SkeletonLoader width="100%" height={8} borderRadius={4} />
          </View>
        </View>

        {/* Quick Stats Skeleton */}
        <View className="px-6 mb-6">
          <View className="flex-row justify-between">
            <View
              className="rounded-2xl p-4 flex-1 mr-2"
              style={{ backgroundColor: colors.card }}
            >
              <SkeletonLoader
                width={28}
                height={28}
                borderRadius={14}
                style={{ marginBottom: 8 }}
              />
              <SkeletonLoader
                width={50}
                height={28}
                style={{ marginBottom: 8 }}
              />
              <SkeletonLoader width={70} height={14} />
            </View>

            <View
              className="rounded-2xl p-4 flex-1 ml-2"
              style={{ backgroundColor: colors.card }}
            >
              <SkeletonLoader
                width={28}
                height={28}
                borderRadius={14}
                style={{ marginBottom: 8 }}
              />
              <SkeletonLoader
                width={50}
                height={28}
                style={{ marginBottom: 8 }}
              />
              <SkeletonLoader width={70} height={14} />
            </View>
          </View>
        </View>

        {/* Business Info Card Skeleton */}
        <View className="px-6 mb-6">
          <SkeletonLoader
            width={150}
            height={18}
            style={{ marginBottom: 12 }}
          />
          <View
            className="rounded-2xl p-4"
            style={{ backgroundColor: colors.card }}
          >
            {/* Business Name Row */}
            <View className="flex-row items-center mb-3">
              <SkeletonLoader width={20} height={20} borderRadius={10} />
              <View className="flex-1 ml-2">
                <SkeletonLoader width={100} height={14} />
              </View>
              <SkeletonLoader width={80} height={14} />
            </View>

            {/* Email Row */}
            <View className="flex-row items-center mb-3">
              <SkeletonLoader width={20} height={20} borderRadius={10} />
              <View className="flex-1 ml-2">
                <SkeletonLoader width={50} height={14} />
              </View>
              <SkeletonLoader width={120} height={14} />
            </View>

            {/* Phone Row */}
            <View className="flex-row items-center">
              <SkeletonLoader width={20} height={20} borderRadius={10} />
              <View className="flex-1 ml-2">
                <SkeletonLoader width={60} height={14} />
              </View>
              <SkeletonLoader width={100} height={14} />
            </View>
          </View>
        </View>

        {/* Quick Actions Skeleton */}
        <View className="px-6 mb-6">
          <SkeletonLoader
            width={120}
            height={18}
            style={{ marginBottom: 12 }}
          />

          {/* Create Invoice Action */}
          <View
            className="rounded-2xl p-4 flex-row items-center mb-3"
            style={{ backgroundColor: colors.card }}
          >
            <SkeletonLoader
              width={48}
              height={48}
              borderRadius={24}
              style={{ marginRight: 16 }}
            />
            <View className="flex-1">
              <SkeletonLoader
                width={120}
                height={16}
                style={{ marginBottom: 6 }}
              />
              <SkeletonLoader width={150} height={14} />
            </View>
            <SkeletonLoader width={20} height={20} borderRadius={10} />
          </View>

          {/* Create Receipt Action */}
          <View
            className="rounded-2xl p-4 flex-row items-center mb-3"
            style={{ backgroundColor: colors.card }}
          >
            <SkeletonLoader
              width={48}
              height={48}
              borderRadius={24}
              style={{ marginRight: 16 }}
            />
            <View className="flex-1">
              <SkeletonLoader
                width={120}
                height={16}
                style={{ marginBottom: 6 }}
              />
              <SkeletonLoader width={150} height={14} />
            </View>
            <SkeletonLoader width={20} height={20} borderRadius={10} />
          </View>

          {/* Edit Profile Action */}
          <View
            className="rounded-2xl p-4 flex-row items-center"
            style={{ backgroundColor: colors.card }}
          >
            <SkeletonLoader
              width={48}
              height={48}
              borderRadius={24}
              style={{ marginRight: 16 }}
            />
            <View className="flex-1">
              <SkeletonLoader
                width={100}
                height={16}
                style={{ marginBottom: 6 }}
              />
              <SkeletonLoader width={140} height={14} />
            </View>
            <SkeletonLoader width={20} height={20} borderRadius={10} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
