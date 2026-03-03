import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useCallback, useMemo } from "react";
import { router } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabse";
import DebouncedSearch from "@/components/DebounceSearch";

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

export default function InvoicesList() {
  const { colors } = useTheme();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchInvoices = useCallback(async () => {
    try {
      setError(null);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error: fetchError } = await supabase
        .from("invoices")
        .select(
          "id, invoice_number, client_name, total, status, issue_date, due_date, currency",
        )
        .eq("user_id", user.id)
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchInvoices();
  };

  const filteredInvoices = useMemo(() => {
    if (!searchTerm.trim()) return invoices;
    const q = searchTerm.toLowerCase().trim();
    return invoices.filter(
      (inv) =>
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.client_name.toLowerCase().includes(q),
    );
  }, [invoices, searchTerm]);

  const renderItem = ({ item }: { item: Invoice }) => {
    const statusColor = STATUS_COLORS[item.status] ?? colors.textTertiary;
    return (
      <TouchableOpacity
        className="rounded-2xl p-4 mb-3"
        style={{ backgroundColor: colors.card }}
        activeOpacity={0.8}
        onPress={() =>
          router.push({ pathname: "/invoice/[id]", params: { id: item.id } })
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

    if (searchTerm.trim() && filteredInvoices.length === 0) {
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
            No invoice matches "{searchTerm}"
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
          No invoices yet
        </Text>
        <Text
          className="mt-1 font-appFont"
          style={{ color: colors.textSecondary }}
        >
          Tap + to create your first invoice
        </Text>
      </View>
    );
  };



  return (
  <View style={{ flex: 1 }}>

    {/* Search lives outside FlatList — never unmounts */}
    <View style={{ paddingHorizontal: 24, paddingBottom: 4 }}>
      <DebouncedSearch
        setSearchTerm={setSearchTerm}
        searchValue={searchTerm}
        placeholder="Search by invoice # or client name"
      />
      {searchTerm.trim().length > 0 && (
        <Text
          className="font-appFont text-sm mt-2"
          style={{ color: colors.textSecondary }}
        >
          {filteredInvoices.length} result
          {filteredInvoices.length !== 1 ? "s" : ""} for "{searchTerm}"
        </Text>
      )}
    </View>

    <FlatList
      data={loading ? [] : filteredInvoices}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListEmptyComponent={renderEmpty} 
      ListFooterComponent={<View style={{ height: 120 }} />}
      contentContainerStyle={{ paddingHorizontal: 24 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    />

    {loading && (
      <View className="absolute inset-0 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )}
  </View>
)}