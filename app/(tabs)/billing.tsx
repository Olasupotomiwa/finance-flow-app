import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Modal,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppHeader from "@/components/Home/header";
import { useTheme } from "@/context/ThemeContext";
import { useProfile } from "@/context/profileContext";
import InvoicesList from "@/components/Invoice/invoice-list";
import ReceiptsList from "@/components/receipt/receipt-list";

type TabType = "invoices" | "receipts";

const COUNTDOWN_SECONDS = 10;

export default function BillingScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("invoices");
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const { colors, effectiveTheme } = useTheme();
  const { profile, loading } = useProfile();

  // Check if required business fields are filled
  const isProfileComplete =
    !!profile?.business_name?.trim() &&
    !!profile?.street_address?.trim() &&
    !!profile?.business_phone?.trim();

  const handleFABPress = () => {
    if (!isProfileComplete) {
      setShowIncompleteModal(true);
      setCountdown(COUNTDOWN_SECONDS);
      return;
    }
    router.push(
      activeTab === "invoices" ? "/invoice/create" : "/receipt/create",
    );
  };

  // Animate modal in
  useEffect(() => {
    if (showIncompleteModal) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 6,
        useNativeDriver: true,
      }).start();

      // Start countdown
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            setShowIncompleteModal(false);
            scaleAnim.setValue(0);
            router.push("/settings/business-info");
            return COUNTDOWN_SECONDS;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      scaleAnim.setValue(0);
      if (countdownRef.current) clearInterval(countdownRef.current);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [showIncompleteModal]);

  const handleGoNow = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setShowIncompleteModal(false);
    scaleAnim.setValue(0);
    router.push("/settings/business-info");
  };

  const handleDismiss = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setShowIncompleteModal(false);
    scaleAnim.setValue(0);
  };

  // Which fields are missing — for display
  const missingFields = [
    !profile?.business_name?.trim() && "Business name",
    !profile?.street_address?.trim() && "Business address",
    !profile?.business_phone?.trim() && "Phone number",
  ].filter(Boolean) as string[];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={effectiveTheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <AppHeader showAvatar={false} showGreeting={false} title="Billing" />

      <View className="px-6">
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
      </View>

      {/* Active tab content */}
      {activeTab === "invoices" ? <InvoicesList /> : <ReceiptsList />}

      {/* FAB */}
      <TouchableOpacity
        onPress={handleFABPress}
        className="absolute right-6 rounded-full p-4 shadow-lg"
        style={{ backgroundColor: colors.primary, bottom: 100 }}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#fafafa" />
      </TouchableOpacity>

      {/* ── Incomplete Profile Modal ── */}
      <Modal
        visible={showIncompleteModal}
        transparent
        animationType="fade"
        onRequestClose={handleDismiss}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
            backgroundColor: "rgba(0,0,0,0.55)",
          }}
        >
          <Animated.View
            style={{
              width: "100%",
              borderRadius: 24,
              overflow: "hidden",
              backgroundColor: colors.card,
              transform: [{ scale: scaleAnim }],
            }}
          >
            {/* Top accent */}
            <View style={{ height: 5, backgroundColor: colors.primary }} />

            <View style={{ padding: 24 }}>
              {/* Icon */}
              <View style={{ alignItems: "center", marginBottom: 16 }}>
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: `${colors.warning || "#F59E0B"}20`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="alert-circle"
                    size={40}
                    color={colors.warning || "#F59E0B"}
                  />
                </View>
              </View>

              {/* Title */}
              <Text
                style={{
                  fontSize: 20,
                  fontFamily: "appFontBold",
                  color: colors.text,
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                Complete Your Profile
              </Text>

              {/* Subtitle */}
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "appFont",
                  color: colors.textSecondary,
                  textAlign: "center",
                  marginBottom: 20,
                  lineHeight: 20,
                }}
              >
                To create{" "}
                {activeTab === "invoices" ? "an invoice" : "a receipt"}, your
                business profile must be complete. The following details are
                missing:
              </Text>

              {/* Missing fields list */}
              <View
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 20,
                }}
              >
                {missingFields.map((field, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: i < missingFields.length - 1 ? 10 : 0,
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.error || "#EF4444",
                        marginRight: 10,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "appFont",
                        color: colors.text,
                      }}
                    >
                      {field}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Countdown bar */}
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "appFont",
                    color: colors.textSecondary,
                    marginBottom: 8,
                  }}
                >
                  Redirecting to settings in{" "}
                  <Text
                    style={{
                      fontFamily: "appFontBold",
                      color: colors.primary,
                      fontSize: 15,
                    }}
                  >
                    {countdown}s
                  </Text>
                </Text>

                {/* Progress bar track */}
                <View
                  style={{
                    width: "100%",
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: colors.border,
                    overflow: "hidden",
                  }}
                >
                  <Animated.View
                    style={{
                      height: "100%",
                      borderRadius: 2,
                      backgroundColor: colors.primary,
                      width: `${((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100}%`,
                    }}
                  />
                </View>
              </View>

              {/* Buttons */}
              <TouchableOpacity
                onPress={handleGoNow}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="settings-outline" size={18} color="#fff" />
                <Text
                  style={{
                    color: "#fff",
                    fontFamily: "appFontBold",
                    fontSize: 15,
                    marginLeft: 8,
                  }}
                >
                  Go to Settings Now
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDismiss}
                style={{
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontFamily: "appFontBold",
                    fontSize: 15,
                  }}
                >
                  Maybe Later
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
