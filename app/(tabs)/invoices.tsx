// app/(tabs)/invoices.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import AppHeader from "@/components/Home/header";
import { useTheme } from "@/context/ThemeContext";

type TabType = "invoices" | "receipts";

export default function InvoicesScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("invoices");
  const { colors, effectiveTheme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={effectiveTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <AppHeader showAvatar={false} showGreeting={false} title="Invoices" />

      {/* Tab Switcher */}
      <View className="flex-row px-6 py-4">
        <TouchableOpacity
          onPress={() => setActiveTab("invoices")}
          className="flex-1 py-3 rounded-l-xl"
          style={{
            backgroundColor:
              activeTab === "invoices" ? colors.primary : colors.card,
          }}
          activeOpacity={0.8}
        >
          <Text
            className="text-center font-appFontBold"
            style={{
              color:
                activeTab === "invoices" ? "#FFFFFF" : colors.textSecondary,
            }}
          >
            Invoices
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("receipts")}
          className="flex-1 py-3 rounded-r-xl"
          style={{
            backgroundColor:
              activeTab === "receipts" ? colors.primary : colors.card,
          }}
          activeOpacity={0.8}
        >
          <Text
            className="text-center font-appFontBold"
            style={{
              color:
                activeTab === "receipts" ? "#FFFFFF" : colors.textSecondary,
            }}
          >
            Receipts
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView className="flex-1 px-6">
        {[1, 2, 3, 4, 5].map((item) => (
          <TouchableOpacity
            key={item}
            className="rounded-2xl p-4 mb-3"
            style={{ backgroundColor: colors.card }}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text
                className="font-appFontBold text-lg"
                style={{ color: colors.text }}
              >
                {activeTab === "invoices" ? "INV" : "REC"}-{1000 + item}
              </Text>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: `${colors.success}20` }}
              >
                <Text
                  className="font-appFontBold text-xs"
                  style={{ color: colors.success }}
                >
                  Paid
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <View>
                <Text
                  className="font-appFont text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Client Name
                </Text>
                <Text
                  className="font-appFontBold text-xl mt-1"
                  style={{ color: colors.text }}
                >
                  ₦{(25000 * item).toLocaleString()}
                </Text>
              </View>
              <Text
                className="font-appFont"
                style={{ color: colors.textTertiary }}
              >
                Jan {item}, 2025
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 rounded-full p-4 shadow-lg"
        style={{ backgroundColor: colors.primary }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
