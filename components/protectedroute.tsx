import { useEffect, useState, useRef } from "react";
import { useRouter, useSegments, useRootNavigationState } from "expo-router";
import { useAuth } from "../context/Authcontext";
import { ActivityIndicator, View } from "react-native";
import { checkIsFirstTime } from "../utils/FirstTimeUser";


export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [checkingFirstTime, setCheckingFirstTime] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);

  const hasRedirected = useRef(false);
  const lastPath = useRef("");

  // Check if user is first time
  useEffect(() => {
    let mounted = true;

    async function checkFirstTimeStatus() {
      const firstTime = await checkIsFirstTime();
      if (mounted) {
        setIsFirstTime(firstTime);
        setCheckingFirstTime(false);
      }
    }

    checkFirstTimeStatus();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // Wait for navigation to be ready
    if (!navigationState?.key) return;

    // Wait for all checks to complete
    if (loading || initializing || checkingFirstTime) return;

    const inAuthGroup = segments[0] === "auth";
    const currentPath = segments.join("/");
    const isResetPasswordPage = currentPath === "auth/reset-password";
    const isOnRoot = !segments[0] || currentPath === "";

    // 🔥 Prevent redirecting to the same path
    if (currentPath === lastPath.current && hasRedirected.current) {
      return;
    }

    // CASE 1: Not authenticated
    if (!user) {
      // Allow reset password page
      if (isResetPasswordPage) return;

      // First time user - show index/landing page
      if (isFirstTime && isOnRoot) {
        hasRedirected.current = false; // 🔥 Reset redirect flag on landing
        return;
      }

      // 🔥 Returning user (not logged in) - redirect to sign in
      if (!isFirstTime && isOnRoot) {
        if (!hasRedirected.current || lastPath.current !== "/auth/signin") {
          hasRedirected.current = true;
          lastPath.current = "/auth/signin";
          router.replace("/auth/signin");
        }
        return;
      }

      // Not logged in and trying to access protected routes - go to sign in
      if (!inAuthGroup && !isOnRoot) {
        if (!hasRedirected.current || lastPath.current !== "/auth/signin") {
          hasRedirected.current = true;
          lastPath.current = "/auth/signin";
          router.replace("/auth/signin");
        }
        return;
      }

      // First time user trying to access auth pages (not root) - show landing page
      if (isFirstTime && inAuthGroup) {
        if (!hasRedirected.current || lastPath.current !== "/") {
          hasRedirected.current = true;
          lastPath.current = "/";
          router.replace("/");
        }
        return;
      }

      // Already on auth pages - allow
      return;
    }

    // CASE 2: Authenticated user
    if (user) {
      // Don't redirect from reset password page
      if (isResetPasswordPage) return;

      // Don't redirect if already on home/tabs
      if (currentPath.startsWith("(tabs)")) {
        hasRedirected.current = false; // Reset for future navigations
        return;
      }

      // Redirect from auth pages or landing page to home
      if (inAuthGroup || isOnRoot) {
        if (!hasRedirected.current || lastPath.current !== "/(tabs)/home") {
          hasRedirected.current = true;
          lastPath.current = "/(tabs)/home";
          router.replace("/(tabs)/home");
        }
        return;
      }
    }
  }, [
    user,
    loading,
    initializing,
    checkingFirstTime,
    isFirstTime,
    segments,
    navigationState,
  ]);

  // Show loading during initial checks
  if (!navigationState?.key || loading || initializing || checkingFirstTime) {
    return <ActivityIndicator size="large" color="#3B82F6" />;
  }

  // Extra check: Don't render index if user is authenticated
  const currentPath = segments.join("/");
  const isOnRoot = !segments[0] || currentPath === "";

  if (user && isOnRoot) {
    return <ActivityIndicator size="large" color="#3B82F6" />;
  }

  return <>{children}</>;
}
     

