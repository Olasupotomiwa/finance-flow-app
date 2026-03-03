import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function DebouncedSearch({
  setSearchTerm,
  searchValue,
  placeholder = "Search..",
}: {
  setSearchTerm: (value: string) => void;
  searchValue?: string;
  placeholder?: string;
}) {
  const { colors } = useTheme();
  const [val, setVal] = useState<string>("");

  const debouncedSearchTerm = useDebounce(val, 300);

  // Derived — no extra useState/useEffect, no re-render lag
  const searching = val.trim().length > 0 && val !== debouncedSearchTerm;

  useEffect(() => {
    setSearchTerm(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchTerm]);

  // Reset input when parent clears searchValue
  useEffect(() => {
    if (!searchValue) setVal("");
  }, [searchValue]);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
      }}
    >
      {/* Icon: spinner while debounce pending, search icon otherwise */}
      {searching ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
      )}

      <TextInput
        value={val}
        onChangeText={setVal}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        style={{
          flex: 1,
          marginLeft: 10,
          fontSize: 14,
          fontFamily: "appFont",
          color: colors.text,
        }}
      />

      {/* Clear button */}
      {val.length > 0 && (
        <TouchableOpacity onPress={() => setVal("")} activeOpacity={0.7}>
          <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
}
