import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../lib/supabse";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Create a state for the error message
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSignIn() {
    setErrorMsg(null); // Clear previous errors
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      // 2. Set the error message if login fails
      setErrorMsg(error.message);
    }
    setLoading(false);
  }

  return (
    <View className="flex-1 bg-gray-900 justify-center px-6">
      <Text className="text-3xl font-bold text-white mb-8">Sign In</Text>

      {/* 3. Render the error message conditionally */}
      {errorMsg && (
        <View className="bg-red-500/20 p-4 rounded-xl mb-6 border border-red-500">
          <Text className="text-red-500 text-center font-bold">{errorMsg}</Text>
        </View>
      )}

      <TextInput
        placeholder="Email"
        className="bg-gray-800 text-white p-4 rounded-xl mb-4"
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        className="bg-gray-800 text-white p-4 rounded-xl mb-6"
        onChangeText={setPassword}
      />

      <TouchableOpacity
        onPress={handleSignIn}
        className="bg-blue-600 py-4 rounded-xl items-center"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold">Sign In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
