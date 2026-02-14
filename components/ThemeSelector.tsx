import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { effectiveTheme, setTheme, colors } = useTheme();

  const toggleTheme = () => {
    // Toggle between light and dark (ignoring system)
    setTheme(effectiveTheme === "dark" ? "light" : "dark");
  };

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className="w-10 h-10 rounded-full items-center justify-center"
      style={{ backgroundColor: colors.cardSecondary }}
      activeOpacity={0.7}
    >
      <Ionicons
        name={effectiveTheme === "dark" ? "sunny" : "moon"}
        size={20}
        color={colors.text}
      />
    </TouchableOpacity>
  );
}
