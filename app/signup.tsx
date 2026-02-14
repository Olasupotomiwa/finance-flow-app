import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
 
} from "react-native";
import { supabase } from "../lib/supabse"; 
import { useRouter } from "expo-router";

import * as Linking from "expo-linking";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. ADDED: State for the error message
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const router = useRouter();

  async function handleSignUp() {
    setLoading(true);
    setErrorMsg(null);

    try {
      // CHECK IF EMAIL EXISTS IN PUBLIC.USERS
      const { data: existingUser, error: checkError } = await supabase
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
      console.log("Redirect URL:", redirectUrl);

      // IF NO USER FOUND, PROCEED TO SIGN UP
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          emailRedirectTo: redirectUrl, // Add this!
        },
      });

      if (signUpError) throw signUpError;

      if (data) {
        Alert.alert("Success", "Check your email for the confirmation link!");
        router.replace("/");
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-gray-900 justify-center px-6">
      <Text className="text-3xl font-bold text-white mb-8 text-center">
        Create Account
      </Text>

      {/* 2. ADDED: Error Message Display Block */}
      {errorMsg && (
        <View className="bg-red-500/20 p-4 rounded-xl mb-6 border border-red-500">
          <Text className="text-red-500 text-center font-medium">
            {errorMsg}
          </Text>
        </View>
      )}

      <TextInput
        placeholder="Email"
        placeholderTextColor="#9ca3af"
        className="bg-gray-800 text-white p-4 rounded-xl mb-4"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#9ca3af"
        secureTextEntry
        className="bg-gray-800 text-white p-4 rounded-xl mb-6"
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        onPress={handleSignUp}
        disabled={loading}
        className={`bg-blue-600 py-4 rounded-xl items-center ${loading ? "opacity-70" : ""}`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">Sign Up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/")} className="mt-6">
        <Text className="text-gray-400 text-center">
          Already have an account?{" "}
          <Text className="text-blue-500 font-bold">Log In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
