import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useCallback, useMemo } from "react";
import { router } from "expo-router";
import AppHeader from "@/components/Home/header";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabse";

type TabType = "invoices" | "receipts";

type Invoice = {
  id: string;
  invoice_number: string;
  client_name: string;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issue_date: string;
  due_date: string;
  currency: string;
};

const STATUS_COLORS: Record<Invoice["status"], string> = {
  paid: "#05603A",
  sent: "#003195",
  draft: "#6B7280",
  overdue: "#912018",
  cancelled: "#4B5563",
};

export default function InvoicesScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("invoices");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { colors, effectiveTheme } = useTheme();

  const fetchInvoices = useCallback(async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("invoices")
        .select(
          "id, invoice_number, client_name, total, status, issue_date, due_date, currency",
        )
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setInvoices(data ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to load invoices");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Refresh list when returning from create screen
  useEffect(() => {
    fetchInvoices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInvoices();
  };

  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices;
    const q = searchQuery.toLowerCase().trim();
    return invoices.filter(
      (inv) =>
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.client_name.toLowerCase().includes(q),
    );
  }, [invoices, searchQuery]);

  const renderItem = ({ item }: { item: Invoice }) => {
    const statusColor = STATUS_COLORS[item.status] ?? colors.textTertiary;
    return (
      <TouchableOpacity
        className="rounded-2xl p-4 mb-3"
        style={{ backgroundColor: colors.card }}
        activeOpacity={0.8}
        onPress={() =>
          router.push({
            pathname: "/invoice/[id]",
            params: { id: item.id },
          })
        }
      >
        <View className="flex-row items-center justify-between mb-2">
          <Text
            className="font-appFontBold text-lg"
            style={{ color: colors.text }}
          >
            {item.invoice_number}
          </Text>
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: `${statusColor}20` }}
          >
            <Text
              className="font-appFontBold text-xs capitalize"
              style={{ color: statusColor }}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          <View>
            <Text
              className="font-appFont text-sm"
              style={{ color: colors.textSecondary }}
            >
              {item.client_name}
            </Text>
            <Text
              className="font-appFontBold text-xl mt-1"
              style={{ color: colors.text }}
            >
              {item.currency} {item.total.toLocaleString()}
            </Text>
          </View>
          <View className="items-end gap-1">
            <Text
              className="font-appFont text-sm"
              style={{ color: colors.textTertiary }}
            >
              {new Date(item.issue_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textTertiary}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    if (error) {
      return (
        <View className="items-center justify-center py-20">
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={colors.error}
          />
          <Text
            className="mt-3 text-center font-appFont"
            style={{ color: colors.textSecondary }}
          >
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchInvoices}
            className="mt-4 px-6 py-2 rounded-xl"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="font-appFontBold" style={{ color: "#000000" }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (searchQuery.trim() && filteredInvoices.length === 0) {
      return (
        <View className="items-center justify-center py-20">
          <Ionicons
            name="search-outline"
            size={48}
            color={colors.textTertiary}
          />
          <Text
            className="mt-3 font-appFontBold text-lg"
            style={{ color: colors.text }}
          >
            No results found
          </Text>
          <Text
            className="mt-1 font-appFont text-center"
            style={{ color: colors.textSecondary }}
          >
            No invoice matches "{searchQuery}"
          </Text>
        </View>
      );
    }

    return (
      <View className="items-center justify-center py-20">
        <Ionicons
          name="document-outline"
          size={48}
          color={colors.textTertiary}
        />
        <Text
          className="mt-3 font-appFontBold text-lg"
          style={{ color: colors.text }}
        >
          No {activeTab} yet
        </Text>
        <Text
          className="mt-1 font-appFont"
          style={{ color: colors.textSecondary }}
        >
          Tap + to create your first{" "}
          {activeTab === "invoices" ? "invoice" : "receipt"}
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      {/* Tab Switcher */}
      <View className="flex-row py-4">
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
                activeTab === "invoices" ? "#000000" : colors.textSecondary,
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
                activeTab === "receipts" ? "#000000" : colors.textSecondary,
            }}
          >
            Receipts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View
        className="flex-row items-center rounded-xl px-4 mb-4"
        style={{
          backgroundColor: colors.card,
          height: 50,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by invoice # or client name"
          placeholderTextColor={colors.textTertiary}
          style={{
            flex: 1,
            marginLeft: 10,
            fontSize: 14,
            fontFamily: "appFont",
            color: colors.text,
          }}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      {searchQuery.trim().length > 0 && (
        <Text
          className="font-appFont text-sm mb-2"
          style={{ color: colors.textSecondary }}
        >
          {filteredInvoices.length} result
          {filteredInvoices.length !== 1 ? "s" : ""} for "{searchQuery}"
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={effectiveTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <AppHeader showAvatar={false} showGreeting={false} title="Invoices" />

      <FlatList
        data={loading ? [] : filteredInvoices}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={<View style={{ height: 120 }} />}
        contentContainerStyle={{ paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />

      {loading && (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* FAB → navigate to create screen */}
      <TouchableOpacity
        onPress={() => router.push("/invoice/create")}
        className="absolute bottom-28 right-6 rounded-full p-4 shadow-lg"
        style={{ backgroundColor: colors.primary }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#000000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
