import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

interface ProfileNavItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  showBorder?: boolean;
}

export default function ProfileNavItem({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
  showBorder = false,
}: ProfileNavItemProps) {
  const { colors } = useTheme();

  return (
    <>
      {showBorder && (
        <View
          className="mx-4"
          style={{ height: 1, backgroundColor: colors.border }}
        />
      )}
      <TouchableOpacity
        className="flex-row items-center px-4 py-4"
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View
          className="w-11 h-11 rounded-xl items-center justify-center mr-4"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text
            className="text-base font-appFontBold mb-0.5"
            style={{ color: colors.text }}
          >
            {title}
          </Text>
          <Text
            className="text-sm font-appFont"
            style={{ color: colors.textSecondary }}
          >
            {subtitle}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textTertiary}
        />
      </TouchableOpacity>
    </>
  );
}
