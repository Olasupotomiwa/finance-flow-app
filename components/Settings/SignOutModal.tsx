import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { supabase } from "@/lib/supabse";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";

interface SignOutModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SignOutModal({ visible, onClose }: SignOutModalProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);

    // 3 second loader before sign out
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      await supabase.auth.signOut();
      onClose();
      router.replace("/auth/signin");
    } catch (error: any) {
      setSigningOut(false);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => !signingOut && onClose()}
    >
      <View
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <View
          className="w-full rounded-3xl p-6"
          style={{ backgroundColor: colors.card }}
        >
          {signingOut ? (
            // Loading State
            <View className="items-center py-6">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: `${colors.error}20` }}
              >
                <ActivityIndicator color={colors.error} size="large" />
              </View>
              <Text
                className="text-xl font-appFontBold mb-2"
                style={{ color: colors.text }}
              >
                Signing Out...
              </Text>
              <Text
                className="text-sm font-appFont text-center"
                style={{ color: colors.textSecondary }}
              >
                Please wait while we sign you out safely
              </Text>
            </View>
          ) : (
            // Confirm State
            <>
              <View className="items-center mb-5">
                <View
                  className="w-20 h-20 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: `${colors.error}20` }}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={40}
                    color={colors.error}
                  />
                </View>
                <Text
                  className="text-2xl font-appFontBold mb-2"
                  style={{ color: colors.text }}
                >
                  Sign Out?
                </Text>
                <Text
                  className="text-base font-appFont text-center"
                  style={{ color: colors.textSecondary }}
                >
                  Are you sure you want to sign out of your Finance Flow
                  account?
                </Text>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={onClose}
                  className="flex-1 rounded-xl p-4 items-center"
                  style={{
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    className="font-appFontBold text-base"
                    style={{ color: colors.text }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSignOut}
                  className="flex-1 rounded-xl p-4 items-center"
                  style={{ backgroundColor: colors.error }}
                  activeOpacity={0.8}
                >
                  <Text className="font-appFontBold text-base text-white">
                    Sign Out
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
