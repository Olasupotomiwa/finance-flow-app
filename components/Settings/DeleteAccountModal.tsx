import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { supabase } from "@/lib/supabse";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({
  visible,
  onClose,
}: DeleteAccountModalProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleClose = () => {
    setDeleteConfirmText("");
    onClose();
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      Alert.alert("Error", 'Please type "DELETE" to confirm');
      return;
    }

    setDeletingAccount(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      // Delete user data from users table
      const { error: deleteDataError } = await supabase
        .from("users")
        .delete()
        .eq("id", user.id);

      if (deleteDataError) throw deleteDataError;

      // Sign out after deletion
      await supabase.auth.signOut();

      handleClose();
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to delete account");
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => !deletingAccount && handleClose()}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      >
        <View
          className="rounded-t-3xl p-6 pb-10"
          style={{ backgroundColor: colors.card }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: `${colors.error}20` }}
              >
                <Ionicons name="person-remove" size={20} color={colors.error} />
              </View>
              <View>
                <Text
                  className="text-xl font-appFontBold"
                  style={{ color: colors.error }}
                >
                  Delete Account
                </Text>
                <Text
                  className="text-sm font-appFont"
                  style={{ color: colors.textSecondary }}
                >
                  This action is irreversible
                </Text>
              </View>
            </View>
            {!deletingAccount && (
              <TouchableOpacity
                onPress={handleClose}
                className="w-9 h-9 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.background }}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>

          {/* Warning Box */}
          <View
            className="rounded-2xl p-4 mb-5"
            style={{ backgroundColor: `${colors.error}15` }}
          >
            <View className="flex-row items-start">
              <Ionicons
                name="warning"
                size={20}
                color={colors.error}
                style={{ marginTop: 2 }}
              />
              <View className="ml-3 flex-1">
                <Text
                  className="font-appFontBold text-base mb-2"
                  style={{ color: colors.error }}
                >
                  Warning - This cannot be undone!
                </Text>
                <Text
                  className="text-sm font-appFont"
                  style={{ color: colors.textSecondary }}
                >
                  Deleting your account will permanently remove:
                </Text>
                {[
                  "All your invoices and receipts",
                  "Your business profile and settings",
                  "All client information",
                  "Your account credentials",
                ].map((item, i) => (
                  <View key={i} className="flex-row items-center mt-1.5">
                    <View
                      className="w-1.5 h-1.5 rounded-full mr-2"
                      style={{ backgroundColor: colors.error }}
                    />
                    <Text
                      className="text-sm font-appFont"
                      style={{ color: colors.textSecondary }}
                    >
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Confirmation Input */}
          <View className="mb-5">
            <Text
              className="text-sm font-appFont mb-2"
              style={{ color: colors.textSecondary }}
            >
              Type{" "}
              <Text
                className="font-appFontBold"
                style={{ color: colors.error }}
              >
                DELETE
              </Text>{" "}
              to confirm
            </Text>
            <TextInput
              placeholder='Type "DELETE" here'
              placeholderTextColor={colors.placeholder}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              autoCapitalize="characters"
              style={{
                backgroundColor: colors.input,
                color: colors.text,
                borderColor:
                  deleteConfirmText === "DELETE"
                    ? colors.error
                    : colors.inputBorder,
                borderWidth: 1.5,
              }}
              className="p-4 rounded-xl font-appFontBold text-base"
            />
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            onPress={handleDeleteAccount}
            disabled={deletingAccount || deleteConfirmText !== "DELETE"}
            className="rounded-xl p-4 flex-row items-center justify-center"
            style={{
              backgroundColor:
                deleteConfirmText === "DELETE" ? colors.error : colors.border,
            }}
            activeOpacity={0.8}
          >
            {deletingAccount ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="trash" size={20} color="white" />
                <Text className="text-white font-appFontBold ml-2 text-base">
                  Permanently Delete Account
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
