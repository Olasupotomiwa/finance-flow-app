import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from "react-native";
import { supabase } from "../../lib/supabse";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useTheme } from "@/context/ThemeContext";

interface PasswordStrength {
  hasMinLength: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { colors, effectiveTheme } = useTheme();

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

  // Calculate strength percentage
  const strengthPercentage =
    (Object.values(passwordStrength).filter(Boolean).length / 3) * 100;

  // Get strength color
  const getStrengthColor = () => {
    if (strengthPercentage === 100) return colors.success;
    if (strengthPercentage >= 66) return colors.warning;
    return colors.error;
  };

  const getStrengthText = () => {
    if (strengthPercentage === 100)
      return { text: "Strong", color: colors.success };
    if (strengthPercentage >= 66)
      return { text: "Medium", color: colors.warning };
    if (strengthPercentage > 0) return { text: "Weak", color: colors.error };
    return { text: "", color: "" };
  };

  async function handleSignUp() {
    if (!isPasswordValid) {
      return setErrorMsg("Please meet all password requirements");
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // CHECK IF EMAIL EXISTS IN PUBLIC.USERS
      const { data: existingUser } = await supabase
        .from("users")
        .select("email")
        .eq("email", email.trim())
        .maybeSingle();

      if (existingUser) {
        setLoading(false);
        return setErrorMsg(
          "This email is already registered. Please login or reset your password.",
        );
      }

      // Create the redirect URL
      const redirectUrl = Linking.createURL("/");

      // IF NO USER FOUND, PROCEED TO SIGN UP
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (signUpError) throw signUpError;

      if (data) {
        // Navigate to success page
        router.push("/auth/email-sent");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView>
        <StatusBar
          barStyle={
            effectiveTheme === "dark" ? "light-content" : "dark-content"
          }
          backgroundColor={colors.background}
        />
        <View className="flex-1 justify-center px-6">
          {/* Header */}
          <View className="items-center mb-8">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: colors.primary }}
            >
              <Ionicons name="person-add" size={40} color="white" />
            </View>
            <Text
              className="text-4xl font-bold mb-2"
              style={{ color: colors.text }}
            >
              Create Account
            </Text>
            <Text
              className="text-base text-center"
              style={{ color: colors.textSecondary }}
            >
              Sign up to get started with Finance Flow
            </Text>
          </View>

          {/* Error Message */}
          {errorMsg && (
            <View
              className="p-4 rounded-2xl mb-6 border flex-row items-center"
              style={{
                backgroundColor: `${colors.error}20`,
                borderColor: colors.error,
              }}
            >
              <Ionicons name="alert-circle" size={24} color={colors.error} />
              <Text
                className="text-base font-medium ml-3 flex-1"
                style={{ color: colors.error }}
              >
                {errorMsg}
              </Text>
            </View>
          )}

          {/* Email Input */}
          <View className="mb-4">
            <Text
              className="text-base font-semibold mb-2 ml-1"
              style={{ color: colors.text }}
            >
              Email Address
            </Text>
            <View
              className="rounded-2xl flex-row items-center px-4 border"
              style={{
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
              }}
            >
              <Ionicons
                name="mail-outline"
                size={22}
                color={colors.textTertiary}
              />
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor={colors.placeholder}
                className="flex-1 text-base p-4"
                style={{ color: colors.text }}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-3">
            <Text
              className="text-base font-semibold mb-2 ml-1"
              style={{ color: colors.text }}
            >
              Password
            </Text>
            <View
              className="rounded-2xl flex-row items-center px-4 border"
              style={{
                backgroundColor: colors.input,
                borderColor: colors.inputBorder,
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color={colors.textTertiary}
              />
              <TextInput
                placeholder="Create a password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showPassword}
                className="flex-1 text-base p-4"
                style={{ color: colors.text }}
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
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <View className="mb-4">
              {/* Strength Bar */}
              <View className="flex-row items-center mb-3">
                <View
                  className="flex-1 h-2 rounded-full overflow-hidden mr-3"
                  style={{ backgroundColor: colors.border }}
                >
                  <View
                    className="h-full"
                    style={{
                      width: `${strengthPercentage}%`,
                      backgroundColor: getStrengthColor(),
                    }}
                  />
                </View>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: getStrengthText().color }}
                >
                  {getStrengthText().text}
                </Text>
              </View>

              {/* Requirements Checklist */}
              <View
                className="rounded-xl p-3 space-y-2"
                style={{ backgroundColor: colors.card }}
              >
                <View className="flex-row items-center mb-2">
                  <Ionicons
                    name={
                      passwordStrength.hasMinLength
                        ? "checkmark-circle"
                        : "close-circle"
                    }
                    size={20}
                    color={
                      passwordStrength.hasMinLength
                        ? colors.success
                        : colors.textTertiary
                    }
                  />
                  <Text
                    className="ml-2 text-sm"
                    style={{
                      color: passwordStrength.hasMinLength
                        ? colors.successLight
                        : colors.textSecondary,
                    }}
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
                    color={
                      passwordStrength.hasNumber
                        ? colors.success
                        : colors.textTertiary
                    }
                  />
                  <Text
                    className="ml-2 text-sm"
                    style={{
                      color: passwordStrength.hasNumber
                        ? colors.successLight
                        : colors.textSecondary,
                    }}
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
                      passwordStrength.hasSpecialChar
                        ? colors.success
                        : colors.textTertiary
                    }
                  />
                  <Text
                    className="ml-2 text-sm"
                    style={{
                      color: passwordStrength.hasSpecialChar
                        ? colors.successLight
                        : colors.textSecondary,
                    }}
                  >
                    Contains a special character (!@#$%^&*)
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading || !isPasswordValid || !email}
            className={`py-5 rounded-2xl items-center shadow-lg ${
              loading || !isPasswordValid || !email ? "opacity-50" : ""
            }`}
            style={{ backgroundColor: colors.primary }}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center">
                <Text className="text-white font-bold text-lg mr-2">
                  Create Account
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity
            onPress={() => router.push("/")}
            className="mt-6 py-3"
          >
            <Text
              className="text-center text-base"
              style={{ color: colors.textSecondary }}
            >
              Already have an account?{" "}
              <Text className="font-bold" style={{ color: colors.primary }}>
                Log In
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Terms */}
          <View className="mt-8">
            <Text
              className="text-sm text-center leading-5"
              style={{ color: colors.textTertiary }}
            >
              By signing up, you agree to our{" "}
              <Text style={{ color: colors.primary }}>Terms of Service</Text>{" "}
              and <Text style={{ color: colors.primary }}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}