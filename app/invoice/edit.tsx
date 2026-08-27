import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  SectionHeader,
  InputField,
  PricingRow,
} from "@/components/shared/FormComponents";
import { getCurrencySymbol } from "@/components/shared/currency";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amount: number;
}

interface InvoiceConfig {
  enableTax: boolean;
  defaultTaxRate: string;
  enableDiscount: boolean;
  defaultDiscountType: string;
  currency: string;
}

export default function EditInvoiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, effectiveTheme } = useTheme();

  // Invoice Details
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [issueDate, setIssueDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  // Invoice Items
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: "1", unitPrice: "0", amount: 0 },
  ]);

  // Pricing
  const [subtotal, setSubtotal] = useState(0);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage",
  );
  const [discountValue, setDiscountValue] = useState("0");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxRate, setTaxRate] = useState("7.5");
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [notes, setNotes] = useState("");

  // Config & State
  const [config, setConfig] = useState<InvoiceConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (id) loadInvoice();
  }, [id]);

  useEffect(() => {
    calculateTotals();
  }, [items, discountValue, discountType, taxRate, config]);

  const loadInvoice = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      setUserId(user.id);

      // Load config
      const { data: cfgData } = await supabase
        .from("user_settings")
        .select("invoice_config")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cfgData?.invoice_config) {
        setConfig(cfgData.invoice_config);
        setTaxRate(cfgData.invoice_config.defaultTaxRate || "7.5");
        setDiscountType(cfgData.invoice_config.defaultDiscountType || "percentage");
      }

      // Load invoice
      const { data: inv, error: invError } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", id)
        .single();

      if (invError) throw invError;

      // Populate fields
      setClientName(inv.client_name || "");
      setClientEmail(inv.client_email || "");
      setClientPhone(inv.client_phone || "");
      setInvoiceNumber(inv.invoice_number || "");
      setStatus(inv.status || "");
      setNotes(inv.notes || "");
      setDiscountValue(String(inv.discount_value || 0));
      setTaxRate(String(inv.tax_rate || 7.5));

      if (inv.issue_date) setIssueDate(new Date(inv.issue_date));
      if (inv.due_date) setDueDate(new Date(inv.due_date));

      // Load items
      const { data: invItems, error: itemsError } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", id);

      if (itemsError) throw itemsError;

      if (invItems && invItems.length > 0) {
        setItems(
          invItems.map((item: any) => ({
            id: item.id || Date.now().toString(),
            description: item.description || "",
            quantity: String(item.quantity || 1),
            unitPrice: String(item.unit_price || 0),
            amount: item.amount || 0,
          })),
        );
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to load invoice",
        text2: error.message,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const sub = items.reduce((sum, item) => sum + item.amount, 0);
    setSubtotal(sub);

    let discount = 0;
    if (discountValue && parseFloat(discountValue) > 0) {
      discount =
        discountType === "percentage"
          ? (sub * parseFloat(discountValue)) / 100
          : parseFloat(discountValue);
    }
    setDiscountAmount(discount);

    const afterDiscount = sub - discount;
    const tax =
      config?.enableTax && taxRate
        ? (afterDiscount * parseFloat(taxRate)) / 100
        : 0;
    setTaxAmount(tax);
    setTotal(afterDiscount + tax);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: "",
        quantity: "1",
        unitPrice: "0",
        amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (itemId: string) => {
    if (items.length > 1) setItems(items.filter((item) => item.id !== itemId));
  };

  const handleItemChange = (
    itemId: string,
    field: keyof InvoiceItem,
    value: string,
  ) => {
    setItems(
      items.map((item) => {
        if (item.id !== itemId) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updated.amount =
            (parseFloat(updated.quantity) || 0) *
            (parseFloat(updated.unitPrice) || 0);
        }
        return updated;
      }),
    );
  };

  const handleSave = async () => {
    if (!clientName.trim()) {
      Toast.show({
        type: "error",
        text1: "Client name required",
        position: "top",
      });
      return;
    }

    const validItems = items.filter(
      (item) => item.description.trim() && item.amount > 0,
    );
    if (validItems.length === 0) {
      Toast.show({
        type: "error",
        text1: "Add items",
        text2: "Please add at least one invoice item",
        position: "top",
      });
      return;
    }

    setSaving(true);
    try {
      // Update invoice
      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          client_name: clientName,
          client_email: clientEmail || null,
          client_phone: clientPhone || null,
          issue_date: issueDate.toISOString().split("T")[0],
          due_date: dueDate.toISOString().split("T")[0],
          subtotal,
          discount_type: config?.enableDiscount ? discountType : null,
          discount_value: config?.enableDiscount ? parseFloat(discountValue) : 0,
          discount_amount: discountAmount,
          tax_rate: config?.enableTax ? parseFloat(taxRate) : 0,
          tax_amount: taxAmount,
          total,
          notes: notes || null,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      // Delete old items and insert new ones
      const { error: deleteError } = await supabase
        .from("invoice_items")
        .delete()
        .eq("invoice_id", id);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase.from("invoice_items").insert(
        validItems.map((item) => ({
          invoice_id: id,
          description: item.description,
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unitPrice),
          amount: item.amount,
        })),
      );

      if (insertError) throw insertError;

      Toast.show({
        type: "success",
        text1: "Invoice updated!",
        text2: invoiceNumber,
        position: "top",
      });
      setTimeout(() => router.back(), 1500);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to update invoice",
        text2: error.message,
        position: "top",
      });
    } finally {
      setSaving(false);
    }
  };

  const currencySymbol = getCurrencySymbol(config?.currency || "NGN");

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ gestureEnabled: true }} />
      <StatusBar
        barStyle={effectiveTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.card,
          }}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{
              fontSize: 18,
              fontFamily: "appFontBold",
              color: colors.text,
            }}
          >
            Edit Invoice
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontFamily: "appFont",
              color: colors.textSecondary,
            }}
          >
            {invoiceNumber}
          </Text>
        </View>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: status === "draft" ? "#6B728020" : "#05603A20",
          }}
        >
          <Text
            style={{
              fontFamily: "appFontBold",
              fontSize: 11,
              color: status === "draft" ? "#6B7280" : "#05603A",
              textTransform: "uppercase",
            }}
          >
            {status}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20 }}
        >
          {/* Client Information */}
          <SectionHeader
            icon="person"
            title="Client Information"
            colors={colors}
          />
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <InputField
              label="Client Name *"
              placeholder="John Doe"
              value={clientName}
              onChangeText={setClientName}
              colors={colors}
            />
            <InputField
              label="Email"
              placeholder="client@example.com"
              value={clientEmail}
              onChangeText={setClientEmail}
              keyboardType="email-address"
              colors={colors}
            />
            <InputField
              label="Phone"
              placeholder="+234 803 123 4567"
              value={clientPhone}
              onChangeText={setClientPhone}
              keyboardType="phone-pad"
              colors={colors}
              isLast
            />
          </View>

          {/* Invoice Dates */}
          <SectionHeader
            icon="calendar"
            title="Invoice Dates"
            colors={colors}
          />
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "appFont",
                    color: colors.textSecondary,
                    marginBottom: 8,
                  }}
                >
                  Issue Date
                </Text>
                <TouchableOpacity
                  onPress={() => setShowIssueDatePicker(true)}
                  style={{
                    backgroundColor: colors.input,
                    borderWidth: 1,
                    borderColor: colors.inputBorder,
                    borderRadius: 12,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "appFont",
                      color: colors.text,
                      fontSize: 14,
                    }}
                  >
                    {issueDate.toLocaleDateString()}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "appFont",
                    color: colors.textSecondary,
                    marginBottom: 8,
                  }}
                >
                  Due Date
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDueDatePicker(true)}
                  style={{
                    backgroundColor: colors.input,
                    borderWidth: 1,
                    borderColor: colors.inputBorder,
                    borderRadius: 12,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "appFont",
                      color: colors.text,
                      fontSize: 14,
                    }}
                  >
                    {dueDate.toLocaleDateString()}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {showIssueDatePicker && (
              <DateTimePicker
                value={issueDate}
                mode="date"
                onChange={(_, date) => {
                  setShowIssueDatePicker(false);
                  if (date) setIssueDate(date);
                }}
              />
            )}
            {showDueDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                onChange={(_, date) => {
                  setShowDueDatePicker(false);
                  if (date) setDueDate(date);
                }}
              />
            )}
          </View>

          {/* Invoice Items */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <SectionHeader icon="list" title="Invoice Items" colors={colors} />
            <TouchableOpacity
              onPress={handleAddItem}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: `${colors.primary}20`,
              }}
            >
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text
                style={{
                  fontFamily: "appFontBold",
                  fontSize: 13,
                  color: colors.primary,
                  marginLeft: 4,
                }}
              >
                Add Item
              </Text>
            </TouchableOpacity>
          </View>

          {items.map((item, index) => (
            <View
              key={item.id}
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontFamily: "appFontBold", color: colors.text }}>
                  Item {index + 1}
                </Text>
                {items.length > 1 && (
                  <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colors.error}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <InputField
                label="Description *"
                placeholder="Item description"
                value={item.description}
                onChangeText={(v) =>
                  handleItemChange(item.id, "description", v)
                }
                colors={colors}
              />
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <InputField
                    label="Quantity"
                    placeholder="1"
                    value={item.quantity}
                    onChangeText={(v) =>
                      handleItemChange(item.id, "quantity", v)
                    }
                    keyboardType="numeric"
                    colors={colors}
                    isLast
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <InputField
                    label="Unit Price"
                    placeholder="0.00"
                    value={item.unitPrice}
                    onChangeText={(v) =>
                      handleItemChange(item.id, "unitPrice", v)
                    }
                    keyboardType="numeric"
                    colors={colors}
                    isLast
                  />
                </View>
              </View>
              <View
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTopWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{ fontFamily: "appFont", color: colors.textSecondary }}
                >
                  Amount
                </Text>
                <Text
                  style={{
                    fontFamily: "appFontBold",
                    fontSize: 16,
                    color: colors.text,
                  }}
                >
                  {currencySymbol}
                  {item.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
            </View>
          ))}

          {/* Pricing Summary */}
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <PricingRow
              label="Subtotal"
              value={subtotal}
              currencySymbol={currencySymbol}
              colors={colors}
            />

            {config?.enableDiscount && (
              <>
                <View
                  style={{
                    height: 1,
                    backgroundColor: colors.border,
                    marginVertical: 12,
                  }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "appFont",
                    color: colors.textSecondary,
                    marginBottom: 8,
                  }}
                >
                  Discount
                </Text>
                <View
                  style={{ flexDirection: "row", gap: 12, marginBottom: 8 }}
                >
                  <TextInput
                    placeholder="0"
                    placeholderTextColor={colors.placeholder}
                    value={discountValue}
                    onChangeText={setDiscountValue}
                    keyboardType="numeric"
                    style={{
                      flex: 1,
                      backgroundColor: colors.input,
                      color: colors.text,
                      borderColor: colors.inputBorder,
                      borderWidth: 1,
                      borderRadius: 12,
                      padding: 14,
                      fontFamily: "appFont",
                      fontSize: 14,
                    }}
                  />
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => setDiscountType("percentage")}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderRadius: 12,
                        backgroundColor:
                          discountType === "percentage"
                            ? colors.primary
                            : colors.input,
                        borderWidth: 1,
                        borderColor:
                          discountType === "percentage"
                            ? colors.primary
                            : colors.inputBorder,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "appFontBold",
                          color:
                            discountType === "percentage"
                              ? "#000"
                              : colors.text,
                        }}
                      >
                        %
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setDiscountType("fixed")}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        borderRadius: 12,
                        backgroundColor:
                          discountType === "fixed"
                            ? colors.primary
                            : colors.input,
                        borderWidth: 1,
                        borderColor:
                          discountType === "fixed"
                            ? colors.primary
                            : colors.inputBorder,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "appFontBold",
                          color:
                            discountType === "fixed" ? "#000" : colors.text,
                        }}
                      >
                        {currencySymbol}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <PricingRow
                  label="Discount Amount"
                  value={-discountAmount}
                  currencySymbol={currencySymbol}
                  colors={colors}
                  valueColor={colors.error}
                />
              </>
            )}

            {config?.enableTax && (
              <>
                <View
                  style={{
                    height: 1,
                    backgroundColor: colors.border,
                    marginVertical: 12,
                  }}
                />
                <PricingRow
                  label={`Tax (${taxRate}%)`}
                  value={taxAmount}
                  currencySymbol={currencySymbol}
                  colors={colors}
                />
              </>
            )}

            <View
              style={{
                marginTop: 12,
                paddingTop: 12,
                borderTopWidth: 2,
                borderColor: colors.border,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontFamily: "appFontBold",
                  fontSize: 16,
                  color: colors.text,
                }}
              >
                Total
              </Text>
              <Text
                style={{
                  fontFamily: "appFontBold",
                  fontSize: 24,
                  color: colors.primary,
                }}
              >
                {currencySymbol}
                {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          {/* Notes */}
          <SectionHeader
            icon="document-text"
            title="Notes (Optional)"
            colors={colors}
          />
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              marginBottom: 28,
            }}
          >
            <TextInput
              placeholder="Add any additional notes..."
              placeholderTextColor={colors.placeholder}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: colors.input,
                color: colors.text,
                borderColor: colors.inputBorder,
                borderWidth: 1,
                borderRadius: 12,
                padding: 14,
                minHeight: 100,
                textAlignVertical: "top",
                fontFamily: "appFont",
                fontSize: 14,
              }}
            />
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                flex: 1,
                paddingVertical: 16,
                borderRadius: 14,
                alignItems: "center",
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontFamily: "appFontBold",
                  fontSize: 15,
                  color: colors.text,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={{
                flex: 1,
                paddingVertical: 16,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 8,
                backgroundColor: colors.primary,
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <>
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={colors.background}
                  />
                  <Text
                    style={{
                      fontFamily: "appFontBold",
                      fontSize: 15,
                      color: colors.background,
                    }}
                  >
                    Save Changes
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
