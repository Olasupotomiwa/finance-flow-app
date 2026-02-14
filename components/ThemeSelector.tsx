import { useTheme } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

// components/ThemeToggle.tsx
export default function ThemeToggle() {
  const { effectiveTheme, setTheme, colors } = useTheme();

  const toggleTheme = () => {
    setTheme(effectiveTheme === "dark" ? "light" : "dark");
  };

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className="w-10 h-10 rounded-full items-center justify-center"
      style={{ backgroundColor: colors.cardSecondary }}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Toggle theme"
      accessibilityHint={`Switch to ${effectiveTheme === "dark" ? "light" : "dark"} mode`}
    >
      <Ionicons
        name={effectiveTheme === "dark" ? "sunny" : "moon"}
        size={20}
        color={colors.text}
      />
    </TouchableOpacity>
  );
}
