/**
 * Shared form UI primitives used by invoice/create and receipt/create screens.
 */
import React from "react";
import { View, Text, TextInput, KeyboardTypeOptions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/context/ThemeContext";

// ── Section Header ───────────────────────────────────────────────────────────

export function SectionHeader({
  icon,
  title,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  colors: Colors;
}) {
  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: `${colors.primary}20`,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 8,
        }}
      >
        <Ionicons name={icon} size={17} color={colors.primary} />
      </View>
      <Text
        style={{ fontSize: 15, fontFamily: "appFontBold", color: colors.text }}
      >
        {title}
      </Text>
    </View>
  );
}

// ── Input Field ──────────────────────────────────────────────────────────────

export function InputField({
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
  keyboardType?: KeyboardTypeOptions;
  colors: Colors;
  isLast?: boolean;
}) {
  return (
    <View style={{ marginBottom: isLast ? 0 : 16 }}>
      <Text
        style={{
          fontSize: 13,
          fontFamily: "appFont",
          color: colors.textSecondary,
          marginBottom: 8,
        }}
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
          borderRadius: 12,
          padding: 14,
          fontFamily: "appFont",
          fontSize: 14,
        }}
      />
    </View>
  );
}

// ── Pricing Row ──────────────────────────────────────────────────────────────

export function PricingRow({
  label,
  value,
  currencySymbol,
  colors,
  valueColor,
}: {
  label: string;
  value: number;
  currencySymbol: string;
  colors: Colors;
  valueColor?: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 6,
      }}
    >
      <Text style={{ fontFamily: "appFont", color: colors.textSecondary }}>
        {label}
      </Text>
      <Text
        style={{
          fontFamily: "appFontBold",
          fontSize: 14,
          color: valueColor || colors.text,
        }}
      >
        {currencySymbol}
        {Math.abs(value).toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })}
      </Text>
    </View>
  );
}

// ── Divider ──────────────────────────────────────────────────────────────────

export function Divider({ colors }: { colors: Colors }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 12,
      }}
    />
  );
}
