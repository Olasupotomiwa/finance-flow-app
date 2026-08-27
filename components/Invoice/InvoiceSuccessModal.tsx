import React from "react";
import { View, Text, Modal, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useRef } from "react";

interface InvoiceSuccessModalProps {
  visible: boolean;
  invoiceNumber: string;
  clientName: string;
  onClose: () => void;
  onPreview: () => void;
}

export default function InvoiceSuccessModal({
  visible,
  invoiceNumber,
  clientName,
  onClose,
  onPreview,
}: InvoiceSuccessModalProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate success icon
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(checkAnim, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      checkAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <View
          className="w-full rounded-3xl p-6"
          style={{ backgroundColor: colors.card }}
        >
          {/* Success Icon */}
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
              alignSelf: "center",
              marginBottom: 20,
            }}
          >
            <View
              className="w-20 h-20 rounded-full items-center justify-center"
              style={{ backgroundColor: `${colors.success}20` }}
            >
              <Animated.View style={{ transform: [{ scale: checkAnim }] }}>
                <Ionicons
                  name="checkmark-circle"
                  size={60}
                  color={colors.success}
                />
              </Animated.View>
            </View>
          </Animated.View>

          {/* Success Message */}
          <Text
            className="text-2xl font-appFontBold text-center mb-2"
            style={{ color: colors.text }}
          >
            Invoice Created!
          </Text>

          <Text
            className="text-base font-appFont text-center mb-6"
            style={{ color: colors.textSecondary }}
          >
            Invoice{" "}
            <Text
              className="font-appFontBold"
              style={{ color: colors.primary }}
            >
              {invoiceNumber}
            </Text>{" "}
            generated successfully for{" "}
            <Text className="font-appFontBold" style={{ color: colors.text }}>
              {clientName}
            </Text>
          </Text>

          {/* Action Buttons */}
          <TouchableOpacity
            onPress={onPreview}
            className="py-4 rounded-xl mb-3 flex-row items-center justify-center"
            style={{ backgroundColor: colors.primary }}
            activeOpacity={0.8}
          >
            <Ionicons name="eye-outline" size={20} color="white" />
            <Text className="text-white font-appFontBold ml-2 text-base">
              Preview Invoice
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            className="py-4 rounded-xl"
            style={{
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            activeOpacity={0.8}
          >
            <Text
              className="text-center font-appFontBold"
              style={{ color: colors.text }}
            >
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
