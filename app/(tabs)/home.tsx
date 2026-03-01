import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/Authcontext"; //
import { useProfile } from "@/context/profileContext";
import { DashboardHomeSkeleton } from "@/components/Home/skeletonloader";
import { useState } from "react";
import AppHeader from "@/components/Home/header";

export default function Dashboard() {
  const router = useRouter();
  const { colors, effectiveTheme } = useTheme();
  const { user } = useAuth(); // 🔥 Get user from auth context
  const { profile, loading, profileCompletion, refreshProfile } = useProfile(); 
  const [refreshing, setRefreshing] = useState(false);

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshProfile(); // 🔥 Use context refresh
    setRefreshing(false);
  };

  if (loading) {
    return <DashboardHomeSkeleton />; // 🔥 Remove wrapping View
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={effectiveTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* App Header */}
      <AppHeader showAvatar={true} showGreeting={true} profile={profile} />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary, colors.primaryLight]}
            progressBackgroundColor={colors.card}
            title="Pull to refresh"
            titleColor={colors.textSecondary}
          />
        }
      >
        {/* Profile Completion Panel */}
        <View className="px-6">
          {profileCompletion < 100 && (
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: colors.primary }}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-white font-bold text-base mb-1">
                    Complete Your Profile
                  </Text>
                  <Text className="text-white/80 text-sm">
                    {profileCompletion}% completed
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </View>

              <View className="bg-white/20 h-2 rounded-full overflow-hidden">
                <View
                  className="bg-white h-full rounded-full"
                  style={{ width: `${profileCompletion}%` }}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Stats */}
        <View className="px-6 mb-6">
          <View className="flex-row justify-between">
            <View
              className="rounded-2xl p-4 flex-1 mr-2"
              style={{ backgroundColor: colors.primary }}
            >
              <Ionicons name="document-text" size={28} color="white" />
              <Text className="text-white font-bold text-2xl mt-2">24</Text>
              <Text className="text-white/80 text-sm">Invoices</Text>
            </View>

            <View
              className="rounded-2xl p-4 flex-1 ml-2"
              style={{ backgroundColor: colors.success }}
            >
              <Ionicons name="receipt" size={28} color="white" />
              <Text className="text-white font-bold text-2xl mt-2">18</Text>
              <Text className="text-white/80 text-sm">Receipts</Text>
            </View>
          </View>
        </View>

        {/* Business Info Card */}
        <View className="px-6 mb-6">
          <Text
            className="text-lg font-bold mb-3"
            style={{ color: colors.text }}
          >
            Business Overview
          </Text>
          <View
            className="rounded-2xl p-4"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row items-center mb-3">
              <Ionicons name="business" size={20} color={colors.textTertiary} />
              <Text
                className="ml-2 flex-1"
                style={{ color: colors.textSecondary }}
              >
                Business Name
              </Text>
              <Text className="font-semibold" style={{ color: colors.text }}>
                {profile?.business_name || "Not set"}
              </Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Ionicons name="mail" size={20} color={colors.textTertiary} />
              <Text
                className="ml-2 flex-1"
                style={{ color: colors.textSecondary }}
              >
                Email
              </Text>
              <Text className="font-semibold" style={{ color: colors.text }}>
                {/* 🔥 Use profile email or fallback to auth user email */}
                {profile?.business_email || user?.email || "Not set"}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="call" size={20} color={colors.textTertiary} />
              <Text
                className="ml-2 flex-1"
                style={{ color: colors.textSecondary }}
              >
                Phone
              </Text>
              <Text className="font-semibold" style={{ color: colors.text }}>
                {profile?.business_phone || "Not set"}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text
            className="text-lg font-bold mb-3"
            style={{ color: colors.text }}
          >
            Quick Actions
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/invoices")}
            className="rounded-2xl p-4 flex-row items-center mb-3"
            style={{ backgroundColor: colors.card }}
            activeOpacity={0.8}
          >
            <View
              className="rounded-full p-3 mr-4"
              style={{ backgroundColor: colors.primary }}
            >
              <Ionicons name="add-circle" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text
                className="font-bold text-base"
                style={{ color: colors.text }}
              >
                Create Invoice
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Generate a new invoice
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/invoices")}
            className="rounded-2xl p-4 flex-row items-center mb-3"
            style={{ backgroundColor: colors.card }}
            activeOpacity={0.8}
          >
            <View
              className="rounded-full p-3 mr-4"
              style={{ backgroundColor: colors.success }}
            >
              <Ionicons name="add-circle" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text
                className="font-bold text-base"
                style={{ color: colors.text }}
              >
                Create Receipt
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Generate a new receipt
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/profile")}
            className="rounded-2xl p-4 flex-row items-center"
            style={{ backgroundColor: colors.card }}
            activeOpacity={0.8}
          >
            <View
              className="rounded-full p-3 mr-4"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <Ionicons name="person" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text
                className="font-bold text-base"
                style={{ color: colors.text }}
              >
                Edit Profile
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Update business details
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
