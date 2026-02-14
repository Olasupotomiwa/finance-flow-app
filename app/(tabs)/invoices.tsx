// app/(tabs)/invoices.tsx
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

type TabType = "invoices" | "receipts";

export default function InvoicesScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("invoices");

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Tab Switcher */}
       
      <View className="flex-row px-6 py-4">
        
        <TouchableOpacity
          onPress={() => setActiveTab("invoices")}
          className={`flex-1 py-3 rounded-l-xl ${
            activeTab === "invoices" ? "bg-blue-600" : "bg-gray-800"
          }`}
          activeOpacity={0.8}
        >
          <Text
            className={`text-center font-appFontBold ${
              activeTab === "invoices" ? "text-white" : "text-gray-400"
            }`}
          >
            Invoices
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("receipts")}
          className={`flex-1 py-3 rounded-r-xl ${
            activeTab === "receipts" ? "bg-blue-600" : "bg-gray-800"
          }`}
          activeOpacity={0.8}
        >
          <Text
            className={`text-center font-appFontBold ${
              activeTab === "receipts" ? "text-white" : "text-gray-400"
            }`}
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
            className="bg-gray-800 rounded-2xl p-4 mb-3"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white font-appFontBold text-lg">
                {activeTab === "invoices" ? "INV" : "REC"}-{1000 + item}
              </Text>
              <View className="bg-green-500/20 px-3 py-1 rounded-full">
                <Text className="text-green-400 font-appFontBold text-xs">
                  Paid
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-gray-400 font-appFont text-sm">
                  Client Name
                </Text>
                <Text className="text-white font-appFontBold text-xl mt-1">
                  ₦{(25000 * item).toLocaleString()}
                </Text>
              </View>
              <Text className="text-gray-500 font-appFont">
                Jan {item}, 2025
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-blue-600 rounded-full p-4 shadow-lg"
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
