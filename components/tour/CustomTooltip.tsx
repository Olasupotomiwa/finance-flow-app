/**
 * components/tour/CustomTooltip.tsx
 * v3 API — uses useCopilot() hook directly, no props passed in.
 */
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCopilot } from "react-native-copilot";
import { useTheme } from "@/context/ThemeContext";

export default function CustomTooltip() {
  const { colors } = useTheme();
  const { isFirstStep, isLastStep, goToNext, goToPrev, stop, currentStep } =
    useCopilot();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 18,
        padding: 20,
        minWidth: 260,
        maxWidth: 300,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* Step description */}
      <Text
        style={{
          fontSize: 14,
          fontFamily: "appFont",
          color: colors.text,
          lineHeight: 22,
          marginBottom: 18,
        }}
      >
        {currentStep?.text}
      </Text>

      {/* Footer */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Skip */}
        <TouchableOpacity
          onPress={stop}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text
            style={{
              fontSize: 13,
              fontFamily: "appFont",
              color: colors.textSecondary,
            }}
          >
            Skip
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          {/* Back */}
          {!isFirstStep && (
            <TouchableOpacity
              onPress={goToPrev}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "appFontBold",
                  color: colors.text,
                }}
              >
                Back
              </Text>
            </TouchableOpacity>
          )}

          {/* Next / Done */}
          <TouchableOpacity
            onPress={isLastStep ? stop : goToNext}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 9,
              borderRadius: 10,
              backgroundColor: colors.primary,
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Text
              style={{ fontSize: 13, fontFamily: "appFontBold", color: "#000" }}
            >
              {isLastStep ? "Done 🎉" : "Next"}
            </Text>
            {!isLastStep && (
              <Ionicons name="arrow-forward" size={13} color="#000" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
