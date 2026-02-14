// app/(tabs)/settings.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import ThemeSelector from "@/components/ThemeSelector";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabse";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const { colors, effectiveTheme } = useTheme();
 const router = useRouter();
   const handleSignOut = async () => {
     await supabase.auth.signOut();
     router.replace("/auth/signin");
   };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={effectiveTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <ScrollView className="flex-1 px-6">
        {/* Header */}
        <View className="py-6">
          <Text
            className="text-3xl font-appFontBold"
            style={{ color: colors.text }}
          >
            Settings
          </Text>
        </View>

        {/* Appearance Section */}
        <View className="py-4">
          <Text
            className="text-lg font-appFontBold mb-3"
            style={{ color: colors.text }}
          >
            Appearance
          </Text>

          <ThemeSelector />
        </View>

        {/* General Settings */}
        <View className="py-4">
          <Text
            className="text-lg font-appFontBold mb-3"
            style={{ color: colors.text }}
          >
            General
          </Text>

          <View
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: colors.card }}
          >
            <SettingItem
              icon="notifications"
              label="Notifications"
              rightElement={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={notifications ? "#fff" : colors.textTertiary}
                />
              }
            />
            <SettingItem
              icon="language"
              label="Language"
              value="English"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Account Settings */}
        <View className="py-4">
          <Text
            className="text-lg font-appFontBold mb-3"
            style={{ color: colors.text }}
          >
            Account
          </Text>

          <View
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: colors.card }}
          >
            <SettingItem
              icon="lock-closed"
              label="Change Password"
              onPress={() => {}}
            />
            <SettingItem
              icon="shield-checkmark"
              label="Privacy"
              onPress={() => {}}
            />
            <SettingItem
              icon="help-circle"
              label="Help & Support"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* About */}
        <View className="py-4">
          <Text
            className="text-lg font-appFontBold mb-3"
            style={{ color: colors.text }}
          >
            About
          </Text>

          <View
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: colors.card }}
          >
            <SettingItem
              icon="information-circle"
              label="Version"
              value="1.0.0"
            />
            <SettingItem
              icon="document-text"
              label="Terms & Conditions"
              onPress={() => {}}
            />
            <SettingItem
              icon="shield"
              label="Privacy Policy"
              onPress={() => {}}
            />
          </View>
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

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingItem({
  icon,
  label,
  value,
  onPress,
  rightElement,
}: SettingItemProps) {
  const { colors } = useTheme();

  const content = (
    <View
      className="flex-row items-center justify-between py-4 px-4 border-b last:border-b-0"
      style={{ borderColor: colors.border }}
    >
      <View className="flex-row items-center flex-1">
        <Ionicons name={icon} size={22} color={colors.textTertiary} />
        <Text
          className="font-appFont text-base ml-3"
          style={{ color: colors.text }}
        >
          {label}
        </Text>
      </View>
      {rightElement || (
        <View className="flex-row items-center">
          {value && (
            <Text
              className="font-appFont mr-2"
              style={{ color: colors.textSecondary }}
            >
              {value}
            </Text>
          )}
          {onPress && (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textTertiary}
            />
          )}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
