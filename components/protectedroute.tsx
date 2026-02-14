import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../context/Authcontext";
import { ActivityIndicator, View } from "react-native";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "auth";
    const currentPath = segments.join("/");
    const isResetPasswordPage = currentPath === "auth/reset-password";

    if (!user && !inAuthGroup) {
      // Only redirect if not already on the landing page
      if (currentPath !== "/") {
        router.replace("/");
      }
    } else if (user && inAuthGroup) {
      // 🔥 Don't redirect to home if on reset password page
      if (isResetPasswordPage) {
        return;
      }

      // Only redirect if not already on home
      if (currentPath !== "(tabs)/home") {
        router.replace("/(tabs)/home");
      }
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return <>{children}</>;
}
