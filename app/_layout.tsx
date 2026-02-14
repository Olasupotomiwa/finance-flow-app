import { Stack, useRouter } from "expo-router";
import "../global.css";
import { useFonts } from "expo-font";
import { ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { supabase } from "../lib/supabse";
import { AuthProvider } from "@/context/Authcontext";
import { ProtectedRoute } from "@/components/protectedroute";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider } from "@/context/ThemeContext";

export default function RootLayout() {
  const router = useRouter();
  const [authEvent, setAuthEvent] = useState<string>("INITIAL_LOAD");
  const [hasSession, setHasSession] = useState<boolean>(false);

  const [fontsLoaded] = useFonts({
    appFont: require("../assets/font/BarlowSemiCondensed-Regular.ttf"),
    appFontBold: require("../assets/font/BarlowSemiCondensed-Bold.ttf"),
  });

  // Utility function for delays
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Handle deep links from email confirmation and password reset
  useEffect(() => {
    const handleUrl = async (url: string) => {
      try {
        setAuthEvent("DEEP_LINK_RECEIVED");

        // Small delay to ensure app is fully initialized
        await delay(150);

        const parsedUrl = Linking.parse(url);
        const queryParams = parsedUrl.queryParams;

        // Check if this is a password recovery link (query params)
        if (queryParams?.type === "recovery") {
          setAuthEvent("PASSWORD_RECOVERY");

          setTimeout(() => {
            router.replace("/auth/reset-password");
          }, 100);
          return;
        }

        // Check if URL contains tokens in fragment
        if (url.includes("#")) {
          const [, fragment] = url.split("#");

          if (fragment) {
            const params = new URLSearchParams(fragment);
            const accessToken = params.get("access_token");
            const refreshToken = params.get("refresh_token");
            const type = params.get("type");
            const error = params.get("error");
            const errorDescription = params.get("error_description");

            // Check for errors in the URL from Supabase
            if (error) {
              setAuthEvent(`ERROR: ${error}`);
              Toast.show({
                type: "error",
                text1: "Verification Failed",
                text2: errorDescription || error,
                position: "bottom",
              });
              return;
            }

            // If type is recovery in fragment, store tokens and navigate
            if (type === "recovery" && accessToken && refreshToken) {
              setAuthEvent("PASSWORD_RECOVERY");

              await AsyncStorage.setItem("recovery_access_token", accessToken);
              await AsyncStorage.setItem(
                "recovery_refresh_token",
                refreshToken,
              );

              setTimeout(() => {
                router.replace("/auth/reset-password");
              }, 100);
              return;
            }

            // If type is signup or no type specified, set session (email confirmation)
            if (accessToken && refreshToken && type !== "recovery") {
              setAuthEvent("SETTING_SESSION");

              try {
                // Delay before setting session to ensure Supabase client is ready
                await delay(200);

                const { data, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });

                if (error) throw error;

                if (data.session) {
                  setAuthEvent("SESSION_SET_SUCCESS");

                  // Show email verified toast
                  Toast.show({
                    type: "success",
                    text1: "Email Verified!",
                    text2: "Your email has been successfully confirmed 🎉",
                    position: "bottom",
                  });

                  // Navigate to dashboard after delay
                  setTimeout(() => {
                    router.replace("/(tabs)/home");
                  }, 1500);
                } else {
                  throw new Error("Session was not created");
                }
              } catch (sessionError: any) {
                setAuthEvent(`ERROR: ${sessionError.message}`);

                let errorMessage = "Failed to verify email. Please try again.";

                if (sessionError.message?.includes("Network request failed")) {
                  errorMessage =
                    "Network error. Please check your internet connection and try again.";
                } else if (sessionError.message?.includes("Invalid")) {
                  errorMessage =
                    "Invalid or expired confirmation link. Please request a new one.";
                } else if (sessionError.message) {
                  errorMessage = sessionError.message;
                }

                Toast.show({
                  type: "error",
                  text1: "Verification Failed",
                  text2: errorMessage,
                  position: "bottom",
                });

                setTimeout(() => {
                  router.replace("/auth/signin");
                }, 2000);
              }
            }
          }
        }
      } catch (error: any) {
        Toast.show({
          type: "error",
          text1: "Link Processing Failed",
          text2: error.message || "Failed to process confirmation link",
          position: "bottom",
        });
      }
    };

    const setupListeners = async () => {
      // Small delay to ensure app is fully initialized
      await delay(100);

      // Listen for deep links
      const subscription = Linking.addEventListener("url", (event) => {
        handleUrl(event.url);
      });

      // Check initial URL
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        // Add delay before handling initial URL
        await delay(250);
        handleUrl(initialUrl);
      }

      return subscription;
    };

    let subscription: any;

    setupListeners().then((sub) => {
      subscription = sub;
    });

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Handle auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthEvent(event);
      setHasSession(!!session);

      // Handle password recovery event - don't auto-redirect
      if (event === "PASSWORD_RECOVERY") {
        return;
      }

      if (event === "SIGNED_IN" && session) {
        Toast.show({
          type: "success",
          text1: "Welcome!",
          text2: "You have logged in successfully 👋",
          position: "bottom",
        });
        router.replace("/(tabs)/home");
      }

      if (event === "SIGNED_OUT") {
        router.replace("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!fontsLoaded) {
    return <ActivityIndicator />;
  }

  return (
    <>
      <ThemeProvider>
        <AuthProvider>
          <ProtectedRoute>
            <Stack
              screenOptions={{
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Toast />
          </ProtectedRoute>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}
