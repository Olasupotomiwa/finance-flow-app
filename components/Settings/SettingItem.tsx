import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

export default function SettingItem({
  icon,
  label,
  subtitle,
  value,
  onPress,
  rightElement,
}: SettingItemProps) {
  const { colors } = useTheme();

  const content = (
    <View
      className="flex-row items-center justify-between py-4 px-4 border-b"
      style={{ borderColor: colors.border }}
    >
      <View className="flex-row items-center flex-1">
        <View
          className="w-9 h-9 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: `${colors.primary}15` }}
        >
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <View className="flex-1">
          <Text
            className="font-appFontBold text-base"
            style={{ color: colors.text }}
          >
            {label}
          </Text>
          {subtitle && (
            <Text
              className="text-sm font-appFont mt-0.5"
              style={{ color: colors.textSecondary }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement || (
        <View className="flex-row items-center">
          {value && (
            <Text
              className="font-appFont text-sm mr-2"
              style={{ color: colors.textSecondary }}
            >
              {value}
            </Text>
          )}
          {onPress && (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textTertiary}
            />
          )}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
