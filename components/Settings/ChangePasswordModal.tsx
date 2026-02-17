import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useMemo } from "react";
import { supabase } from "@/lib/supabse";
import { useTheme } from "@/context/ThemeContext";

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PasswordRule {
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  {
    label: "At least 6 characters",
    test: (p) => p.length >= 6,
  },
  {
    label: "One uppercase letter (A-Z)",
    test: (p) => /[A-Z]/.test(p),
  },
  {
    label: "One lowercase letter (a-z)",
    test: (p) => /[a-z]/.test(p),
  },
  {
    label: "One number (0-9)",
    test: (p) => /[0-9]/.test(p),
  },
  {
    label: "One special character (!@#$...)",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

export default function ChangePasswordModal({
  visible,
  onClose,
}: ChangePasswordModalProps) {
  const { colors } = useTheme();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showRules, setShowRules] = useState(false);
  // 🔥 Track if user has moved to confirm password field
  const [confirmFocused, setConfirmFocused] = useState(false);

  // Calculate which rules pass
  const ruleResults = useMemo(
    () => PASSWORD_RULES.map((rule) => rule.test(newPassword)),
    [newPassword],
  );

  const passedCount = ruleResults.filter(Boolean).length;
  const allRulesPassed = passedCount === PASSWORD_RULES.length;

  // Strength level
 const strengthLevel = useMemo(() => {
   if (newPassword.length === 0) return null;
   if (passedCount <= 1)
     return { label: "Very Weak", color: "#EF4444", width: "20%" as const };
   if (passedCount === 2)
     return { label: "Weak", color: "#F97316", width: "40%" as const };
   if (passedCount === 3)
     return { label: "Fair", color: "#F59E0B", width: "60%" as const };
   if (passedCount === 4)
     return { label: "Strong", color: "#84CC16", width: "80%" as const };
   return { label: "Very Strong", color: "#10B981", width: "100%" as const };
 }, [passedCount, newPassword]);

  const isPasswordValid = ruleResults[0];

  // 🔥 Only show rules if:
  // - Password has been typed
  // - NOT all rules are passed yet
  // - User hasn't focused confirm password field
  const shouldShowRules = showRules && !allRulesPassed && !confirmFocused;

  const handleClose = () => {
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowRules(false);
    setConfirmFocused(false);
    onClose();
  };

  const handleChangePassword = async () => {
    setPasswordError("");

    if (!newPassword || !confirmPassword) {
      setPasswordError("Please fill in all fields");
      return;
    }

    if (!isPasswordValid) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      handleClose();

      Alert.alert(
        "✅ Password Updated",
        "Your password has been changed successfully.",
        [{ text: "OK" }],
      );
    } catch (error: any) {
      setPasswordError(error.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <View
          className="rounded-t-3xl"
          style={{ backgroundColor: colors.card }}
        >
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          >
            {/* Handle Bar */}
            <View className="items-center mb-4">
              <View
                className="w-12 h-1.5 rounded-full"
                style={{ backgroundColor: colors.border }}
              />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center">
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: `${colors.primary}20` }}
                >
                  <Ionicons
                    name="lock-closed"
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View>
                  <Text
                    className="text-2xl font-appFontBold"
                    style={{ color: colors.text }}
                  >
                    Change Password
                  </Text>
                  <Text
                    className="text-base font-appFont"
                    style={{ color: colors.textSecondary }}
                  >
                    Update your account password
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.background }}
              >
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {passwordError ? (
              <View
                className="rounded-xl p-4 mb-4 flex-row items-center"
                style={{ backgroundColor: `${colors.error}20` }}
              >
                <Ionicons name="alert-circle" size={22} color={colors.error} />
                <Text
                  className="text-base font-appFont ml-2 flex-1"
                  style={{ color: colors.error }}
                >
                  {passwordError}
                </Text>
              </View>
            ) : null}

            {/* New Password */}
            <View className="mb-2">
              <Text
                className="text-base font-appFont mb-2"
                style={{ color: colors.textSecondary }}
              >
                New Password
              </Text>
              <View
                className="flex-row items-center rounded-xl px-4"
                style={{
                  backgroundColor: colors.input,
                  borderWidth: 1,
                  borderColor:
                    newPassword.length > 0 && !isPasswordValid
                      ? colors.error
                      : newPassword.length > 0 && allRulesPassed
                        ? colors.success
                        : colors.inputBorder,
                }}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color={colors.textTertiary}
                />
                <TextInput
                  placeholder="Enter new password"
                  placeholderTextColor={colors.placeholder}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    setShowRules(text.length > 0);
                  }}
                  onFocus={() => {
                    setShowRules(newPassword.length > 0);
                    setConfirmFocused(false); // 🔥 Reset confirm focus
                  }}
                  secureTextEntry={!showNewPassword}
                  className="flex-1 py-4 px-3 font-appFont"
                  style={{ color: colors.text, fontSize: 16 }}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off" : "eye"}
                    size={22}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Strength Bar */}
            {strengthLevel && (
              <View className="mb-3">
                <View
                  className="h-2 rounded-full overflow-hidden mb-1"
                  style={{ backgroundColor: colors.border }}
                >
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: strengthLevel.width,
                      backgroundColor: strengthLevel.color,
                    }}
                  />
                </View>
                <Text
                  className="text-sm font-appFontBold"
                  style={{ color: strengthLevel.color }}
                >
                  {strengthLevel.label}
                </Text>
              </View>
            )}

            {/* 🔥 Password Rules - Only shows when not all rules passed AND confirm not focused */}
            {shouldShowRules && (
              <View
                className="rounded-xl p-4 mb-4"
                style={{ backgroundColor: colors.background }}
              >
                <Text
                  className="text-sm font-appFontBold mb-3 uppercase tracking-wide"
                  style={{ color: colors.textSecondary }}
                >
                  Password Requirements
                </Text>
                {PASSWORD_RULES.map((rule, index) => (
                  <View key={index} className="flex-row items-center mb-3">
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center mr-3"
                      style={{
                        backgroundColor: ruleResults[index]
                          ? `${colors.success}20`
                          : `${colors.error}15`,
                      }}
                    >
                      <Ionicons
                        name={ruleResults[index] ? "checkmark" : "close"}
                        size={14}
                        color={
                          ruleResults[index] ? colors.success : colors.error
                        }
                      />
                    </View>
                    <Text
                      className="text-base font-appFont"
                      style={{
                        color: ruleResults[index]
                          ? colors.success
                          : colors.textSecondary,
                      }}
                    >
                      {rule.label}
                    </Text>
                  </View>
                ))}

                {/* Progress */}
                <View
                  className="mt-2 pt-3"
                  style={{ borderTopWidth: 1, borderColor: colors.border }}
                >
                  <Text
                    className="text-sm font-appFont"
                    style={{ color: colors.textSecondary }}
                  >
                    {passedCount} of {PASSWORD_RULES.length} requirements met
                  </Text>
                </View>
              </View>
            )}

            {/* Confirm Password */}
            <View className="mb-6">
              <Text
                className="text-base font-appFont mb-2"
                style={{ color: colors.textSecondary }}
              >
                Confirm New Password
              </Text>
              <View
                className="flex-row items-center rounded-xl px-4"
                style={{
                  backgroundColor: colors.input,
                  borderWidth: 1,
                  borderColor:
                    confirmPassword.length > 0
                      ? newPassword === confirmPassword
                        ? colors.success
                        : colors.error
                      : colors.inputBorder,
                }}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color={colors.textTertiary}
                />
                <TextInput
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.placeholder}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  // 🔥 Hide rules when confirm password is focused
                  onFocus={() => setConfirmFocused(true)}
                  secureTextEntry={!showConfirmPassword}
                  className="flex-1 py-4 px-3 font-appFont"
                  style={{ color: colors.text, fontSize: 16 }}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={22}
                    color={colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>

              {/* Password Match Indicator */}
              {confirmPassword.length > 0 && (
                <View className="flex-row items-center mt-2">
                  <Ionicons
                    name={
                      newPassword === confirmPassword
                        ? "checkmark-circle"
                        : "close-circle"
                    }
                    size={18}
                    color={
                      newPassword === confirmPassword
                        ? colors.success
                        : colors.error
                    }
                  />
                  <Text
                    className="text-base font-appFont ml-1"
                    style={{
                      color:
                        newPassword === confirmPassword
                          ? colors.success
                          : colors.error,
                    }}
                  >
                    {newPassword === confirmPassword
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </Text>
                </View>
              )}
            </View>

            {/* Update Button */}
            <TouchableOpacity
              onPress={handleChangePassword}
              disabled={passwordLoading || !isPasswordValid}
              className="rounded-xl p-4 flex-row items-center justify-center"
              style={{
                backgroundColor:
                  isPasswordValid && !passwordLoading
                    ? colors.primary
                    : colors.border,
                opacity: passwordLoading ? 0.7 : 1,
              }}
              activeOpacity={0.8}
            >
              {passwordLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="save" size={22} color="white" />
                  <Text className="text-lg text-white font-appFontBold ml-2">
                    Update Password
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
