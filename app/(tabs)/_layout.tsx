// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: {
          backgroundColor: "#111827",
          borderTopColor: "#1F2937",
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 95 : 75, 
          paddingBottom: Platform.OS === "ios" ? 20 : 16, 
          paddingTop: 12,
          paddingHorizontal: 16,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
          marginBottom: 4,
          fontFamily: "appFont", // Added font family
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: "#111827",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
          fontFamily: "appFontBold", // Added font family
        },
        headerShown: false,
      }}
    >
      {/* 1. Home Tab */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={28}
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* 2. Invoices Tab */}
      <Tabs.Screen
        name="invoices"
        options={{
          title: "Invoices",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Ionicons
                name={focused ? "document-text" : "document-text-outline"}
                size={28}
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* 3. Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Ionicons
                name={focused ? "person-circle" : "person-circle-outline"}
                size={28}
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* 4. Settings Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={28}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
