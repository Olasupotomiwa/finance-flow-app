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

  // Handle deep links from email confirmation and password reset
 useEffect(() => {
   const handleUrl = async (url: string) => {
     console.log("=== DEEP LINK RECEIVED ===");
     console.log("URL:", url);

     setAuthEvent("DEEP_LINK_RECEIVED");

     const parsedUrl = Linking.parse(url);
     const queryParams = parsedUrl.queryParams;

     console.log("Query Params:", queryParams);

     // Check if this is a password recovery link (query params)
     if (queryParams?.type === "recovery") {
       console.log("✅ Password recovery link detected (query params)");
       setAuthEvent("PASSWORD_RECOVERY");

       // Navigate to reset password page
       setTimeout(() => {
         router.replace("/auth/reset-password");
       }, 100);
       return;
     }

     // Check if URL contains tokens in fragment
     if (url.includes("#")) {
       const [, fragment] = url.split("#");
       console.log("Fragment:", fragment);

       if (fragment) {
         const params = new URLSearchParams(fragment);
         const accessToken = params.get("access_token");
         const refreshToken = params.get("refresh_token");
         const type = params.get("type");

         // If type is recovery in fragment, set session with tokens then navigate
         if (type === "recovery" && accessToken && refreshToken) {
         
           setAuthEvent("PASSWORD_RECOVERY");

           // Store tokens temporarily - DO NOT call setSession
           await AsyncStorage.setItem("recovery_access_token", accessToken);
           await AsyncStorage.setItem("recovery_refresh_token", refreshToken);

           setTimeout(() => {
             router.replace("/auth/reset-password");
           }, 100);
           return;
         }

         // If type is signup or no type specified, set session (email confirmation)
         if (accessToken && refreshToken && type !== "recovery") {
          
           setAuthEvent("SETTING_SESSION");

           const { data, error } = await supabase.auth.setSession({
             access_token: accessToken,
             refresh_token: refreshToken,
           });

         

           if (error) {
             setAuthEvent(`ERROR: ${error.message}`);
             Toast.show({
               type: "error",
               text1: "Verification Failed",
               text2: error.message,
               position: "top",
             });
           } else if (data.session) {
             setAuthEvent("SESSION_SET_SUCCESS");

             // Show email verified toast immediately when session is set
             Toast.show({
               type: "success",
               text1: " Email Verified!",
               text2: "Your email has been successfully confirmed 🎉",
               position: "top",
             });

             // Navigate to dashboard after short delay
             setTimeout(() => {
               router.replace("/(tabs)/home");
             }, 1500);
           }
         }
       }
     }
   };

   // Listen for deep links
   const subscription = Linking.addEventListener("url", (event) => {
     console.log("URL Event Listener Triggered");
     handleUrl(event.url);
   });

   // Check initial URL
   Linking.getInitialURL().then((url) => {
     if (url) {
       console.log("Initial URL Found:", url);
       handleUrl(url);
     } else {
       console.log("No Initial URL");
     }
   });

   return () => {
     subscription.remove();
   };
 }, []);

  // Handle auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Update state to show on screen
      setAuthEvent(event);
      setHasSession(!!session);

      console.log("🔄 Auth event:", event);

      // Handle password recovery event - don't auto-redirect
      if (event === "PASSWORD_RECOVERY") {
        console.log("🔑 Password recovery event detected");
        // Don't show toast or redirect - let the reset password page handle it
        return;
      }

      if (event === "SIGNED_IN" && session) {
        Toast.show({
          type: "success",
          text1: "Welcome!",
          text2: "You have logged in successfully 👋",
          position: "top",
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
