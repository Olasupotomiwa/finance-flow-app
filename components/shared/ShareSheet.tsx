/**
 * Shared bottom-sheet for choosing image vs PDF share format.
 * Used by invoice/[id] and receipt/[id] preview screens.
 */
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ShareSheetProps {
  visible: boolean;
  onClose: () => void;
  onImage: () => void;
  onPDF: () => void;
  colors: any;
  title?: string;
}

export default function ShareSheet({
  visible,
  onClose,
  onImage,
  onPDF,
  colors,
  title = "Share As",
}: ShareSheetProps) {
  if (!visible) return null;

  const opts = [
    {
      label: "Share as Image",
      sub: "Save or send as JPG — easy to view anywhere",
      icon: "image-outline" as const,
      color: colors.primary,
      cb: onImage,
    },
    {
      label: "Share as PDF",
      sub: "Professional format — ideal for email & printing",
      icon: "document-text-outline" as const,
      color: colors.error,
      cb: onPDF,
    },
  ];

  return (
    <View style={{ position: "absolute", inset: 0, zIndex: 50 }}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
        activeOpacity={1}
        onPress={onClose}
      />
      <View
        style={{
          backgroundColor: colors.card,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 12,
          paddingBottom: 36,
          paddingHorizontal: 20,
        }}
      >
        {/* Handle bar */}
        <View
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.border,
            alignSelf: "center",
            marginBottom: 20,
          }}
        />

        <Text
          style={{
            fontSize: 16,
            fontFamily: "appFontBold",
            color: colors.text,
            marginBottom: 4,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 13,
            fontFamily: "appFont",
            color: colors.textSecondary,
            marginBottom: 20,
          }}
        >
          Choose the format you'd like to share
        </Text>

        {opts.map((o, i) => (
          <TouchableOpacity
            key={i}
            onPress={o.cb}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              padding: 16,
              borderRadius: 14,
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: `${o.color}20`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name={o.icon} size={22} color={o.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "appFontBold",
                  color: colors.text,
                }}
              >
                {o.label}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "appFont",
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                {o.sub}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          onPress={onClose}
          style={{
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: "center",
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "appFontBold",
              color: colors.textSecondary,
            }}
          >
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
