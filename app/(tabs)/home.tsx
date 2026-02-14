import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  RefreshControl, // Add this import
} from "react-native";
import { supabase } from "../../lib/supabse";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

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
  const [refreshing, setRefreshing] = useState(false); // Add this state
  const [profileCompletion, setProfileCompletion] = useState(0);
  const router = useRouter();

  // Get time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

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
      // 1. Get Auth User
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email ?? "User");

        // 2. Fetch Full Profile from public.users table
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
      <View className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator color="#3B82F6" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6" // iOS spinner color
            colors={["#3B82F6", "#8B5CF6"]} // Android spinner colors
            progressBackgroundColor="#1F2937" // Android background
            title="Pull to refresh" // iOS text
            titleColor="#9CA3AF" // iOS text color
          />
        }
      >
        {/* Header with Avatar and Greeting */}
        <View className="px-6 pt-4 pb-6">
          <View className="flex-row items-center justify-between mb-6">
            {/* Avatar */}
            <View className="flex-row items-center">
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  className="w-14 h-14 rounded-full mr-4"
                />
              ) : (
                <View className="w-14 h-14 rounded-full bg-blue-600 items-center justify-center mr-4">
                  <Ionicons name="person" size={28} color="white" />
                </View>
              )}

              <View>
                <Text className="text-gray-400 text-sm">
                  {getGreeting()} 👋
                </Text>
                {profile?.first_name ? (
                  <Text className="text-white text-xl font-bold mt-1">
                    {profile.first_name}
                  </Text>
                ) : (
                  <Text className="text-white text-xl font-bold mt-1">
                    Welcome
                  </Text>
                )}
              </View>
            </View>

            {/* Notification Icon */}
            <TouchableOpacity className="w-10 h-10 bg-gray-800 rounded-full items-center justify-center">
              <Ionicons name="notifications-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>

          {/* Profile Completion Panel */}
          {profileCompletion < 100 && (
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 mb-4"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-white font-bold text-base mb-1">
                    Complete Your Profile
                  </Text>
                  <Text className="text-blue-100 text-sm">
                    {profileCompletion}% completed
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </View>

              {/* Progress Bar */}
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
            <View className="bg-blue-600 rounded-2xl p-4 flex-1 mr-2">
              <Ionicons name="document-text" size={28} color="white" />
              <Text className="text-white font-bold text-2xl mt-2">24</Text>
              <Text className="text-blue-200 text-sm">Invoices</Text>
            </View>

            <View className="bg-green-600 rounded-2xl p-4 flex-1 ml-2">
              <Ionicons name="receipt" size={28} color="white" />
              <Text className="text-white font-bold text-2xl mt-2">18</Text>
              <Text className="text-green-200 text-sm">Receipts</Text>
            </View>
          </View>
        </View>

        {/* Business Info Card */}
        <View className="px-6 mb-6">
          <Text className="text-white text-lg font-bold mb-3">
            Business Overview
          </Text>
          <View className="bg-gray-800 rounded-2xl p-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="business" size={20} color="#9CA3AF" />
              <Text className="text-gray-400 ml-2 flex-1">Business Name</Text>
              <Text className="text-white font-semibold">
                {profile?.business_name || "Not set"}
              </Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Ionicons name="mail" size={20} color="#9CA3AF" />
              <Text className="text-gray-400 ml-2 flex-1">Email</Text>
              <Text className="text-white font-semibold">
                {profile?.business_email || userEmail}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="call" size={20} color="#9CA3AF" />
              <Text className="text-gray-400 ml-2 flex-1">Phone</Text>
              <Text className="text-white font-semibold">
                {profile?.business_phone || "Not set"}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text className="text-white text-lg font-bold mb-3">
            Quick Actions
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/invoices")}
            className="bg-gray-800 rounded-2xl p-4 flex-row items-center mb-3"
            activeOpacity={0.8}
          >
            <View className="bg-blue-600 rounded-full p-3 mr-4">
              <Ionicons name="add-circle" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">
                Create Invoice
              </Text>
              <Text className="text-gray-400 text-sm">
                Generate a new invoice
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/invoices")}
            className="bg-gray-800 rounded-2xl p-4 flex-row items-center mb-3"
            activeOpacity={0.8}
          >
            <View className="bg-green-600 rounded-full p-3 mr-4">
              <Ionicons name="add-circle" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">
                Create Receipt
              </Text>
              <Text className="text-gray-400 text-sm">
                Generate a new receipt
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/profile")}
            className="bg-gray-800 rounded-2xl p-4 flex-row items-center"
            activeOpacity={0.8}
          >
            <View className="bg-purple-600 rounded-full p-3 mr-4">
              <Ionicons name="person" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">
                Edit Profile
              </Text>
              <Text className="text-gray-400 text-sm">
                Update business details
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <View className="px-6 pb-6">
          <TouchableOpacity
            onPress={handleSignOut}
            className="border border-red-500 rounded-2xl p-4"
            activeOpacity={0.8}
          >
            <Text className="text-red-500 text-center font-bold text-base">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
