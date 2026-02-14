import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { supabase } from "../../lib/supabse";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/context/Authcontext";

interface PasswordStrength {
  hasMinLength: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 
  const router = useRouter();

 
 

  // Password validation
  const checkPasswordStrength = (pwd: string): PasswordStrength => {
    return {
      hasMinLength: pwd.length >= 6,
      hasNumber: /\d/.test(pwd),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
  };

  const passwordStrength = checkPasswordStrength(password);
  const isPasswordValid =
    passwordStrength.hasMinLength &&
    passwordStrength.hasNumber &&
    passwordStrength.hasSpecialChar;

  const strengthPercentage =
    (Object.values(passwordStrength).filter(Boolean).length / 3) * 100;

  const getStrengthColor = () => {
    if (strengthPercentage === 100) return "bg-green-500";
    if (strengthPercentage >= 66) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStrengthText = () => {
    if (strengthPercentage === 100)
      return { text: "Strong", color: "text-green-500" };
    if (strengthPercentage >= 66)
      return { text: "Medium", color: "text-yellow-500" };
    if (strengthPercentage > 0) return { text: "Weak", color: "text-red-500" };
    return { text: "", color: "" };
  };

  async function handleResetPassword() {
    if (!isPasswordValid) {
      Toast.show({
        type: "error",
        text1: "Invalid Password",
        text2: "Please meet all password requirements",
        position: "top",
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Password Mismatch",
        text2: "Passwords do not match",
        position: "top",
      });
      return;
    }

    setLoading(true);

    try {
      // Get the stored recovery tokens
      const accessToken = await AsyncStorage.getItem("recovery_access_token");
      const refreshToken = await AsyncStorage.getItem("recovery_refresh_token");

      if (!accessToken || !refreshToken) {
        throw new Error("Invalid recovery session");
      }

      // Set the session with recovery tokens
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) throw sessionError;

      // Now update the password
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      // Clear the stored recovery tokens
      await AsyncStorage.removeItem("recovery_access_token");
      await AsyncStorage.removeItem("recovery_refresh_token");

      // Sign out the user after successful password reset
      await supabase.auth.signOut();

      Toast.show({
        type: "success",
        text1: "Password Reset Successful!",
        text2: "Please sign in with your new password",
        position: "top",
      });

      // Flag will be cleared automatically when component unmounts
      setTimeout(() => {
        router.replace("/auth/signin");
      }, 1500);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Reset Failed",
        text2: err.message || "Failed to reset password",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 justify-center py-8">
            {/* Header */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-4">
                <Ionicons name="lock-closed" size={40} color="white" />
              </View>
              <Text className="text-4xl font-bold text-white mb-2">
                Reset Password
              </Text>
              <Text className="text-gray-400 text-base text-center">
                Enter your new password
              </Text>
            </View>

            {/* New Password Input */}
            <View className="mb-3">
              <Text className="text-gray-300 text-base font-semibold mb-2 ml-1">
                New Password
              </Text>
              <View className="bg-gray-800 rounded-2xl flex-row items-center px-4 border border-gray-700">
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color="#9CA3AF"
                />
                <TextInput
                  placeholder="Enter new password"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showPassword}
                  className="flex-1 text-white text-base p-4"
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="p-2"
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <View className="mb-4">
                <View className="flex-row items-center mb-3">
                  <View className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden mr-3">
                    <View
                      className={`h-full ${getStrengthColor()} transition-all`}
                      style={{ width: `${strengthPercentage}%` }}
                    />
                  </View>
                  <Text
                    className={`text-sm font-semibold ${getStrengthText().color}`}
                  >
                    {getStrengthText().text}
                  </Text>
                </View>

                <View className="bg-gray-800 rounded-xl p-3 space-y-2">
                  <View className="flex-row items-center mb-2">
                    <Ionicons
                      name={
                        passwordStrength.hasMinLength
                          ? "checkmark-circle"
                          : "close-circle"
                      }
                      size={20}
                      color={
                        passwordStrength.hasMinLength ? "#10B981" : "#6B7280"
                      }
                    />
                    <Text
                      className={`ml-2 text-sm ${passwordStrength.hasMinLength ? "text-green-400" : "text-gray-400"}`}
                    >
                      At least 6 characters
                    </Text>
                  </View>

                  <View className="flex-row items-center mb-2">
                    <Ionicons
                      name={
                        passwordStrength.hasNumber
                          ? "checkmark-circle"
                          : "close-circle"
                      }
                      size={20}
                      color={passwordStrength.hasNumber ? "#10B981" : "#6B7280"}
                    />
                    <Text
                      className={`ml-2 text-sm ${passwordStrength.hasNumber ? "text-green-400" : "text-gray-400"}`}
                    >
                      Contains a number (0-9)
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Ionicons
                      name={
                        passwordStrength.hasSpecialChar
                          ? "checkmark-circle"
                          : "close-circle"
                      }
                      size={20}
                      color={
                        passwordStrength.hasSpecialChar ? "#10B981" : "#6B7280"
                      }
                    />
                    <Text
                      className={`ml-2 text-sm ${passwordStrength.hasSpecialChar ? "text-green-400" : "text-gray-400"}`}
                    >
                      Contains a special character (!@#$%^&*)
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Confirm Password Input */}
            <View className="mb-6">
              <Text className="text-gray-300 text-base font-semibold mb-2 ml-1">
                Confirm Password
              </Text>
              <View className="bg-gray-800 rounded-2xl flex-row items-center px-4 border border-gray-700">
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color="#9CA3AF"
                />
                <TextInput
                  placeholder="Confirm new password"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showConfirmPassword}
                  className="flex-1 text-white text-base p-4"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-2"
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={22}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <View className="flex-row items-center mt-2 ml-1">
                  <Ionicons name="close-circle" size={16} color="#EF4444" />
                  <Text className="text-red-500 text-sm ml-1">
                    Passwords do not match
                  </Text>
                </View>
              )}
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={
                loading || !isPasswordValid || password !== confirmPassword
              }
              className={`bg-blue-600 py-5 rounded-2xl items-center shadow-lg ${
                loading || !isPasswordValid || password !== confirmPassword
                  ? "opacity-50"
                  : ""
              }`}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center">
                  <Text className="text-white font-bold text-lg mr-2">
                    Reset Password
                  </Text>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
