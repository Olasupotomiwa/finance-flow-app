// app/(tabs)/settings.tsx
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView className="flex-1 px-6">
        {/* General Settings */}
        <View className="py-4">
          <Text className="text-lg font-appFontBold text-white mb-3">
            General
          </Text>

          <View className="bg-gray-800 rounded-2xl">
            <SettingItem
              icon="notifications"
              label="Notifications"
              rightElement={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: '#374151', true: '#3B82F6' }}
                  thumbColor={notifications ? '#fff' : '#9CA3AF'}
                />
              }
            />
            <SettingItem
              icon="moon"
              label="Dark Mode"
              rightElement={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: '#374151', true: '#3B82F6' }}
                  thumbColor={darkMode ? '#fff' : '#9CA3AF'}
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
          <Text className="text-lg font-appFontBold text-white mb-3">
            Account
          </Text>

          <View className="bg-gray-800 rounded-2xl">
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
          <Text className="text-lg font-appFontBold text-white mb-3">
            About
          </Text>

          <View className="bg-gray-800 rounded-2xl">
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

        {/* Logout */}
        <TouchableOpacity
          className="bg-red-600 rounded-2xl py-4 mt-4 mb-8"
          activeOpacity={0.8}
        >
          <Text className="text-white font-appFontBold text-center text-lg">
            Logout
          </Text>
        </TouchableOpacity>
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

function SettingItem({ icon, label, value, onPress, rightElement }: SettingItemProps) {
  const content = (
    <View className="flex-row items-center justify-between py-4 px-4 border-b border-gray-700 last:border-b-0">
      <View className="flex-row items-center flex-1">
        <Ionicons name={icon} size={22} color="#9CA3AF" />
        <Text className="text-white font-appFont text-base ml-3">{label}</Text>
      </View>
      {rightElement || (
        <View className="flex-row items-center">
          {value && (
            <Text className="text-gray-400 font-appFont mr-2">{value}</Text>
          )}
          {onPress && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
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
