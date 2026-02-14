import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  StatusBar,
} from "react-native";
import { supabase } from "../../lib/supabse";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import AppHeader from "@/components/Home/header";

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  business_email: string | null;
  business_phone: string | null;
  street_address: string | null;
  state: string | null;
  lga: string | null;
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  avatar_url: string | null;
}

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const router = useRouter();
  const { colors, effectiveTheme } = useTheme();

  // Calculate profile completion percentage
  const calculateProfileCompletion = (profile: UserProfile | null) => {
    if (!profile) return 0;

    const fields = [
      profile.first_name,
      profile.last_name,
      profile.business_name,
      profile.business_email,
      profile.business_phone,
      profile.street_address,
      profile.state,
      profile.lga,
      profile.bank_name,
      profile.account_name,
      profile.account_number,
    ];

    const filledFields = fields.filter(
      (field) => field && field.trim() !== "",
    ).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  // Load data function (extracted for reuse)
  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email ?? "User");

        const { data: profileData } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          const completion = calculateProfileCompletion(profileData);
          setProfileCompletion(completion);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    async function initialLoad() {
      await loadData();
      setLoading(false);
    }
    initialLoad();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={effectiveTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* App Header - Will show on all screens */}
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
                {profile?.business_email || userEmail}
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

        {/* Sign Out Button */}
        <View className="px-6 pb-6">
          <TouchableOpacity
            onPress={handleSignOut}
            className="border rounded-2xl p-4"
            style={{ borderColor: colors.error }}
            activeOpacity={0.8}
          >
            <Text
              className="text-center font-bold text-base"
              style={{ color: colors.error }}
            >
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
