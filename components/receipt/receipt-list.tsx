import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useCallback, useMemo } from "react";
import { router } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabse";

type Receipt = {
  id: string;
  receipt_number: string;
  client_name: string;
  total: number;
  status: "draft" | "sent" | "paid";
  issue_date: string;
  currency: string;
};

const STATUS_COLORS: Record<Receipt["status"], string> = {
  paid: "#05603A",
  sent: "#003195",
  draft: "#6B7280",
};

export default function ReceiptsList() {
  const { colors } = useTheme();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReceipts = useCallback(async () => {
    try {
      setError(null);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { data, error: fetchError } = await supabase
        .from("receipts")
        .select(
          "id, receipt_number, client_name, total, status, issue_date, currency",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setReceipts(data ?? []);
    } catch (err: any) {
      setError(err.message ?? "Failed to load receipts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReceipts();
  };

  const filteredReceipts = useMemo(() => {
    if (!searchQuery.trim()) return receipts;
    const q = searchQuery.toLowerCase().trim();
    return receipts.filter(
      (rec) =>
        rec.receipt_number.toLowerCase().includes(q) ||
        rec.client_name.toLowerCase().includes(q),
    );
  }, [receipts, searchQuery]);

  const renderItem = ({ item }: { item: Receipt }) => {
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
            {item.receipt_number}
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
            onPress={fetchReceipts}
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

    if (searchQuery.trim() && filteredReceipts.length === 0) {
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
            No receipt matches "{searchQuery}"
          </Text>
        </View>
      );
    }

    return (
      <View className="items-center justify-center py-20">
        <Ionicons
          name="receipt-outline"
          size={48}
          color={colors.textTertiary}
        />
        <Text
          className="mt-3 font-appFontBold text-lg"
          style={{ color: colors.text }}
        >
          No receipts yet
        </Text>
        <Text
          className="mt-1 font-appFont"
          style={{ color: colors.textSecondary }}
        >
          Tap + to create your first receipt
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View>
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
          placeholder="Search by receipt # or client name"
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
          {filteredReceipts.length} result
          {filteredReceipts.length !== 1 ? "s" : ""} for "{searchQuery}"
        </Text>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={loading ? [] : filteredReceipts}
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
    </View>
  );
}
