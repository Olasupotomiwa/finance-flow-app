// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Platform, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

// Custom Tab Icon Component with Floating Animation
function TabIcon({
  name,
  focused,
  color,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
}) {
  const { colors } = useTheme();

  // Animated styles for the floating effect
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withSpring(focused ? -30 : 0, {
            damping: 15,
            stiffness: 150,
          }),
        },
        {
          scale: withSpring(focused ? 1 : 0.9, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
      opacity: withTiming(focused ? 1 : 0.7, { duration: 200 }),
    };
  });

  const animatedIconContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withSpring(focused ? "360deg" : "0deg", {
            damping: 15,
            stiffness: 100,
          }),
        },
      ],
    };
  });

  if (focused) {
    return (
      <Animated.View
        style={[
          animatedContainerStyle,
          {
            position: "absolute",
            top: -5,
          },
        ]}
      >
        <Animated.View
          style={[
            animatedIconContainerStyle,
            {
              width: 65,
              height: 65,
              borderRadius: 35,
              backgroundColor: colors.primary,
              justifyContent: "center",
              alignItems: "center",
              shadowColor: colors.primary,
              shadowOffset: {
                width: 0,
                height: 8,
              },
              shadowOpacity: 0.6,
              shadowRadius: 12,
              elevation: 15,
            },
          ]}
        >
          <Ionicons name={name} size={32} color="#FFFFFF" />
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Ionicons name={name} size={24} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 95 : 75,
          paddingBottom: Platform.OS === "ios" ? 20 : 16,
          paddingTop: 12,
          paddingHorizontal: 16,
          position: "absolute",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
          marginBottom: 4,
          fontFamily: "appFont",
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
          fontFamily: "appFontBold",
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
            <TabIcon
              name={focused ? "home" : "home-outline"}
              focused={focused}
              color={color}
            />
          ),
        }}
      />

      {/* 2. Invoices Tab */}
      <Tabs.Screen
        name="invoices"
        options={{
          title: "Invoices",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "document-text" : "document-text-outline"}
              focused={focused}
              color={color}
            />
          ),
        }}
      />

      {/* 3. Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "person-circle" : "person-circle-outline"}
              focused={focused}
              color={color}
            />
          ),
        }}
      />

      {/* 4. Settings Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "settings" : "settings-outline"}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
