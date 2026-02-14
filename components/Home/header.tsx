import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import ThemeToggle from "@/components/ThemeSelector";
import { useRouter } from "expo-router";

interface AppHeaderProps {
  showAvatar?: boolean;
  showGreeting?: boolean;
  title?: string;
  profile?: {
    first_name: string | null;
    avatar_url: string | null;
  } | null;
}

export default function AppHeader({
  showAvatar = true,
  showGreeting = true,
  title,
  profile,
}: AppHeaderProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <View className="px-6 py-6">
      <View className="flex-row items-center justify-between">
        {/* Left Side - Avatar and Greeting OR Title */}
        {showAvatar && showGreeting ? (
          <View className="flex-row items-center flex-1">
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                className="w-12 h-12 rounded-full mr-3"
              />
            ) : (
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.primary }}
              >
                <Ionicons name="person" size={24} color="white" />
              </View>
            )}

            <View>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                {getGreeting()} 👋
              </Text>
              <Text
                className="text-xl font-bold mt-0.5"
                style={{ color: colors.text }}
              >
                {profile?.first_name || "Welcome"}
              </Text>
            </View>
          </View>
        ) : (
          <Text
            className="text-2xl font-bold flex-1"
            style={{ color: colors.text }}
          >
            {title || "Finance Flow"}
          </Text>
        )}

        {/* Right Side - Theme Toggle and Notification */}
        <View className="flex-row items-center gap-3">
          <ThemeToggle />

          <TouchableOpacity
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: colors.card }}
            onPress={() => {
              // Handle notification press
              console.log("Notifications pressed");
            }}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
