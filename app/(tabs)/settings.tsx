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
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import AppHeader from "@/components/Home/header";
import ThemeSelector from "@/components/ThemeSelector";
import ChangePasswordModal from "@/components/Settings/ChangePasswordModal";
import SignOutModal from "@/components/Settings/SignOutModal";
import DeleteAccountModal from "@/components/Settings/DeleteAccountModal";
import SettingItem from "@/components/Settings/SettingItem";
import ProfileNavItem from "@/components/Settings/ProfileNavItem";

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const { colors, effectiveTheme } = useTheme();
  const router = useRouter();

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={effectiveTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <AppHeader showAvatar={false} showGreeting={false} title="Settings" />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        

        {/* Configuration */}
        <View className="py-4">
          <Text
            className="text-lg font-appFontBold mb-3"
            style={{ color: colors.text }}
          >
            Configuration
          </Text>
          <View
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: colors.card }}
          >
            <ProfileNavItem
              icon="business"
              iconColor="#3B82F6"
              title="Business Information"
              subtitle="Update your business details & address"
              onPress={() => router.push("/profile/business-info")}
            />
            <ProfileNavItem
              icon="document-text"
              iconColor="#10B981"
              title="Invoice Template"
              subtitle="Customize your invoice layout & design"
              onPress={() => router.push("/profile/invoice-template")}
              showBorder
            />
            <ProfileNavItem
              icon="receipt"
              iconColor="#F59E0B"
              title="Receipt Configuration"
              subtitle="Configure your receipt settings & format"
              onPress={() => router.push("/profile/receipt-template")}
              showBorder
            />
          </View>
        </View>

        {/* General */}
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
              subtitle="Manage push notifications"
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
              subtitle="Change app language"
              value="English"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Account */}
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
              subtitle="Update your account password"
              onPress={() => setShowPasswordModal(true)}
            />
            <SettingItem
              icon="shield-checkmark"
              label="Privacy"
              subtitle="Manage your privacy settings"
              onPress={() => {}}
            />
            <SettingItem
              icon="help-circle"
              label="Help & Support"
              subtitle="Get help or contact support"
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
              subtitle="Current app version"
              value="1.0.0"
            />
            <SettingItem
              icon="document-text"
              label="Terms & Conditions"
              subtitle="Read our terms of service"
              onPress={() => {}}
            />
            <SettingItem
              icon="shield"
              label="Privacy Policy"
              subtitle="Read our privacy policy"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View className="py-4">
          <Text
            className="text-lg font-appFontBold mb-3"
            style={{ color: colors.error }}
          >
            Danger Zone
          </Text>

          {/* Delete Account */}
          <View
            className="rounded-2xl overflow-hidden mb-4"
            style={{ backgroundColor: colors.card }}
          >
            <TouchableOpacity
              onPress={() => setShowDeleteModal(true)}
              activeOpacity={0.8}
              className="flex-row items-center px-4 py-4"
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: `${colors.error}20` }}
              >
                <Ionicons name="person-remove" size={20} color={colors.error} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-appFontBold"
                  style={{ color: colors.error }}
                >
                  Delete Account
                </Text>
                <Text
                  className="text-sm font-appFont mt-0.5"
                  style={{ color: colors.textSecondary }}
                >
                  Permanently delete your account and all data
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>

          {/* Sign Out */}
          <TouchableOpacity
            onPress={() => setShowSignOutModal(true)}
            className="rounded-2xl p-4 flex-row items-center justify-center mb-24"
            style={{
              backgroundColor: `${colors.error}15`,
              borderWidth: 1.5,
              borderColor: colors.error,
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
            <Text
              className="font-appFontBold text-base ml-2"
              style={{ color: colors.error }}
            >
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      <ChangePasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
      <SignOutModal
        visible={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
      />
      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </SafeAreaView>
  );
}
