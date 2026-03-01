import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/context/Authcontext";
import { ActivityIndicator, View } from "react-native";

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // If authenticated, redirect to home
  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
