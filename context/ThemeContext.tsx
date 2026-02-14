import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  colors: typeof lightColors;
}

const lightColors = {
  // Backgrounds
  background: "#FFFFFF",
  backgroundSecondary: "#F3F4F6",
  backgroundTertiary: "#E5E7EB",

  // Cards & Surfaces
  card: "#FFFFFF",
  cardSecondary: "#F9FAFB",

  // Text
  text: "#111827",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",

  // Primary (Blue)
  primary: "#3B82F6",
  primaryLight: "#60A5FA",
  primaryDark: "#2563EB",

  // Accent Colors
  success: "#10B981",
  successLight: "#34D399",
  error: "#EF4444",
  errorLight: "#F87171",
  warning: "#F59E0B",
  warningLight: "#FBBF24",

  // Borders
  border: "#E5E7EB",
  borderLight: "#F3F4F6",

  // Input
  input: "#F9FAFB",
  inputBorder: "#D1D5DB",
  placeholder: "#9CA3AF",

  // Other
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
};

const darkColors = {
  // Backgrounds
  background: "#111827",
  backgroundSecondary: "#1F2937",
  backgroundTertiary: "#374151",

  // Cards & Surfaces
  card: "#1F2937",
  cardSecondary: "#374151",

  // Text
  text: "#FFFFFF",
  textSecondary: "#D1D5DB",
  textTertiary: "#9CA3AF",

  // Primary (Blue)
  primary: "#3B82F6",
  primaryLight: "#60A5FA",
  primaryDark: "#2563EB",

  // Accent Colors
  success: "#10B981",
  successLight: "#34D399",
  error: "#EF4444",
  errorLight: "#F87171",
  warning: "#F59E0B",
  warningLight: "#FBBF24",

  // Borders
  border: "#374151",
  borderLight: "#4B5563",

  // Input
  input: "#374151",
  inputBorder: "#4B5563",
  placeholder: "#6B7280",

  // Other
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
};

const THEME_STORAGE_KEY = "@app_theme";

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  effectiveTheme: "dark",
  setTheme: () => {},
  colors: darkColors,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>("system");

  // Load saved theme preference
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (
        savedTheme &&
        (savedTheme === "light" ||
          savedTheme === "dark" ||
          savedTheme === "system")
      ) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  // Determine effective theme (resolve 'system' to 'light' or 'dark')
  const effectiveTheme: "light" | "dark" =
    theme === "system" ? systemColorScheme || "dark" : theme;

  const colors = effectiveTheme === "light" ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
