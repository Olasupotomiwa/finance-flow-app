import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabse";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";
import InvoiceSuccessModal from "@/components/Invoice/InvoiceSucessModal";
import InvoicePreviewModal from "@/components/Invoice/invoicePreview";

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
  defaultPaymentTerms: string;
  currency: string;
  showFooterMessage: boolean;
  footerMessage: string;
}

interface CreateInvoiceModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateInvoiceModal({
  visible,
  onClose,
  onSuccess,
}: CreateInvoiceModalProps) {
  const { colors } = useTheme();

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
    {
      id: "1",
      description: "",
      quantity: "1",
      unitPrice: "0",
      amount: 0,
    },
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

  // Notes
  const [notes, setNotes] = useState("");

  // Config & State
  const [config, setConfig] = useState<InvoiceConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 🔥 Success and Preview Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);
  const [createdInvoiceNumber, setCreatedInvoiceNumber] = useState("");
  const [createdClientName, setCreatedClientName] = useState("");

  // Load configuration
  useEffect(() => {
    if (visible) {
      loadConfiguration();
    }
  }, [visible]);

  // Calculate totals whenever items, discount, or tax changes
  useEffect(() => {
    calculateTotals();
  }, [items, discountValue, discountType, taxRate]);

  const loadConfiguration = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserId(user.id);

      const { data, error } = await supabase
        .from("user_settings")
        .select("invoice_config")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.invoice_config) {
        setConfig(data.invoice_config);
        setTaxRate(data.invoice_config.defaultTaxRate || "7.5");
        setDiscountType(
          data.invoice_config.defaultDiscountType || "percentage",
        );

        // Set due date based on payment terms
        const terms = parseInt(data.invoice_config.defaultPaymentTerms || "30");
        const newDueDate = new Date();
        newDueDate.setDate(newDueDate.getDate() + terms);
        setDueDate(newDueDate);
      }
    } catch (error: any) {
      console.error("Error loading configuration:", error);
      Toast.show({
        type: "error",
        text1: "Failed to load settings",
        text2: error.message,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    // Calculate subtotal
    const sub = items.reduce((sum, item) => sum + item.amount, 0);
    setSubtotal(sub);

    // Calculate discount
    let discount = 0;
    if (discountValue && parseFloat(discountValue) > 0) {
      if (discountType === "percentage") {
        discount = (sub * parseFloat(discountValue)) / 100;
      } else {
        discount = parseFloat(discountValue);
      }
    }
    setDiscountAmount(discount);

    // Calculate tax
    const afterDiscount = sub - discount;
    const tax =
      config?.enableTax && taxRate
        ? (afterDiscount * parseFloat(taxRate)) / 100
        : 0;
    setTaxAmount(tax);

    // Calculate total
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

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleItemChange = (
    id: string,
    field: keyof InvoiceItem,
    value: string,
  ) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };

        // Recalculate amount
        if (field === "quantity" || field === "unitPrice") {
          const qty = parseFloat(updated.quantity) || 0;
          const price = parseFloat(updated.unitPrice) || 0;
          updated.amount = qty * price;
        }

        return updated;
      }
      return item;
    });
    setItems(updatedItems);
  };

  const generateInvoiceNumber = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, "0");
    return `INV-${year}${month}${day}-${random}`;
  };

  const handleSave = async () => {
    // Validation
    if (!clientName.trim()) {
      Toast.show({
        type: "error",
        text1: "Client name required",
        text2: "Please enter a client name",
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
      if (!userId) throw new Error("User not authenticated");

      const invoiceNumber = generateInvoiceNumber();

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert([
          {
            user_id: userId,
            invoice_number: invoiceNumber,
            client_name: clientName,
            client_email: clientEmail || null,
            client_phone: clientPhone || null,
            issue_date: issueDate.toISOString().split("T")[0],
            due_date: dueDate.toISOString().split("T")[0],
            status: "draft",
            subtotal: subtotal,
            discount_type: config?.enableDiscount ? discountType : null,
            discount_value: config?.enableDiscount
              ? parseFloat(discountValue)
              : 0,
            discount_amount: discountAmount,
            tax_rate: config?.enableTax ? parseFloat(taxRate) : 0,
            tax_amount: taxAmount,
            total: total,
            notes: notes || null,
            currency: config?.currency || "NGN",
          },
        ])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const itemsToInsert = validItems.map((item) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unitPrice),
        amount: item.amount,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // 🔥 Store created invoice details
      setCreatedInvoiceId(invoice.id);
      setCreatedInvoiceNumber(invoiceNumber);
      setCreatedClientName(clientName);

      // 🔥 Close create modal and show success modal
      handleClose();
      setShowSuccessModal(true);

      onSuccess?.();
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      Toast.show({
        type: "error",
        text1: "❌ Failed to create invoice",
        text2: error.message,
        position: "top",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setIssueDate(new Date());
    setDueDate(new Date());
    setItems([
      {
        id: "1",
        description: "",
        quantity: "1",
        unitPrice: "0",
        amount: 0,
      },
    ]);
    setDiscountValue("0");
    setNotes("");
    onClose();
  };

  if (loading) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </Modal>
    );
  }

  const currencySymbol =
    config?.currency === "NGN"
      ? "₦"
      : config?.currency === "USD"
        ? "$"
        : config?.currency === "GBP"
          ? "£"
          : "€";

  return (
    <>
      {/* Main Create Invoice Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <View
            className="flex-1 mt-20 rounded-t-3xl"
            style={{ backgroundColor: colors.background }}
          >
            {/* Header */}
            <View
              className="flex-row items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: colors.border }}
            >
              <View className="flex-1">
                <Text
                  className="text-2xl font-appFontBold"
                  style={{ color: colors.text }}
                >
                  Create Invoice
                </Text>
                <Text
                  className="text-sm font-appFont"
                  style={{ color: colors.textSecondary }}
                >
                  Fill in the details below
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.card }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="p-6">
                {/* Client Information */}
                <SectionHeader
                  icon="person"
                  title="Client Information"
                  colors={colors}
                />
                <View
                  className="rounded-2xl p-4 mb-4"
                  style={{ backgroundColor: colors.card }}
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
                  className="rounded-2xl p-4 mb-4"
                  style={{ backgroundColor: colors.card }}
                >
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Text
                        className="text-sm font-appFont mb-2"
                        style={{ color: colors.textSecondary }}
                      >
                        Issue Date
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowIssueDatePicker(true)}
                        className="p-4 rounded-xl flex-row items-center justify-between"
                        style={{
                          backgroundColor: colors.input,
                          borderWidth: 1,
                          borderColor: colors.inputBorder,
                        }}
                      >
                        <Text
                          className="font-appFont"
                          style={{ color: colors.text }}
                        >
                          {issueDate.toLocaleDateString()}
                        </Text>
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color={colors.textTertiary}
                        />
                      </TouchableOpacity>
                    </View>

                    <View className="flex-1">
                      <Text
                        className="text-sm font-appFont mb-2"
                        style={{ color: colors.textSecondary }}
                      >
                        Due Date
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowDueDatePicker(true)}
                        className="p-4 rounded-xl flex-row items-center justify-between"
                        style={{
                          backgroundColor: colors.input,
                          borderWidth: 1,
                          borderColor: colors.inputBorder,
                        }}
                      >
                        <Text
                          className="font-appFont"
                          style={{ color: colors.text }}
                        >
                          {dueDate.toLocaleDateString()}
                        </Text>
                        <Ionicons
                          name="calendar-outline"
                          size={20}
                          color={colors.textTertiary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {showIssueDatePicker && (
                    <DateTimePicker
                      value={issueDate}
                      mode="date"
                      onChange={(event, date) => {
                        setShowIssueDatePicker(false);
                        if (date) setIssueDate(date);
                      }}
                    />
                  )}

                  {showDueDatePicker && (
                    <DateTimePicker
                      value={dueDate}
                      mode="date"
                      onChange={(event, date) => {
                        setShowDueDatePicker(false);
                        if (date) setDueDate(date);
                      }}
                    />
                  )}
                </View>

                {/* Invoice Items */}
                <View className="flex-row items-center justify-between mb-3">
                  <SectionHeader
                    icon="list"
                    title="Invoice Items"
                    colors={colors}
                  />
                  <TouchableOpacity
                    onPress={handleAddItem}
                    className="flex-row items-center px-3 py-2 rounded-lg"
                    style={{ backgroundColor: `${colors.primary}20` }}
                  >
                    <Ionicons name="add" size={18} color={colors.primary} />
                    <Text
                      className="font-appFontBold text-sm ml-1"
                      style={{ color: colors.primary }}
                    >
                      Add Item
                    </Text>
                  </TouchableOpacity>
                </View>

                {items.map((item, index) => (
                  <View
                    key={item.id}
                    className="rounded-2xl p-4 mb-3"
                    style={{ backgroundColor: colors.card }}
                  >
                    <View className="flex-row items-center justify-between mb-3">
                      <Text
                        className="font-appFontBold"
                        style={{ color: colors.text }}
                      >
                        Item {index + 1}
                      </Text>
                      {items.length > 1 && (
                        <TouchableOpacity
                          onPress={() => handleRemoveItem(item.id)}
                        >
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
                      onChangeText={(value) =>
                        handleItemChange(item.id, "description", value)
                      }
                      colors={colors}
                    />

                    <View className="flex-row gap-3">
                      <View className="flex-1">
                        <InputField
                          label="Quantity"
                          placeholder="1"
                          value={item.quantity}
                          onChangeText={(value) =>
                            handleItemChange(item.id, "quantity", value)
                          }
                          keyboardType="numeric"
                          colors={colors}
                          isLast
                        />
                      </View>

                      <View className="flex-1">
                        <InputField
                          label="Unit Price"
                          placeholder="0.00"
                          value={item.unitPrice}
                          onChangeText={(value) =>
                            handleItemChange(item.id, "unitPrice", value)
                          }
                          keyboardType="numeric"
                          colors={colors}
                          isLast
                        />
                      </View>
                    </View>

                    <View
                      className="mt-3 pt-3 flex-row items-center justify-between"
                      style={{
                        borderTopWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Text
                        className="font-appFont"
                        style={{ color: colors.textSecondary }}
                      >
                        Amount
                      </Text>
                      <Text
                        className="font-appFontBold text-lg"
                        style={{ color: colors.text }}
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
                  className="rounded-2xl p-4 mb-4"
                  style={{ backgroundColor: colors.card }}
                >
                  {/* Subtotal */}
                  <PricingRow
                    label="Subtotal"
                    value={subtotal}
                    currencySymbol={currencySymbol}
                    colors={colors}
                  />

                  {/* Discount */}
                  {config?.enableDiscount && (
                    <>
                      <View
                        className="my-3"
                        style={{ height: 1, backgroundColor: colors.border }}
                      />
                      <View className="mb-2">
                        <Text
                          className="text-sm font-appFont mb-2"
                          style={{ color: colors.textSecondary }}
                        >
                          Discount
                        </Text>
                        <View className="flex-row gap-3">
                          <View className="flex-1">
                            <TextInput
                              placeholder="0"
                              placeholderTextColor={colors.placeholder}
                              value={discountValue}
                              onChangeText={setDiscountValue}
                              keyboardType="numeric"
                              style={{
                                backgroundColor: colors.input,
                                color: colors.text,
                                borderColor: colors.inputBorder,
                                borderWidth: 1,
                              }}
                              className="p-4 rounded-xl font-appFont text-base"
                            />
                          </View>
                          <View className="flex-row gap-2">
                            <TouchableOpacity
                              onPress={() => setDiscountType("percentage")}
                              className="px-4 py-4 rounded-xl"
                              style={{
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
                                className="font-appFontBold"
                                style={{
                                  color:
                                    discountType === "percentage"
                                      ? "#FFF"
                                      : colors.text,
                                }}
                              >
                                %
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => setDiscountType("fixed")}
                              className="px-4 py-4 rounded-xl"
                              style={{
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
                                className="font-appFontBold"
                                style={{
                                  color:
                                    discountType === "fixed"
                                      ? "#FFF"
                                      : colors.text,
                                }}
                              >
                                {currencySymbol}
                              </Text>
                            </TouchableOpacity>
                          </View>
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

                  {/* Tax */}
                  {config?.enableTax && (
                    <>
                      <View
                        className="my-3"
                        style={{ height: 1, backgroundColor: colors.border }}
                      />
                      <PricingRow
                        label={`Tax (${taxRate}%)`}
                        value={taxAmount}
                        currencySymbol={currencySymbol}
                        colors={colors}
                      />
                    </>
                  )}

                  {/* Total */}
                  <View
                    className="mt-3 pt-3"
                    style={{
                      borderTopWidth: 2,
                      borderColor: colors.border,
                    }}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text
                        className="font-appFontBold text-lg"
                        style={{ color: colors.text }}
                      >
                        Total
                      </Text>
                      <Text
                        className="font-appFontBold text-2xl"
                        style={{ color: colors.primary }}
                      >
                        {currencySymbol}
                        {total.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Notes */}
                <SectionHeader
                  icon="document-text"
                  title="Notes (Optional)"
                  colors={colors}
                />
                <View
                  className="rounded-2xl p-4 mb-6"
                  style={{ backgroundColor: colors.card }}
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
                      minHeight: 100,
                      textAlignVertical: "top",
                    }}
                    className="p-4 rounded-xl font-appFont text-base"
                  />
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3 mb-8">
                  <TouchableOpacity
                    onPress={handleClose}
                    className="flex-1 py-4 rounded-xl"
                    style={{
                      backgroundColor: colors.card,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text
                      className="text-center font-appFontBold"
                      style={{ color: colors.text }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className="flex-1 py-4 rounded-xl flex-row items-center justify-center"
                    style={{
                      backgroundColor: colors.primary,
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={20} color="white" />
                        <Text className="text-white font-appFontBold ml-2">
                          Create Invoice
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 🔥 Success Modal */}
      <InvoiceSuccessModal
        visible={showSuccessModal}
        invoiceNumber={createdInvoiceNumber}
        clientName={createdClientName}
        onClose={() => setShowSuccessModal(false)}
        onPreview={() => {
          setShowSuccessModal(false);
          setShowPreviewModal(true);
        }}
      />

      {/* 🔥 Preview Modal */}
      <InvoicePreviewModal
        visible={showPreviewModal}
        invoiceId={createdInvoiceId}
        onClose={() => {
          setShowPreviewModal(false);
          setCreatedInvoiceId(null);
        }}
      />
    </>
  );
}

// Helper Components
function SectionHeader({
  icon,
  title,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  colors: any;
}) {
  return (
    <View className="flex-row items-center mb-3">
      <View
        className="w-8 h-8 rounded-lg items-center justify-center mr-2"
        style={{ backgroundColor: `${colors.primary}20` }}
      >
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text
        className="text-base font-appFontBold"
        style={{ color: colors.text }}
      >
        {title}
      </Text>
    </View>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  colors,
  isLast = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: any;
  colors: any;
  isLast?: boolean;
}) {
  return (
    <View className={isLast ? "" : "mb-4"}>
      <Text
        className="text-sm font-appFont mb-2"
        style={{ color: colors.textSecondary }}
      >
        {label}
      </Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={{
          backgroundColor: colors.input,
          color: colors.text,
          borderColor: colors.inputBorder,
          borderWidth: 1,
        }}
        className="p-4 rounded-xl font-appFont text-base"
      />
    </View>
  );
}

function PricingRow({
  label,
  value,
  currencySymbol,
  colors,
  valueColor,
}: {
  label: string;
  value: number;
  currencySymbol: string;
  colors: any;
  valueColor?: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="font-appFont" style={{ color: colors.textSecondary }}>
        {label}
      </Text>
      <Text
        className="font-appFontBold text-base"
        style={{ color: valueColor || colors.text }}
      >
        {currencySymbol}
        {Math.abs(value).toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })}
      </Text>
    </View>
  );
}
